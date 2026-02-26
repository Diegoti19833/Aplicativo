import React, { useState, useMemo } from 'react';
import { 
  Medal, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Award, 
  Star, 
  CheckCircle, 
  TrendingUp, 
  Target,
  Gift,
  MoreVertical,
  Save,
  X,
  Briefcase,
  BookOpen,
  Users
} from 'lucide-react';

const AdminMarcos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Mock Data
  const [marcos, setMarcos] = useState([
    { 
      id: 1, 
      name: 'Início da Jornada', 
      description: 'Complete sua primeira aula na plataforma corporativa.', 
      points: 100, 
      level: 'basico', 
      icon: 'book',
      category: 'learning',
      unlockedBy: 1240
    },
    { 
      id: 2, 
      name: 'Assiduidade Exemplar', 
      description: 'Mantenha uma consistência de 7 dias de acesso.', 
      points: 500, 
      level: 'intermediario', 
      icon: 'trending',
      category: 'streak',
      unlockedBy: 350
    },
    { 
      id: 3, 
      name: 'Excelência em Avaliação', 
      description: 'Obtenha 100% de aproveitamento em 5 avaliações.', 
      points: 1000, 
      level: 'avancado', 
      icon: 'target',
      category: 'quiz',
      unlockedBy: 45
    },
    { 
      id: 4, 
      name: 'Líder de Impacto', 
      description: 'Alcance o nível sênior de engajamento.', 
      points: 5000, 
      level: 'especial', 
      icon: 'briefcase',
      category: 'career',
      unlockedBy: 3
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points: '',
    level: 'basico',
    category: 'learning',
    icon: 'medal'
  });

  // Derived Statistics
  const stats = useMemo(() => {
    return {
      total: marcos.length,
      totalPoints: marcos.reduce((acc, curr) => acc + Number(curr.points), 0),
      unlockedCount: marcos.reduce((acc, curr) => acc + curr.unlockedBy, 0),
      byLevel: {
        basico: marcos.filter(a => a.level === 'basico').length,
        intermediario: marcos.filter(a => a.level === 'intermediario').length,
        avancado: marcos.filter(a => a.level === 'avancado').length,
        especial: marcos.filter(a => a.level === 'especial').length,
      }
    };
  }, [marcos]);

  const filteredMarcos = useMemo(() => {
    return marcos.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'all' || item.level === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [marcos, searchQuery, selectedLevel]);

  const handleSave = (e) => {
    e.preventDefault();
    if (editingItem) {
      setMarcos(marcos.map(item => 
        item.id === editingItem.id ? { ...formData, id: item.id, unlockedBy: item.unlockedBy } : item
      ));
    } else {
      setMarcos([...marcos, { 
        ...formData, 
        id: Date.now(), 
        unlockedBy: 0 
      }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este reconhecimento?')) {
      setMarcos(marcos.filter(item => item.id !== id));
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
        description: '',
        points: '',
        level: 'basico',
        category: 'learning',
        icon: 'medal'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'basico': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'intermediario': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'avancado': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'especial': return 'bg-brand/10 text-brand border-brand/20';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'basico': return <Star size={16} />;
      case 'intermediario': return <CheckCircle size={16} />;
      case 'avancado': return <Award size={16} />;
      case 'especial': return <Medal size={16} />;
      default: return <Star size={16} />;
    }
  };

  const getLevelLabel = (level) => {
    switch (level) {
      case 'basico': return 'Básico';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      case 'especial': return 'Especial';
      default: return level;
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="text-brand" />
            Gestão de Reconhecimentos
          </h1>
          <p className="text-gray-500 mt-1">Gerencie os marcos e recompensas por desempenho profissional.</p>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Novo Marco
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total de Marcos</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Award size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pontos Atribuídos</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPoints.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Star size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Conclusões</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.unlockedCount}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Especiais</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.byLevel.especial}</h3>
            </div>
            <div className="p-3 bg-brand/10 text-brand rounded-lg">
              <Medal size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou descrição..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['all', 'basico', 'intermediario', 'avancado', 'especial'].map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                selectedLevel === level 
                  ? 'bg-brand/10 text-brand' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {level === 'all' ? 'Todos' : getLevelLabel(level)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMarcos.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-6 relative">
              <div className="absolute top-4 right-4">
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  item.level === 'especial' ? 'bg-brand/10 text-brand' :
                  item.level === 'avancado' ? 'bg-purple-100 text-purple-600' :
                  item.level === 'intermediario' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <Award size={40} />
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 h-10">{item.description}</p>
              </div>

              <div className="flex items-center justify-center gap-2 mb-6">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 uppercase ${getLevelColor(item.level)}`}>
                  {getLevelIcon(item.level)}
                  {getLevelLabel(item.level)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1">
                  <Star size={12} className="text-brand" />
                  {item.points} pts
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-900">{item.unlockedBy}</span> conclusões
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openModal(item)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Editar Marco' : 'Novo Marco'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  placeholder="Ex: Especialista em Vendas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  required
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
                  placeholder="Ex: Complete o curso avançado de vendas."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pontos (Recompensa)</label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.points}
                      onChange={(e) => setFormData({...formData, points: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white"
                  >
                    <option value="learning">Aprendizado</option>
                    <option value="social">Colaboração</option>
                    <option value="streak">Assiduidade</option>
                    <option value="quiz">Avaliação</option>
                    <option value="career">Carreira</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Impacto</label>
                <div className="grid grid-cols-4 gap-2">
                  {['basico', 'intermediario', 'avancado', 'especial'].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({...formData, level})}
                      className={`py-2 px-1 rounded-lg text-xs font-bold capitalize border-2 transition-all ${
                        formData.level === level
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {getLevelLabel(level)}
                    </button>
                  ))}
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
                  className="flex-1 px-4 py-2 text-white bg-brand rounded-lg hover:bg-brand-dark transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarcos;
