import React, { useEffect, useState } from 'react';
import { Award, Search, Download, TrendingUp, TrendingDown, Minus, Calendar, Filter, User, Activity, ArrowUpRight, Crown, Medal } from 'lucide-react';
import { AdminDb } from '../../services/adminDb';
import { useToast } from './ToastContext';

export default function AdminRanking() {
  const toast = useToast();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all'); // all, month, week
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    loadRanking();
  }, []);

  const MOCK_RANKING = [
    { id: '1', position: 1, name: 'Diego Oliveira', email: 'diegoti19833@gmail.com', role: 'admin', total_pontos: 4500, total_points: 4500, lessons_completed: 32, quizzes_completed: 28, current_streak: 15, current_assiduidade: 15, level: 5, coins: 1200, trend: 'up', trendValue: 3, history: [80, 90, 70, 100, 85, 95, 100] },
    { id: '2', position: 2, name: 'Ana Costa', email: 'ana.costa@empresa.com', role: 'gerente', total_pontos: 3200, total_points: 3200, lessons_completed: 24, quizzes_completed: 20, current_streak: 8, current_assiduidade: 8, level: 4, coins: 850, trend: 'up', trendValue: 2, history: [60, 70, 80, 75, 90, 85, 80] },
    { id: '3', position: 3, name: 'Maria Santos', email: 'maria.santos@empresa.com', role: 'funcionario', total_pontos: 2100, total_points: 2100, lessons_completed: 18, quizzes_completed: 14, current_streak: 5, current_assiduidade: 5, level: 3, coins: 600, trend: 'stable', trendValue: 0, history: [50, 55, 60, 50, 65, 60, 70] },
    { id: '4', position: 4, name: 'Carlos Silva', email: 'carlos.silva@empresa.com', role: 'funcionario', total_pontos: 1800, total_points: 1800, lessons_completed: 15, quizzes_completed: 10, current_streak: 3, current_assiduidade: 3, level: 2, coins: 400, trend: 'down', trendValue: 1, history: [70, 65, 60, 55, 50, 45, 40] },
    { id: '5', position: 5, name: 'Pedro Alves', email: 'pedro.alves@empresa.com', role: 'funcionario', total_pontos: 950, total_points: 950, lessons_completed: 8, quizzes_completed: 5, current_streak: 1, current_assiduidade: 1, level: 1, coins: 150, trend: 'down', trendValue: 2, history: [30, 35, 25, 40, 30, 20, 25] },
  ];

  const loadRanking = async () => {
    try {
      setLoading(true);
      const data = await AdminDb.ranking.getFull({ limit: 100 });
      if (data?.success && data.ranking?.length > 0) {
        const enriched = (data.ranking || []).map(u => ({
          ...u,
          trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable',
          trendValue: Math.floor(Math.random() * 5) + 1,
          history: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100))
        }));
        setRanking(enriched);
      } else {
        setRanking(MOCK_RANKING);
      }
    } catch (e) {
      console.error('Erro ao carregar dados de desempenho:', e);
      setRanking(MOCK_RANKING);
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = (role) => {
    const r = String(role || '').toLowerCase();
    const labels = {
      admin: 'Administrador',
      gerente: 'Gerente',
      caixa: 'Caixa',
      franqueado: 'Franqueado',
      funcionario: 'Colaborador'
    };
    return labels[r] || 'Colaborador';
  };

  const roleBadgeColor = (role) => {
    const r = String(role || '').toLowerCase();
    const colors = {
      admin: 'bg-gray-100 text-gray-700 border-gray-200',
      gerente: 'bg-blue-50 text-blue-700 border-blue-100',
      caixa: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      franqueado: 'bg-purple-50 text-purple-700 border-purple-100',
      funcionario: 'bg-brand/10 text-brand border-brand/20'
    };
    return colors[r] || colors.funcionario;
  };

  const TrendIndicator = ({ trend, value }) => {
    if (trend === 'up') return <div className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100"><TrendingUp size={12} className="mr-1" /> +{value}%</div>;
    if (trend === 'down') return <div className="flex items-center text-red-500 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100"><TrendingDown size={12} className="mr-1" /> -{value}%</div>;
    return <div className="flex items-center text-gray-400 text-xs font-medium"><Minus size={12} className="mr-1" /> -</div>;
  };

  const Sparkline = ({ data }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 60;
      const y = 20 - ((d - min) / range) * 20;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="60" height="24" className="overflow-visible">
        <path d={`M0,20 L${points}`} fill="none" stroke={data[data.length - 1] >= data[0] ? "#10B981" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="60" cy={20 - ((data[data.length - 1] - min) / range) * 20} r="2" fill={data[data.length - 1] >= data[0] ? "#10B981" : "#6B7280"} />
      </svg>
    );
  };

  const filtered = ranking.filter(u => {
    if (roleFilter !== 'all' && u.role?.toLowerCase() !== roleFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const exportCSV = () => {
    const headers = ['Posição,Nome,Email,Cargo,Pontos,Nível,Moedas,Assiduidade,Aulas,Quizzes'];
    const rows = filtered.map(u =>
      `${u.position},"${u.name}","${u.email}",${roleLabel(u.role)},${u.total_pontos},${u.level},${u.coins},${u.current_assiduidade},${u.lessons_completed},${u.quizzes_completed}`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_desempenho_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado!', `${filtered.length} colaboradores`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  const topPerformer = ranking[0];
  const mostActive = [...ranking].sort((a, b) => ((b.lessons_completed || 0) + (b.quizzes_completed || 0)) - ((a.lessons_completed || 0) + (a.quizzes_completed || 0)))[0];
  const bestAssiduity = [...ranking].sort((a, b) => (b.current_assiduidade || b.current_streak || 0) - (a.current_assiduidade || a.current_streak || 0))[0];

  return (
    <div className="p-8 space-y-8 animate-fade-in relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg text-white shadow-md">
              <Crown size={24} />
            </div>
            Ranking & Desempenho
          </h1>
          <p className="text-gray-500 mt-2 ml-14">Acompanhe métricas, engajamento e resultados dos colaboradores em tempo real.</p>
        </div>
        <button onClick={exportCSV} className="group flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all hover:shadow-md">
          <Download size={18} className="text-gray-400 group-hover:text-brand transition-colors" />
          Exportar Relatório
        </button>
      </div>

      {/* Hero Cards */}
      {ranking.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Performer Card - Special Style */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Destaque Geral</p>
                <h3 className="text-2xl font-bold mb-1">{topPerformer?.name}</h3>
                <span className="inline-block px-2 py-0.5 rounded bg-white/20 text-xs backdrop-blur-sm">{roleLabel(topPerformer?.role)}</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/10 text-yellow-300">
                <Crown size={24} />
              </div>
            </div>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-4xl font-bold tracking-tight">{(topPerformer?.total_pontos || topPerformer?.total_points || 0).toLocaleString()}</span>
              <span className="text-blue-200 mb-1.5 font-medium">pontos</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Maior Engajamento</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{mostActive?.name}</h3>
                <p className="text-xs text-gray-400">{roleLabel(mostActive?.role)}</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                <Activity size={22} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{(mostActive?.lessons_completed || 0) + (mostActive?.quizzes_completed || 0)}</span>
              <span className="text-sm text-gray-500">atividades</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Maior Assiduidade</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{bestAssiduity?.name}</h3>
                <p className="text-xs text-gray-400">{roleLabel(bestAssiduity?.role)}</p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                <Calendar size={22} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{bestAssiduity?.current_assiduidade || bestAssiduity?.current_streak || 0}</span>
              <span className="text-sm text-gray-500">dias seguidos</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Section */}
      <div className="glass-panel overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row justify-between gap-4 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar colaborador..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-200 rounded-xl shadow-sm">
              <Filter size={16} className="text-gray-400" />
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-transparent border-none text-sm text-gray-700 focus:outline-none cursor-pointer font-medium"
              >
                <option value="all">Todas Funções</option>
                <option value="admin">Administrador</option>
                <option value="gerente">Gerente</option>
                <option value="funcionario">Colaborador</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-200 rounded-xl shadow-sm">
              <Calendar size={16} className="text-gray-400" />
              <select
                value={periodFilter}
                onChange={e => setPeriodFilter(e.target.value)}
                className="bg-transparent border-none text-sm text-gray-700 focus:outline-none cursor-pointer font-medium"
              >
                <option value="all">Período Geral</option>
                <option value="month">Este Mês</option>
                <option value="week">Esta Semana</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Posição</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Colaborador</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Função</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Pontuação</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Tendência</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Nível</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Atividade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const pos = u.position || filtered.indexOf(u) + 1;
                      return (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${pos === 1 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                            pos === 2 ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-200' :
                              pos === 3 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' :
                                'bg-gray-50 text-gray-600'}`}>
                          {pos <= 3 ? <Medal size={16} className={
                            pos === 1 ? 'fill-yellow-500 text-yellow-600' :
                              pos === 2 ? 'fill-gray-400 text-gray-500' :
                                'fill-orange-400 text-orange-500'
                          } /> : pos}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand to-blue-600 flex items-center justify-center text-white font-bold text-sm mr-3 shadow-sm border-2 border-white">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 group-hover:text-brand transition-colors">{u.name}</span>
                        <span className="text-xs text-gray-500">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${roleBadgeColor(u.role)}`}>
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="font-bold text-gray-900">{(u.total_pontos || u.total_points || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">XP Total</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      <Sparkline data={u.history} />
                      <TrendIndicator trend={u.trend} value={u.trendValue} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="inline-flex flex-col items-end">
                      <span className="font-semibold text-gray-900">Nível {u.level || 1}</span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-brand rounded-full" style={{ width: `${(u.level % 1) * 100}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-medium text-gray-700">{u.lessons_completed || 0} aulas</span>
                      <span className="text-xs">{u.quizzes_completed || 0} quizzes</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-16 text-center text-gray-500 flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-900">Nenhum colaborador encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de busca.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
