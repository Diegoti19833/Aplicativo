# PROMPT — Sistema de Pedidos na Loja (Mobile + Web Admin)

## Contexto do Projeto

Aplicativo de treinamento gamificado com:
- **Mobile**: React Native (Expo), arquivo único `App.js` + hooks em `mobile/hooks/`
- **Web Admin**: React 19 + Vite + TailwindCSS, em `web/src/`
- **Banco**: Supabase (PostgreSQL) com RLS, arquivos SQL em `sql/`

---

## Objetivo

Implementar um **sistema completo de pedidos** na loja. Toda vez que um usuário comprar um item, deve ser gerado automaticamente um pedido com status rastreável. O admin acompanha e atualiza os pedidos pelo painel web. O usuário acompanha seus pedidos pelo app mobile.

---

## 1. BANCO DE DADOS — `sql/23_order_status.sql`

**Crie este arquivo novo.** Não modifique nenhum arquivo SQL existente.

### 1.1 Adicionar colunas de pedido em `user_purchases`

```sql
ALTER TABLE user_purchases
  ADD COLUMN IF NOT EXISTS order_status VARCHAR(20)
    NOT NULL DEFAULT 'pendente'
    CHECK (order_status IN ('pendente', 'processando', 'enviado', 'entregue', 'cancelado')),

  ADD COLUMN IF NOT EXISTS order_notes TEXT,

  ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(100),

  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,

  ADD COLUMN IF NOT EXISTS delivered_by UUID REFERENCES users(id),

  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Índice para filtrar por status (admin vai usar muito)
CREATE INDEX IF NOT EXISTS idx_user_purchases_order_status
  ON user_purchases(order_status);

CREATE INDEX IF NOT EXISTS idx_user_purchases_status_date
  ON user_purchases(order_status, purchase_date DESC);
```

### 1.2 Função `update_order_status` (somente admin/gerente)

```sql
CREATE OR REPLACE FUNCTION update_order_status(
  purchase_id_param UUID,
  new_status_param VARCHAR(20),
  notes_param TEXT DEFAULT NULL,
  tracking_code_param VARCHAR(100) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  purchase_record RECORD;
  admin_role VARCHAR(50);
BEGIN
  -- Verifica se o chamador é admin ou gerente
  SELECT role INTO admin_role FROM users WHERE id = auth.uid();
  IF admin_role NOT IN ('admin', 'gerente') THEN
    RETURN json_build_object('success', false, 'error', 'Acesso negado');
  END IF;

  -- Busca o pedido
  SELECT * INTO purchase_record
  FROM user_purchases WHERE id = purchase_id_param;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;

  -- Não permite alterar pedido já cancelado
  IF purchase_record.order_status = 'cancelado' AND new_status_param <> 'pendente' THEN
    RETURN json_build_object('success', false, 'error', 'Pedido cancelado não pode ser alterado');
  END IF;

  -- Atualiza status
  UPDATE user_purchases SET
    order_status      = new_status_param,
    order_notes       = COALESCE(notes_param, order_notes),
    tracking_code     = COALESCE(tracking_code_param, tracking_code),
    delivered_at      = CASE WHEN new_status_param = 'entregue' THEN NOW() ELSE delivered_at END,
    delivered_by      = CASE WHEN new_status_param = 'entregue' THEN auth.uid() ELSE delivered_by END,
    status_updated_at = NOW()
  WHERE id = purchase_id_param;

  RETURN json_build_object(
    'success', true,
    'message', 'Status atualizado para ' || new_status_param,
    'purchase_id', purchase_id_param,
    'new_status', new_status_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 1.3 Função `cancel_order` (usuário cancela próprio pedido pendente — devolve moedas)

```sql
CREATE OR REPLACE FUNCTION cancel_order(
  purchase_id_param UUID
)
RETURNS JSON AS $$
DECLARE
  purchase_record RECORD;
BEGIN
  -- Busca o pedido garantindo que é do usuário atual
  SELECT * INTO purchase_record
  FROM user_purchases
  WHERE id = purchase_id_param AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;

  -- Só pode cancelar se estiver pendente
  IF purchase_record.order_status <> 'pendente' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Apenas pedidos com status "pendente" podem ser cancelados'
    );
  END IF;

  -- Cancela o pedido
  UPDATE user_purchases SET
    order_status      = 'cancelado',
    is_active         = false,
    status_updated_at = NOW()
  WHERE id = purchase_id_param;

  -- Devolve as moedas ao usuário
  UPDATE users SET
    coins = coins + purchase_record.total_price
  WHERE id = purchase_record.user_id;

  -- Restaura o estoque se o item tiver limite
  UPDATE store_items SET
    stock_quantity = stock_quantity + purchase_record.quantity
  WHERE id = purchase_record.item_id
    AND stock_quantity IS NOT NULL;

  RETURN json_build_object(
    'success', true,
    'message', 'Pedido cancelado. ' || purchase_record.total_price || ' moedas devolvidas.',
    'coins_refunded', purchase_record.total_price
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 1.4 Função `get_user_orders` (histórico do usuário mobile)

```sql
CREATE OR REPLACE FUNCTION get_user_orders(user_id_param UUID)
RETURNS JSON AS $$
BEGIN
  -- Usuário só pode ver seus próprios pedidos
  IF auth.uid() <> user_id_param THEN
    RETURN '[]'::json;
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(
      json_build_object(
        'id',               up.id,
        'order_status',     up.order_status,
        'order_notes',      up.order_notes,
        'tracking_code',    up.tracking_code,
        'quantity',         up.quantity,
        'unit_price',       up.unit_price,
        'total_price',      up.total_price,
        'purchase_date',    up.purchase_date,
        'delivered_at',     up.delivered_at,
        'status_updated_at', up.status_updated_at,
        'item', json_build_object(
          'id',          si.id,
          'name',        si.name,
          'description', si.description,
          'icon',        si.icon,
          'item_type',   si.item_type,
          'rarity',      si.rarity
        )
      ) ORDER BY up.purchase_date DESC
    ), '[]'::json)
    FROM user_purchases up
    JOIN store_items si ON si.id = up.item_id
    WHERE up.user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 1.5 Função `get_all_orders` (painel admin web)

```sql
CREATE OR REPLACE FUNCTION get_all_orders(
  status_filter_param VARCHAR(20) DEFAULT NULL,
  limit_param INTEGER DEFAULT 50,
  offset_param INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  admin_role VARCHAR(50);
BEGIN
  SELECT role INTO admin_role FROM users WHERE id = auth.uid();
  IF admin_role NOT IN ('admin', 'gerente') THEN
    RETURN '[]'::json;
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(
      json_build_object(
        'id',               up.id,
        'order_status',     up.order_status,
        'order_notes',      up.order_notes,
        'tracking_code',    up.tracking_code,
        'quantity',         up.quantity,
        'unit_price',       up.unit_price,
        'total_price',      up.total_price,
        'purchase_date',    up.purchase_date,
        'delivered_at',     up.delivered_at,
        'status_updated_at', up.status_updated_at,
        'user', json_build_object(
          'id',    u.id,
          'name',  u.name,
          'email', u.email,
          'role',  u.role
        ),
        'item', json_build_object(
          'id',        si.id,
          'name',      si.name,
          'icon',      si.icon,
          'item_type', si.item_type,
          'rarity',    si.rarity
        )
      ) ORDER BY up.purchase_date DESC
    ), '[]'::json)
    FROM user_purchases up
    JOIN users u ON u.id = up.user_id
    JOIN store_items si ON si.id = up.item_id
    WHERE (status_filter_param IS NULL OR up.order_status = status_filter_param)
    LIMIT limit_param
    OFFSET offset_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 1.6 Função `get_orders_stats` (contagem por status para badge do admin)

```sql
CREATE OR REPLACE FUNCTION get_orders_stats()
RETURNS JSON AS $$
DECLARE
  admin_role VARCHAR(50);
BEGIN
  SELECT role INTO admin_role FROM users WHERE id = auth.uid();
  IF admin_role NOT IN ('admin', 'gerente') THEN
    RETURN '{}'::json;
  END IF;

  RETURN (
    SELECT json_build_object(
      'total',        COUNT(*),
      'pendente',     COUNT(*) FILTER (WHERE order_status = 'pendente'),
      'processando',  COUNT(*) FILTER (WHERE order_status = 'processando'),
      'enviado',      COUNT(*) FILTER (WHERE order_status = 'enviado'),
      'entregue',     COUNT(*) FILTER (WHERE order_status = 'entregue'),
      'cancelado',    COUNT(*) FILTER (WHERE order_status = 'cancelado')
    )
    FROM user_purchases
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 1.7 RLS: usuários leem só seus pedidos, admins leem tudo

As funções acima já usam `SECURITY DEFINER` com verificação interna de `auth.uid()`, portanto as políticas RLS da tabela `user_purchases` **não precisam ser alteradas**. As funções são o ponto de acesso seguro.

---

## 2. MOBILE — `mobile/hooks/useStore.js`

Adicione ao hook existente (sem remover nada do que já existe):

### 2.1 Novo estado e funções

```js
// Novos estados no topo do hook (depois dos existentes):
const [orders, setOrders] = useState([])
const [loadingOrders, setLoadingOrders] = useState(false)

// Nova função: buscar pedidos do usuário
const fetchOrders = async () => {
  if (!user) return
  try {
    setLoadingOrders(true)
    const { data, error } = await supabase.rpc('get_user_orders', {
      user_id_param: user.id
    })
    if (error) throw error
    setOrders(typeof data === 'string' ? JSON.parse(data) : (data || []))
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err)
  } finally {
    setLoadingOrders(false)
  }
}

// Nova função: cancelar pedido pendente
const cancelOrder = async (purchaseId) => {
  try {
    const { data, error } = await supabase.rpc('cancel_order', {
      purchase_id_param: purchaseId
    })
    if (error) throw error
    const result = typeof data === 'string' ? JSON.parse(data) : data
    if (result.success) {
      await fetchOrders()
      await fetchStoreItems() // atualiza moedas e inventário
    }
    return result
  } catch (err) {
    console.error('Erro ao cancelar pedido:', err)
    return { success: false, error: err.message }
  }
}

// Helpers
const getPendingOrdersCount = () =>
  orders.filter(o => o.order_status === 'pendente').length
```

### 2.2 Adicionar ao `useEffect` e ao retorno do hook

No `useEffect` existente (que já chama `fetchStoreItems`), adicione também `fetchOrders()`.

No `return` do hook, adicione:
```js
orders,
loadingOrders,
fetchOrders,
cancelOrder,
getPendingOrdersCount,
```

---

## 3. MOBILE — Nova tela `MeusPedidosScreen` em `App.js`

Adicione esta função dentro do `App.js`, **antes** da função `AppContent`:

```jsx
function MeusPedidosScreen({ navigate }) {
  const { orders, loadingOrders, cancelOrder, fetchOrders } = useStore()

  // Mapeamento de status para exibição
  const statusConfig = {
    pendente:     { label: 'Pendente',      bg: '#FEF3C7', color: '#D97706' },
    processando:  { label: 'Processando',   bg: '#DBEAFE', color: '#2563EB' },
    enviado:      { label: 'Enviado',       bg: '#E9D5FF', color: '#7C3AED' },
    entregue:     { label: 'Entregue',      bg: '#D1FAE5', color: '#059669' },
    cancelado:    { label: 'Cancelado',     bg: '#FEE2E2', color: '#DC2626' },
  }

  const handleCancel = async (order) => {
    Alert.alert(
      'Cancelar pedido',
      `Deseja cancelar o pedido de "${order.item?.name}"? As moedas serão devolvidas.`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelOrder(order.id)
            if (result.success) {
              Alert.alert('Pedido cancelado', result.message)
            } else {
              Alert.alert('Erro', result.error)
            }
          }
        }
      ]
    )
  }

  if (loadingOrders) {
    return (
      <SafeAreaView style={styles.containerAlt}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.subtitle}>Carregando pedidos...</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.containerAlt}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Meus Pedidos</Text>
          <Text style={styles.subtitle}>{orders.length} pedido(s) no total</Text>
        </View>

        {orders.map((order) => {
          const cfg = statusConfig[order.order_status] || statusConfig.pendente
          const date = new Date(order.purchase_date).toLocaleDateString('pt-BR')
          return (
            <View key={order.id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { fontSize: 16 }]}>
                    {order.item?.icon ? `${order.item.icon} ` : ''}{order.item?.name}
                  </Text>
                  <Text style={styles.subtitle}>
                    Qtd: {order.quantity} · {order.total_price} moedas
                  </Text>
                  <Text style={[styles.subtitle, { fontSize: 12 }]}>Comprado em {date}</Text>
                  {order.tracking_code && (
                    <Text style={[styles.subtitle, { fontSize: 12 }]}>
                      Rastreio: {order.tracking_code}
                    </Text>
                  )}
                  {order.order_notes && (
                    <Text style={[styles.subtitle, { fontSize: 12, fontStyle: 'italic' }]}>
                      Obs: {order.order_notes}
                    </Text>
                  )}
                  {order.delivered_at && (
                    <Text style={[styles.subtitle, { fontSize: 12, color: '#059669' }]}>
                      Entregue em {new Date(order.delivered_at).toLocaleDateString('pt-BR')}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  {/* Badge de status */}
                  <View style={{
                    backgroundColor: cfg.bg,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12
                  }}>
                    <Text style={{ color: cfg.color, fontWeight: '700', fontSize: 12 }}>
                      {cfg.label}
                    </Text>
                  </View>
                  {/* Botão cancelar só se pendente */}
                  {order.order_status === 'pendente' && (
                    <Pressable
                      style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                      onPress={() => handleCancel(order)}
                    >
                      <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '600' }}>Cancelar</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          )
        })}

        {orders.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.subtitle}>Você ainda não fez nenhuma compra.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
```

---

## 4. MOBILE — Atualizar `LojaScreen` em `App.js`

### 4.1 Importar `getPendingOrdersCount` no hook

Na linha onde o hook é desestruturado dentro de `LojaScreen`:
```js
const { items, loading, purchaseItem, hasItem, canAffordItem, getPendingOrdersCount } = useStore()
```

`LojaScreen` também deve receber `navigate` como prop:
```js
function LojaScreen({ navigate }) {
```

### 4.2 Adicionar botão "Meus Pedidos" no topo da tela

Logo após a View do saldo de moedas (que exibe `userData?.coins`), adicione:

```jsx
{/* Botão Meus Pedidos com badge de pendentes */}
<Pressable
  onPress={() => navigate('meus-pedidos')}
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    marginTop: 8
  }}
>
  <Text style={{ color: '#1D4ED8', fontWeight: '600' }}>Ver Meus Pedidos</Text>
  {getPendingOrdersCount() > 0 && (
    <View style={{
      backgroundColor: '#DC2626',
      borderRadius: 12,
      minWidth: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6
    }}>
      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
        {getPendingOrdersCount()}
      </Text>
    </View>
  )}
</Pressable>
```

### 4.3 Após compra bem-sucedida, oferecer ver pedidos

Na função `handlePurchase`, substitua o `Alert.alert` de sucesso por:
```js
if (result.success) {
  Alert.alert(
    'Compra realizada!',
    `Você comprou ${item.name} por ${item.price} moedas.\nAcompanhe seu pedido na seção "Meus Pedidos".`,
    [
      { text: 'Ver Pedidos', onPress: () => navigate('meus-pedidos') },
      { text: 'Continuar', style: 'cancel' }
    ]
  )
}
```

---

## 5. MOBILE — Adicionar rota `meus-pedidos` em `AppContent`

Em `AppContent`, onde estão os outros `{route === '...' && <...Screen />}`, adicione:
```jsx
{route === 'meus-pedidos' && <MeusPedidosScreen navigate={goto} />}
```

E atualize a chamada de `LojaScreen` para passar `navigate`:
```jsx
{route === 'loja' && <LojaScreen navigate={goto} />}
```

---

## 6. WEB ADMIN — `web/src/services/adminDb.js`

Adicione ao objeto `AdminDb` exportado (dentro do `export const AdminDb = { ... }`):

```js
orders: {
  // Lista pedidos com filtro opcional de status
  list: async ({ status = null, limit = 50, offset = 0 } = {}) => {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('get_all_orders', {
      status_filter_param: status,
      limit_param: limit,
      offset_param: offset,
    })
    if (error) throw error
    return typeof data === 'string' ? JSON.parse(data) : (data || [])
  },

  // Atualiza status de um pedido
  updateStatus: async ({ purchaseId, status, notes = null, trackingCode = null }) => {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('update_order_status', {
      purchase_id_param: purchaseId,
      new_status_param: status,
      notes_param: notes,
      tracking_code_param: trackingCode,
    })
    if (error) throw error
    const result = typeof data === 'string' ? JSON.parse(data) : data
    if (!result?.success) throw new Error(result?.error || 'Erro ao atualizar pedido')
    return result
  },

  // Estatísticas de pedidos por status
  stats: async () => {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('get_orders_stats')
    if (error) throw error
    return typeof data === 'string' ? JSON.parse(data) : (data || {})
  },
},
```

---

## 7. WEB ADMIN — `web/src/components/admin/AdminLoja.jsx`

### 7.1 Novos imports (adicione ao topo)

```jsx
import { Truck, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
```

### 7.2 Novos estados (adicione no início do componente)

```jsx
const [orders, setOrders] = useState([])
const [orderStats, setOrderStats] = useState({})
const [statusFilter, setStatusFilter] = useState(null)  // null = todos
const [selectedOrder, setSelectedOrder] = useState(null) // modal de atualização
const [orderForm, setOrderForm] = useState({ status: '', notes: '', trackingCode: '' })
const [updatingOrder, setUpdatingOrder] = useState(false)
```

### 7.3 Atualizar `loadData`

```jsx
const loadData = async () => {
  try {
    setLoading(true)
    const [itemsData, purchasesData, ordersData, statsData] = await Promise.all([
      AdminDb.storeItems.list().catch(() => []),
      AdminDb.purchases.list().catch(() => []),
      AdminDb.orders.list().catch(() => []),
      AdminDb.orders.stats().catch(() => ({})),
    ])
    setItems(itemsData)
    setPurchases(purchasesData)
    setOrders(ordersData)
    setOrderStats(statsData)
  } catch (e) {
    console.error('Erro:', e)
  } finally {
    setLoading(false)
  }
}
```

### 7.4 Função de atualização de status

```jsx
const handleUpdateOrderStatus = async (e) => {
  e.preventDefault()
  if (!selectedOrder || !orderForm.status) return
  try {
    setUpdatingOrder(true)
    await AdminDb.orders.updateStatus({
      purchaseId: selectedOrder.id,
      status: orderForm.status,
      notes: orderForm.notes || null,
      trackingCode: orderForm.trackingCode || null,
    })
    setSelectedOrder(null)
    setOrderForm({ status: '', notes: '', trackingCode: '' })
    loadData()
  } catch (e) {
    alert('Erro ao atualizar pedido: ' + e.message)
  } finally {
    setUpdatingOrder(false)
  }
}

// Filtrar pedidos por status selecionado
const filteredOrders = statusFilter
  ? orders.filter(o => o.order_status === statusFilter)
  : orders
```

### 7.5 Adicionar terceira aba "Pedidos" na barra de navegação

Junto aos botões existentes de "Itens" e "Histórico de Compras", adicione:
```jsx
<button
  onClick={() => setActiveView('orders')}
  style={{
    padding: '8px 16px', borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: activeView === 'orders' ? '#0047AB' : '#fff',
    color: activeView === 'orders' ? '#fff' : '#374151',
    cursor: 'pointer', fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 6
  }}
>
  Pedidos
  {/* Badge de pendentes */}
  {(orderStats.pendente || 0) > 0 && (
    <span style={{
      background: '#DC2626', color: '#fff',
      borderRadius: 12, padding: '1px 7px', fontSize: 11, fontWeight: 700
    }}>
      {orderStats.pendente}
    </span>
  )}
</button>
```

### 7.6 View de Pedidos (`activeView === 'orders'`)

Adicione esta view no JSX, junto com as views de 'items' e 'purchases':

```jsx
{activeView === 'orders' && (
  <div>
    {/* Resumo por status */}
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
      {[
        { key: null,          label: 'Todos',        color: '#374151', bg: '#F3F4F6' },
        { key: 'pendente',    label: 'Pendente',     color: '#D97706', bg: '#FEF3C7' },
        { key: 'processando', label: 'Processando',  color: '#2563EB', bg: '#DBEAFE' },
        { key: 'enviado',     label: 'Enviado',      color: '#7C3AED', bg: '#E9D5FF' },
        { key: 'entregue',    label: 'Entregue',     color: '#059669', bg: '#D1FAE5' },
        { key: 'cancelado',   label: 'Cancelado',    color: '#DC2626', bg: '#FEE2E2' },
      ].map(s => (
        <button
          key={String(s.key)}
          onClick={() => setStatusFilter(s.key)}
          style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: statusFilter === s.key ? s.color : s.bg,
            color: statusFilter === s.key ? '#fff' : s.color,
            fontWeight: 600, fontSize: 13,
            outline: statusFilter === s.key ? `2px solid ${s.color}` : 'none'
          }}
        >
          {s.label}
          {s.key && orderStats[s.key] > 0 && ` (${orderStats[s.key]})`}
          {s.key === null && ` (${orderStats.total || 0})`}
        </button>
      ))}
    </div>

    {/* Tabela de pedidos */}
    <div className="card" style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6B7280', fontWeight: 600 }}>Usuário</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6B7280', fontWeight: 600 }}>Item</th>
            <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6B7280', fontWeight: 600 }}>Qtd</th>
            <th style={{ textAlign: 'right', padding: '10px 12px', color: '#6B7280', fontWeight: 600 }}>Preço</th>
            <th style={{ textAlign: 'left', padding: '10px 12px', color: '#6B7280', fontWeight: 600 }}>Data</th>
            <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6B7280', fontWeight: 600 }}>Status</th>
            <th style={{ textAlign: 'center', padding: '10px 12px', color: '#6B7280', fontWeight: 600 }}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => {
            const statusColors = {
              pendente:    { bg: '#FEF3C7', color: '#D97706' },
              processando: { bg: '#DBEAFE', color: '#2563EB' },
              enviado:     { bg: '#E9D5FF', color: '#7C3AED' },
              entregue:    { bg: '#D1FAE5', color: '#059669' },
              cancelado:   { bg: '#FEE2E2', color: '#DC2626' },
            }
            const sc = statusColors[order.order_status] || { bg: '#F3F4F6', color: '#374151' }
            return (
              <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 500 }}>{order.user?.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{order.user?.email}</div>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div>{order.item?.icon} {order.item?.name}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{order.item?.item_type}</div>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>{order.quantity}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{order.total_price} 🪙</td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#6B7280' }}>
                  {new Date(order.purchase_date).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <span style={{
                    background: sc.bg, color: sc.color,
                    padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700
                  }}>
                    {order.order_status}
                  </span>
                  {order.tracking_code && (
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                      #{order.tracking_code}
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  {order.order_status !== 'cancelado' && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setOrderForm({
                          status: order.order_status,
                          notes: order.order_notes || '',
                          trackingCode: order.tracking_code || ''
                        })
                      }}
                      style={{
                        background: '#0047AB', color: '#fff',
                        border: 'none', padding: '5px 12px',
                        borderRadius: 6, cursor: 'pointer', fontSize: 13
                      }}
                    >
                      Atualizar
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {filteredOrders.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
          Nenhum pedido {statusFilter ? `com status "${statusFilter}"` : 'encontrado'}
        </div>
      )}
    </div>
  </div>
)}
```

### 7.7 Modal de atualização de status

Adicione fora do JSX principal (antes do último `</div>` de fechamento do return):

```jsx
{/* Modal: Atualizar status do pedido */}
{selectedOrder && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  }}>
    <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
      <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Atualizar Pedido</h3>

      <div style={{ marginBottom: 12, fontSize: 14, color: '#374151' }}>
        <strong>{selectedOrder.user?.name}</strong> · {selectedOrder.item?.icon} {selectedOrder.item?.name}
      </div>

      <form onSubmit={handleUpdateOrderStatus} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Status do Pedido</label>
          <select
            value={orderForm.status}
            onChange={e => setOrderForm({ ...orderForm, status: e.target.value })}
            required
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
          >
            <option value="pendente">Pendente</option>
            <option value="processando">Processando</option>
            <option value="enviado">Enviado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Código de Rastreio (opcional)</label>
          <input
            value={orderForm.trackingCode}
            onChange={e => setOrderForm({ ...orderForm, trackingCode: e.target.value })}
            placeholder="Ex: BR123456789"
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Observação para o usuário (opcional)</label>
          <textarea
            value={orderForm.notes}
            onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
            placeholder="Ex: Será entregue na sexta-feira."
            rows={3}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            type="submit"
            disabled={updatingOrder}
            style={{ flex: 1, background: '#059669', color: '#fff', border: 'none', padding: 12, borderRadius: 8, cursor: 'pointer', fontWeight: 600, opacity: updatingOrder ? 0.6 : 1 }}
          >
            {updatingOrder ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => { setSelectedOrder(null); setOrderForm({ status: '', notes: '', trackingCode: '' }) }}
            style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', padding: 12, borderRadius: 8, cursor: 'pointer' }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

---

## 8. ATENÇÃO — Execute no Supabase

Após implementar tudo, execute este arquivo no SQL Editor do Supabase:
```
sql/23_order_status.sql
```

Isso vai adicionar as colunas e criar as funções necessárias. **Pedidos já existentes** vão receber `order_status = 'pendente'` automaticamente (pelo valor padrão do ALTER TABLE ... DEFAULT 'pendente').

---

## 9. Resumo do que implementar

| # | Onde | O que fazer |
|---|------|-------------|
| 1 | `sql/23_order_status.sql` | Criar arquivo com ALTER TABLE + 5 funções SQL |
| 2 | `mobile/hooks/useStore.js` | Adicionar estados `orders`, funções `fetchOrders`, `cancelOrder`, `getPendingOrdersCount` |
| 3 | `mobile/App.js` | Criar `MeusPedidosScreen` com badges de status e botão cancelar |
| 4 | `mobile/App.js` | Atualizar `LojaScreen` para receber `navigate`, botão "Meus Pedidos" com badge, alert pós-compra com atalho |
| 5 | `mobile/App.js` | Adicionar rota `meus-pedidos` em `AppContent` |
| 6 | `web/src/services/adminDb.js` | Adicionar `AdminDb.orders` com `list`, `updateStatus`, `stats` |
| 7 | `web/src/components/admin/AdminLoja.jsx` | Adicionar aba "Pedidos", tabela com filtros por status, modal de atualização |

---

## Paleta de cores dos status (use consistente em mobile e web)

| Status | Fundo | Texto | Significado |
|--------|-------|-------|-------------|
| `pendente` | `#FEF3C7` | `#D97706` | Compra realizada, aguardando processamento |
| `processando` | `#DBEAFE` | `#2563EB` | Admin está separando/preparando |
| `enviado` | `#E9D5FF` | `#7C3AED` | Item a caminho do usuário |
| `entregue` | `#D1FAE5` | `#059669` | Recebido com sucesso |
| `cancelado` | `#FEE2E2` | `#DC2626` | Cancelado (moedas já devolvidas) |
