import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Phone,
  Smartphone,
  Mail,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { AdminDb } from '../../services/adminDb';
import { useToast } from './ToastContext';

const AdminFranquias = () => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userCounts, setUserCounts] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    manager: '',
    email: '',
    phone: '',
    whatsapp: '',
    status: 'active'
  });

  // Load franchises from database
  const loadFranchises = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AdminDb.franchises.list();
      setFranchises(data);

      // Load user count per franchise
      try {
        const usersResponse = await AdminDb.users.list({ limit: 1000 });
        const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || []);
        const counts = {};
        users.forEach(u => {
          if (u.franchise_id) {
            counts[u.franchise_id] = (counts[u.franchise_id] || 0) + 1;
          }
        });
        setUserCounts(counts);
      } catch (e) {
        console.error('Error loading user counts:', e);
      }
    } catch (e) {
      console.error('Erro ao carregar franquias:', e);
      toast.error('Erro ao carregar franquias', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFranchises();
  }, [loadFranchises]);

  // Derived Statistics
  const stats = useMemo(() => {
    return {
      total: franchises.length,
      active: franchises.filter(f => f.status === 'active').length,
      totalUsers: Object.values(userCounts).reduce((a, b) => a + b, 0),
      totalRevenue: franchises.reduce((acc, curr) => acc + Number(curr.revenue || 0), 0)
    };
  }, [franchises, userCounts]);

  const filteredFranchises = useMemo(() => {
    return franchises.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.manager || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.address || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [franchises, searchQuery, statusFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingItem) {
        await AdminDb.franchises.update({ id: editingItem.id, ...formData });
        toast.success('Unidade atualizada!');
      } else {
        await AdminDb.franchises.create({ ...formData, revenue: 0 });
        toast.success('Unidade criada!');
      }
      closeModal();
      loadFranchises();
    } catch (e) {
      toast.error('Erro ao salvar unidade', e?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade? Todos os dados vinculados serão afetados.')) {
      try {
        await AdminDb.franchises.delete(id);
        toast.success('Unidade removida!');
        loadFranchises();
      } catch (e) {
        toast.error('Erro ao excluir unidade', e?.message);
      }
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        address: item.address || '',
        manager: item.manager || '',
        email: item.email || '',
        phone: item.phone || '',
        whatsapp: item.whatsapp || '',
        status: item.status || 'active'
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        address: '',
        manager: '',
        email: '',
        phone: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-[#129151]" />
            Gestão de Franquias
          </h1>
          <p className="text-gray-500 mt-1">Administre as unidades e filiais da rede.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadFranchises}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#129151] text-white rounded-lg hover:bg-[#0B6E3D] transition-colors shadow-sm font-medium"
          >
            <Plus size={20} />
            Nova Unidade
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total de Unidades</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Unidades Ativas</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total de Alunos</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Faturamento (Est.)</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">R$ {stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por unidade, endereço ou gerente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#129151]/20 focus:border-[#129151]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#129151]/20 focus:border-[#129151] bg-white cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>
        </div>
      </div>

      {/* List View */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse h-32"></div>
          ))
        ) : filteredFranchises.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md transition-shadow">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Building2 size={32} className="text-gray-400" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${item.status === 'active'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                  {item.status === 'active' ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {item.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    {item.address}
                  </div>
                )}
                {item.manager && (
                  <div className="flex items-center gap-1.5">
                    <Users size={16} />
                    Gerente: {item.manager}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-1">
                {item.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} />
                    {item.email}
                  </div>
                )}
                {item.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} />
                    {item.phone}
                  </div>
                )}
                {item.whatsapp && (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <Smartphone size={14} />
                    {item.whatsapp}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-semibold">Alunos</p>
                <p className="text-lg font-bold text-gray-900">{userCounts[item.id] || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-semibold">Faturamento</p>
                <p className="text-lg font-bold text-green-600">R$ {Number(item.revenue || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
              <button
                onClick={() => openModal(item)}
                className="flex-1 md:flex-none p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 md:border-transparent text-center"
              >
                <Edit2 size={18} className="mx-auto" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex-1 md:flex-none p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 md:border-transparent text-center"
              >
                <Trash2 size={18} className="mx-auto" />
              </button>
            </div>
          </div>
        ))}

        {!loading && filteredFranchises.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma unidade encontrada</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou adicione uma nova unidade.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Editar Unidade' : 'Nova Unidade'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Unidade</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#129151]/20 focus:border-[#129151]"
                    placeholder="Ex: Unidade Centro"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#129151]/20 focus:border-[#129151]"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gerente Responsável</label>
                  <input
                    type="text"
                    required
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#129151]/20 focus:border-[#129151]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#129151]/20 focus:border-[#129151] bg-white"
                  >
                    <option value="active">Ativa</option>
                    <option value="inactive">Inativa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#129151]/20 focus:border-[#129151]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#129151]/20 focus:border-[#129151]"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#129151]/20 focus:border-[#129151]"
                    placeholder="(00) 0 0000-0000"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-white bg-[#129151] rounded-lg hover:bg-[#0B6E3D] transition-colors font-medium"
                >
                  {saving ? 'Salvando...' : 'Salvar Unidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFranquias;
