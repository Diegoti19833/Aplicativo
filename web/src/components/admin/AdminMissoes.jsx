import React, { useEffect, useState, useMemo } from 'react';
import { Target, Plus, Trash2, Edit, Copy, CheckCircle, Clock, TrendingUp, Star, BarChart2, Filter, Search, AlertCircle, Calendar, X, Rocket } from 'lucide-react';
import { AdminDb } from '../../services/adminDb';
import { useToast } from './ToastContext';

const missionTypes = [
  { value: 'complete_lessons', label: 'Completar Aulas', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  { value: 'answer_quizzes', label: 'Responder Avaliações', icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
  { value: 'earn_xp', label: 'Acumular Pontos', icon: TrendingUp, color: 'text-brand', bg: 'bg-brand/10', border: 'border-brand/20' },
  { value: 'study_time', label: 'Tempo de Estudo', icon: Clock, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
  { value: 'perfect_streak', label: 'Assiduidade Completa', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
  { value: 'login_daily', label: 'Acesso Diário', icon: Target, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
];

function MissionStatsCard({ title, value, icon, color }) {
  const gradients = {
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-violet-500 to-purple-600',
    green: 'from-emerald-500 to-teal-600',
    orange: 'from-orange-400 to-pink-500',
    red: 'from-red-500 to-rose-600',
  };
  return (
    <div className="glass-panel p-5 flex items-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform">
      <div className={`absolute right-0 top-0 p-3 opacity-10`}>{React.cloneElement(icon, { size: 64 })}</div>
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[color] || gradients.blue} text-white shadow-lg shadow-blue-500/20`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
  );
}

export default function AdminMissoes() {
  const toast = useToast();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [form, setForm] = useState({
    title: '', description: '', missionType: 'complete_lessons',
    targetValue: 1, xpReward: 20, coinsReward: 5, difficultyLevel: 1
  });

  useEffect(() => { loadMissions(); }, []);

  const MOCK_MISSIONS = [
    { id: '1', title: 'Primeiro Passo', description: 'Complete sua primeira aula', mission_type: 'complete_lessons', target_value: 1, xp_reward: 20, coins_reward: 5, difficulty_level: 1, is_active: true, completions_count: 245 },
    { id: '2', title: 'Semana Produtiva', description: 'Acesse a plataforma por 7 dias seguidos', mission_type: 'login_daily', target_value: 7, xp_reward: 100, coins_reward: 30, difficulty_level: 2, is_active: true, completions_count: 89 },
    { id: '3', title: 'Mestre do Quiz', description: 'Responda 10 avaliações com nota máxima', mission_type: 'answer_quizzes', target_value: 10, xp_reward: 200, coins_reward: 50, difficulty_level: 3, is_active: true, completions_count: 34 },
    { id: '4', title: 'Acumulador de XP', description: 'Acumule 1000 pontos de experiência', mission_type: 'earn_xp', target_value: 1000, xp_reward: 150, coins_reward: 40, difficulty_level: 2, is_active: false, completions_count: 67 },
  ];

  const loadMissions = async () => {
    try {
      setLoading(true);
      const data = await AdminDb.missions.list();
      setMissions(data && data.length > 0 ? data : MOCK_MISSIONS);
    } catch (e) {
      console.error('Erro:', e);
      setMissions(MOCK_MISSIONS);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = missions.length;
    const active = missions.filter(m => m.is_active).length;
    const totalXp = missions.filter(m => m.is_active).reduce((acc, m) => acc + (m.xp_reward || 0), 0);
    const totalCoins = missions.filter(m => m.is_active).reduce((acc, m) => acc + (m.coins_reward || 0), 0);
    return { total, active, totalXp, totalCoins };
  }, [missions]);

  const filteredMissions = useMemo(() => {
    return missions.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || m.mission_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [missions, searchTerm, filterType]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        missionType: form.missionType,
        targetValue: parseInt(form.targetValue),
        xpReward: parseInt(form.xpReward),
        coinsReward: parseInt(form.coinsReward),
        difficultyLevel: parseInt(form.difficultyLevel),
      };

      if (editingMission) {
        await AdminDb.missions.update({ id: editingMission.id, ...payload });
      } else {
        await AdminDb.missions.create(payload);
      }

      setShowForm(false);
      setEditingMission(null);
      resetForm();
      loadMissions();
      toast.success(editingMission ? 'Meta atualizada!' : 'Meta criada com sucesso!');
    } catch (e) {
      toast.error('Erro ao salvar meta', e?.message);
    }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', missionType: 'complete_lessons', targetValue: 1, xpReward: 20, coinsReward: 5, difficultyLevel: 1 });
  };

  const handleEdit = (mission) => {
    setEditingMission(mission);
    setForm({
      title: mission.title,
      description: mission.description || '',
      missionType: mission.mission_type,
      targetValue: mission.target_value,
      xpReward: mission.xp_reward,
      coinsReward: mission.coins_reward,
      difficultyLevel: mission.difficulty_level,
    });
    setShowForm(true);
  };

  const handleDuplicate = (mission) => {
    setEditingMission(null); // Create mode
    setForm({
      title: `${mission.title} (Cópia)`,
      description: mission.description || '',
      missionType: mission.mission_type,
      targetValue: mission.target_value,
      xpReward: mission.xp_reward,
      coinsReward: mission.coins_reward,
      difficultyLevel: mission.difficulty_level,
    });
    setShowForm(true);
  };

  const toggleActive = async (mission) => {
    try {
      await AdminDb.missions.setActive({ id: mission.id, isActive: !mission.is_active });
      setMissions(missions.map(m => m.id === mission.id ? { ...m, is_active: !m.is_active } : m));
    } catch (e) {
      toast.error('Erro ao alterar status', e?.message);
      loadMissions();
    }
  };

  const removeMission = async (mission) => {
    if (!confirm(`Remover meta "${mission.title}"?`)) return;
    try {
      await AdminDb.missions.remove({ id: mission.id });
      loadMissions();
      toast.success('Meta removida!');
    } catch (e) {
      toast.error('Erro ao remover', e?.message);
    }
  };

  const getDifficultyColor = (level) => {
    if (level === 1) return 'bg-green-50 text-green-700 border-green-100';
    if (level === 2) return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    return 'bg-red-50 text-red-700 border-red-100';
  };

  const getDifficultyLabel = (level) => {
    if (level === 1) return 'Iniciante';
    if (level === 2) return 'Intermediário';
    return 'Avançado';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg text-white shadow-md">
              <Target size={24} />
            </div>
            Metas de Engajamento
          </h1>
          <p className="text-gray-500 mt-2 ml-14">Crie desafios diários para incentivar a participação dos colaboradores.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingMission(null); resetForm(); }}
          className="bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-semibold"
        >
          <Plus size={20} /> Nova Meta
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Metas</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Target size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm text-gray-500 font-medium">Metas Ativas</p>
            <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.active}</h3>
          </div>
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm text-gray-500 font-medium">Pontos em Jogo</p>
            <h3 className="text-3xl font-bold text-brand mt-1">{stats.totalXp}</h3>
          </div>
          <div className="p-3 bg-brand/10 rounded-xl text-brand">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm text-gray-500 font-medium">Bônus Extras</p>
            <h3 className="text-3xl font-bold text-amber-600 mt-1">{stats.totalCoins}</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Star size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand focus:bg-white transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand appearance-none focus:bg-white transition-all cursor-pointer font-medium text-gray-700"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">Todos os Tipos</option>
            {missionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMissions.map(mission => {
          const typeInfo = missionTypes.find(t => t.value === mission.mission_type) || missionTypes[0];
          const TypeIcon = typeInfo.icon;

          return (
            <div
              key={mission.id}
              className={`group bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 ${mission.is_active ? 'border-gray-200 hover:shadow-lg hover:-translate-y-1' : 'border-gray-100 opacity-75 bg-gray-50/50'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${typeInfo.bg} ${typeInfo.color}`}>
                    <TypeIcon size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{mission.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${typeInfo.color.replace('text-', 'border-').replace('600', '200')} bg-white`}>
                        {typeInfo.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getDifficultyColor(mission.difficulty_level)}`}>
                        {getDifficultyLabel(mission.difficulty_level)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleActive(mission)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${mission.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                  title={mission.is_active ? "Desativar" : "Ativar"}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${mission.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <p className="text-gray-600 text-sm mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">"{mission.description}"</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-brand/5 rounded-xl p-3 border border-brand/10">
                  <p className="text-xs text-brand font-bold uppercase tracking-wider mb-1">Recompensa (XP)</p>
                  <div className="flex items-center gap-2 text-brand font-bold text-xl">
                    <TrendingUp size={20} /> {mission.xp_reward}
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">Bônus (Coins)</p>
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-xl">
                    <Star size={20} /> {mission.coins_reward}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-500">
                  Meta: <span className="text-gray-900">{mission.target_value}</span> repetições
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDuplicate(mission)} className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Duplicar">
                    <Copy size={18} />
                  </button>
                  <button onClick={() => handleEdit(mission)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => removeMission(mission)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMissions.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 mt-8">
          <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
            <Rocket size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Nenhuma meta encontrada</h3>
          <p className="text-gray-500 mt-2">Crie novas metas ou ajuste seus filtros.</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">{editingMission ? 'Editar Meta' : 'Nova Meta Diária'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Título da Meta</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Mestre das Avaliações"
                    required
                    className="input w-full"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descrição (Instruções)</label>
                  <input
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Ex: Complete 3 avaliações com nota máxima"
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Objetivo</label>
                  <select
                    value={form.missionType}
                    onChange={e => setForm({ ...form, missionType: e.target.value })}
                    className="input w-full"
                  >
                    {missionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Meta (Quantidade)</label>
                  <input
                    type="number"
                    value={form.targetValue}
                    onChange={e => setForm({ ...form, targetValue: e.target.value })}
                    min="1"
                    required
                    className="input w-full"
                  />
                </div>

                <div className="col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Recompensas e Nível</h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pontos (XP)</label>
                      <div className="relative">
                        <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand" size={18} />
                        <input
                          type="number"
                          value={form.xpReward}
                          onChange={e => setForm({ ...form, xpReward: e.target.value })}
                          min="0"
                          className="input w-full pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Coins (Loja)</label>
                      <div className="relative">
                        <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" size={18} />
                        <input
                          type="number"
                          value={form.coinsReward}
                          onChange={e => setForm({ ...form, coinsReward: e.target.value })}
                          min="0"
                          className="input w-full pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dificuldade</label>
                      <select
                        value={form.difficultyLevel}
                        onChange={e => setForm({ ...form, difficultyLevel: e.target.value })}
                        className="input w-full"
                      >
                        <option value="1">Iniciante</option>
                        <option value="2">Intermediário</option>
                        <option value="3">Avançado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {editingMission ? 'Salvar Alterações' : 'Criar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}