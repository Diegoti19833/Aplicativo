import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Phone,
  Mail,
  TrendingUp
} from 'lucide-react';

const AdminFranquias = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock Data
  const [franchises, setFranchises] = useState([
    { 
      id: 1, 
      name: 'Unidade Centro', 
      address: 'Av. Paulista, 1000 - São Paulo, SP', 
      manager: 'Carlos Silva', 
      email: 'centro@gamepop.com',
      phone: '(11) 99999-0001',
      users: 150, 
      status: 'active',
      revenue: 45000
    },
    { 
      id: 2, 
      name: 'Unidade Vila Madalena', 
      address: 'Rua Fradique Coutinho, 500 - São Paulo, SP', 
      manager: 'Ana Oliveira', 
      email: 'vilamadalena@gamepop.com',
      phone: '(11) 99999-0002',
      users: 85, 
      status: 'active',
      revenue: 28000
    },
    { 
      id: 3, 
      name: 'Unidade Moema', 
      address: 'Av. Ibirapuera, 2000 - São Paulo, SP', 
      manager: 'Roberto Santos', 
      email: 'moema@gamepop.com',
      phone: '(11) 99999-0003',
      users: 120, 
      status: 'inactive',
      revenue: 0
    },
    { 
      id: 4, 
      name: 'Unidade Tatuapé', 
      address: 'Rua Tuiuti, 300 - São Paulo, SP', 
      manager: 'Fernanda Costa', 
      email: 'tatuape@gamepop.com',
      phone: '(11) 99999-0004',
      users: 95, 
      status: 'active',
      revenue: 32000
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    manager: '',
    email: '',
    phone: '',
    status: 'active'
  });

  // Derived Statistics
  const stats = useMemo(() => {
    return {
      total: franchises.length,
      active: franchises.filter(f => f.status === 'active').length,
      totalUsers: franchises.reduce((acc, curr) => acc + curr.users, 0),
      totalRevenue: franchises.reduce((acc, curr) => acc + curr.revenue, 0)
    };
  }, [franchises]);

  const filteredFranchises = useMemo(() => {
    return franchises.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [franchises, searchQuery, statusFilter]);

  const handleSave = (e) => {
    e.preventDefault();
    if (editingItem) {
      setFranchises(franchises.map(item => 
        item.id === editingItem.id ? { ...formData, id: item.id, users: item.users, revenue: item.revenue } : item
      ));
    } else {
      setFranchises([...franchises, { 
        ...formData, 
        id: Date.now(), 
        users: 0, 
        revenue: 0 
      }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade? Todos os dados vinculados serão afetados.')) {
      setFranchises(franchises.filter(item => item.id !== id));
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
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
            <Building2 className="text-purple-600" />
            Gestão de Franquias
          </h1>
          <p className="text-gray-500 mt-1">Administre as unidades e filiais da rede.</p>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nova Unidade
        </button>
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
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>
        </div>
      </div>

      {/* List View */}
      <div className="grid grid-cols-1 gap-6">
        {filteredFranchises.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md transition-shadow">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Building2 size={32} className="text-gray-400" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  item.status === 'active' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {item.status === 'active' ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  {item.address}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={16} />
                  Gerente: {item.manager}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Mail size={14} />
                  {item.email}
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={14} />
                  {item.phone}
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-semibold">Alunos</p>
                <p className="text-lg font-bold text-gray-900">{item.users}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-semibold">Faturamento</p>
                <p className="text-lg font-bold text-green-600">R$ {item.revenue.toLocaleString()}</p>
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

        {filteredFranchises.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma unidade encontrada</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou adicione uma nova unidade.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
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
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Unidade</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    placeholder="Ex: Unidade Centro"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                  <input 
                    type="text" 
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gerente Responsável</label>
                  <input 
                    type="text" 
                    required
                    value={formData.manager}
                    onChange={(e) => setFormData({...formData, manager: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
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
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    placeholder="(00) 00000-0000"
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
                  className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Salvar Unidade
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
