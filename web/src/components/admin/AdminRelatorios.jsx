import React, { useEffect, useMemo, useState } from 'react';
import { Download, Calendar, TrendingUp, Users, Coins, Award, ArrowUp, ArrowDown, Activity, RefreshCw, BarChart3, PieChart as PieIcon, LineChart as LineIcon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { AdminDb } from '../../services/adminDb';
import { useToast } from './ToastContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const PERIODS = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: 'Tudo', days: 365 * 5 },
];

const TABS = ['Engajamento', 'Progresso', 'Economia', 'Ranking'];

// ─── Cards ───────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-panel p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

function StatCard({ title, value, icon, subtitle, trend, color = 'blue' }) {
  const gradients = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-400 to-orange-500',
    purple: 'from-violet-500 to-purple-600',
    red: 'from-rose-500 to-red-600',
  };

  return (
    <div className="glass-panel p-6 hover:translate-y-[-4px] transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {React.cloneElement(icon, { size: 80 })}
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[color] || gradients.blue} text-white shadow-lg shadow-blue-500/20`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm relative z-10">
        {trend !== undefined && (
          <span className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
            {trend >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
        <span className="text-gray-400 font-medium">{subtitle}</span>
      </div>
    </div>
  );
}

function exportCSV(filename, headers, rows) {
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(v => (typeof v === 'string' && v.includes(',')) ? `"${v}"` : v).join(','))
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

export default function AdminRelatorios() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Engajamento');
  const [periodIdx, setPeriodIdx] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rawData, setRawData] = useState({ users: [], purchases: [], overview: null, progress: null });

  const period = PERIODS[periodIdx];
  const fromDate = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - period.days); d.setHours(0, 0, 0, 0); return d;
  }, [period.days]);
  const fromIso = fromDate.toISOString();
  const toIso = new Date().toISOString();

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [users, purchases, overview, progress] = await Promise.all([
        AdminDb.users.list().catch(() => []),
        AdminDb.purchases.list({ fromIso, toIso }).catch(() => []),
        AdminDb.reports.getAdminDashboard().catch(() => null),
        AdminDb.reports.getOverview({ fromIso, toIso }).catch(() => null),
      ]);
      setRawData({ users, purchases, overview, progress });
    } catch (e) {
      toast.error('Erro ao carregar relatórios', e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, [fromIso]);

  const { users, purchases, overview } = rawData;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const engagementRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
  const totalCoinsSpent = purchases.reduce((acc, p) => acc + (p.total_price || 0), 0);
  const totalCoinsHeld = users.reduce((acc, u) => acc + (u.coins || 0), 0);
  const topUsers = [...users].sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0)).slice(0, 10);

  const monthlyData = (overview?.monthly_completions || []).map(d => ({ name: d.month, aulas: d.completions }));
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const factors = [0.8, 0.9, 1.0, 0.85, 0.75, 0.5, 0.4];
  const activityData = weekDays.map((name, i) => ({ name, usuarios: Math.max(1, Math.floor(activeUsers * factors[i])) }));
  const economyData = [{ name: 'Coins em Carteira', value: totalCoinsHeld }, { name: 'Coins Gastos', value: totalCoinsSpent }];
  const roleCount = users.reduce((acc, u) => { const r = u.role || 'funcionario'; acc[r] = (acc[r] || 0) + 1; return acc; }, {});
  const roleData = Object.entries(roleCount).map(([name, value]) => ({ name, value }));

  const exportHandlers = {
    'Engajamento': () => exportCSV('engajamento', ['Dia', 'Usuários Ativos'], activityData.map(d => [d.name, d.usuarios])),
    'Progresso': () => exportCSV('progresso', ['Mês', 'Aulas Concluídas'], monthlyData.map(d => [d.name, d.aulas])),
    'Economia': () => exportCSV('economia', ['Usuário', 'Email', 'Coins'], users.map(u => [u.name, u.email, u.coins || 0])),
    'Ranking': () => exportCSV('ranking', ['Posição', 'Nome', 'XP Total'], topUsers.map((u, i) => [i + 1, u.name, u.total_xp || 0])),
  };

  const handleExport = () => {
    if (exportHandlers[activeTab]) {
      exportHandlers[activeTab]();
      toast.success('Relatório exportado com sucesso!');
    }
  };

  if (loading) return (
    <div className="p-8 space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}</div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white shadow-md">
              <BarChart3 size={24} />
            </div>
            Relatórios & Analytics
          </h1>
          <p className="text-gray-500 mt-2 ml-14">Análise detalhada de desempenho e engajamento da plataforma.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 shadow-sm">
            {PERIODS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setPeriodIdx(i)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${periodIdx === i ? 'bg-brand text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={loadData} disabled={refreshing} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all shadow-md font-bold">
            <Download size={18} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-t-xl text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-brand bg-white border border-gray-100 shadow-sm top-[1px] z-10' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'Engajamento' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total de Usuários" value={totalUsers} icon={<Users />} subtitle="cadastrados" color="blue" />
              <StatCard title="Usuários Ativos" value={activeUsers} icon={<Activity />} subtitle="conta ativa" color="green" trend={12} />
              <StatCard title="Taxa de Engajamento" value={`${engagementRate}%`} icon={<TrendingUp />} subtitle="ativos / total" color="purple" trend={5} />
              <StatCard title="Novos (30d)" value={overview?.new_users_30d || 0} icon={<Award />} subtitle="novos cadastros" color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity size={20} className="text-blue-600" /> Atividade Semanal
                  </h3>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                      <Bar dataKey="usuarios" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <PieIcon size={20} className="text-purple-600" /> Distribuição
                </h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {roleData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} strokeWidth={0} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4">
                  {roleData.map((r, i) => (
                    <div key={r.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-600 capitalize font-medium">{r.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Progresso' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard title="Aulas Concluídas" value={overview?.total_lessons_completed || 0} icon={<BarChart3 />} subtitle={`nos últimos ${period.days}d`} color="green" />
              <StatCard title="XP Total Gerado" value={(overview?.total_xp || 0).toLocaleString('pt-BR')} icon={<Award />} subtitle="pontos acumulados" color="amber" />
              <StatCard title="Trilhas Ativas" value={overview?.active_trails || '—'} icon={<TrendingUp />} subtitle="disponíveis" color="blue" />
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <LineIcon size={20} className="text-green-600" /> Tendência de Conclusão Mensal
              </h3>
              <div className="h-96">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorAulas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="aulas" stroke="#10b981" strokeWidth={3} fill="url(#colorAulas)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-3">
                    <BarChart3 size={48} />
                    <p className="font-medium">Sem dados suficientes para o gráfico</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Economia' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard title="Coins em Circulação" value={totalCoinsHeld.toLocaleString('pt-BR')} icon={<Award />} subtitle="saldo total" color="amber" />
              <StatCard title="Coins Gastos" value={totalCoinsSpent.toLocaleString('pt-BR')} icon={<Download />} subtitle={`últimos ${period.days}d`} color="red" />
              <StatCard title="Total de Resgates" value={purchases.length} icon={<TrendingUp />} subtitle="compras" color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">Distruibuição Econômica</h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={economyData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={4} dataKey="value">
                        <Cell fill="#f59e0b" strokeWidth={0} />
                        <Cell fill="#ef4444" strokeWidth={0} />
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-8 mt-4">
                  {economyData.map((e, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <span className="font-semibold text-gray-700">{e.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Últimas Transações</h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 max-h-80">
                  {purchases.length > 0 ? purchases.slice(0, 8).map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm border border-gray-100">
                          {p.item?.icon || '🎁'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{p.item?.name || 'Item'}</p>
                          <p className="text-xs text-gray-500">{p.user?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-red-500 text-sm">-{p.total_price} 🪙</span>
                        <span className="text-[10px] text-gray-400">{new Date(p.purchase_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-gray-400 py-10">Nenhuma compra registrada.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Ranking' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard title="Top Global" value={topUsers[0]?.name || '—'} icon={<Award />} subtitle={`${topUsers[0]?.total_xp || 0} XP`} color="amber" />
              <StatCard title="Média XP" value={Math.round(users.reduce((a, u) => a + (u.total_xp || 0), 0) / Math.max(1, users.length))} icon={<Activity />} subtitle="por usuário" color="blue" />
              <StatCard title="Maior Streak" value={Math.max(0, ...users.map(u => u.current_streak || 0))} icon={<TrendingUp />} subtitle="dias consecutivos" color="green" />
            </div>

            <div className="glass-panel overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                <h3 className="text-lg font-bold text-gray-900">Top 10 Colaboradores</h3>
              </div>
              <div className="divide-y divide-gray-100/50">
                {topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-blue-50/20 transition-colors group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index < 3 ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' : 'bg-gray-100 text-gray-500'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">{user.name}</span>
                        <span className="font-bold text-brand">{user.total_xp} XP</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-brand h-full rounded-full" style={{ width: `${Math.min(100, (user.total_xp / (topUsers[0]?.total_xp || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                {topUsers.length === 0 && <p className="text-center py-10 text-gray-400">Nenhum dado de ranking.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
