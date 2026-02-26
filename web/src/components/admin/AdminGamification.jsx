import React, { useState } from 'react';
import { Settings, Save, Plus, Trash2, Activity, Award, Shield, Calendar, Gift, Target, BookOpen, HelpCircle } from 'lucide-react';

export default function AdminGamification() {
  const [activeTab, setActiveTab] = useState('points'); // points, levels, attendance

  const [pointRules, setPointRules] = useState([
    { id: 1, action: 'Login Diário', points: 10, icon: <Activity size={18} /> },
    { id: 2, action: 'Completar Aula', points: 50, icon: <BookOpenIcon /> },
    { id: 3, action: 'Acertar Questão (Fácil)', points: 10, icon: <HelpCircleIcon /> },
    { id: 4, action: 'Acertar Questão (Médio)', points: 20, icon: <HelpCircleIcon /> },
    { id: 5, action: 'Acertar Questão (Difícil)', points: 30, icon: <HelpCircleIcon /> },
    { id: 6, action: 'Concluir Trilha', points: 500, icon: <Award size={18} /> },
  ]);

  const [levels, setLevels] = useState([
    { level: 1, minPoints: 0, title: 'Iniciante', color: 'bg-gray-50 text-gray-700 border-gray-200' },
    { level: 2, minPoints: 100, title: 'Júnior', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { level: 3, minPoints: 500, title: 'Pleno', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { level: 4, minPoints: 1500, title: 'Sênior', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { level: 5, minPoints: 5000, title: 'Especialista', color: 'bg-brand/10 text-brand border-brand/20' },
  ]);

  const [attendanceRewards, setAttendanceRewards] = useState([
    { days: 3, bonusPoints: 50, credits: 10 },
    { days: 7, bonusPoints: 150, credits: 50 },
    { days: 30, bonusPoints: 1000, credits: 500 },
  ]);

  const handleSavePoints = () => {
    alert('Regras de pontuação salvas com sucesso!');
  };

  const handleSaveLevels = () => {
    alert('Configuração de níveis salva com sucesso!');
  };

  const handleAddLevel = () => {
    const lastLevel = levels[levels.length - 1];
    setLevels([...levels, { 
      level: lastLevel.level + 1, 
      minPoints: lastLevel.minPoints * 2, 
      title: 'Novo Nível', 
      color: 'bg-gray-50 text-gray-700 border-gray-200' 
    }]);
  };

  return (
    <div className="p-8 animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="text-brand" size={28} />
          Configuração de Engajamento
        </h1>
        <p className="text-gray-500 mt-1">Defina as métricas de avaliação, progressão e incentivos corporativos.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('points')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'points' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Regras de Pontuação
        </button>
        <button
          onClick={() => setActiveTab('levels')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'levels' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Níveis de Carreira
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'attendance' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Incentivo à Assiduidade
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        
        {activeTab === 'points' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pontuação por Atividade</h2>
              <button onClick={handleSavePoints} className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                <Save size={16} /> Salvar Alterações
              </button>
            </div>
            <div className="grid gap-4">
              {pointRules.map((rule, idx) => (
                <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center shadow-sm">
                      {rule.icon}
                    </div>
                    <span className="font-medium text-gray-900">{rule.action}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={rule.points}
                      onChange={(e) => {
                        const newRules = [...pointRules];
                        newRules[idx].points = Number(e.target.value);
                        setPointRules(newRules);
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand focus:outline-none text-right text-sm"
                    />
                    <span className="text-gray-500 text-sm font-medium">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'levels' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Estrutura de Níveis</h2>
              <div className="flex gap-2">
                <button onClick={handleAddLevel} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                  <Plus size={16} /> Adicionar Nível
                </button>
                <button onClick={handleSaveLevels} className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                  <Save size={16} /> Salvar
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nível</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pontuação Mínima</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {levels.map((lvl, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 font-bold text-gray-900">{lvl.level}</td>
                      <td className="px-6 py-4">
                        <input
                          value={lvl.title}
                          onChange={(e) => {
                            const newLevels = [...levels];
                            newLevels[idx].title = e.target.value;
                            setLevels(newLevels);
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand w-full text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={lvl.minPoints}
                          onChange={(e) => {
                            const newLevels = [...levels];
                            newLevels[idx].minPoints = Number(e.target.value);
                            setLevels(newLevels);
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand w-32 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {idx === levels.length - 1 && idx > 0 && (
                          <button 
                            onClick={() => setLevels(levels.slice(0, -1))}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recompensas por Assiduidade</h2>
              <button onClick={() => alert('Salvo!')} className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                <Save size={16} /> Salvar
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {attendanceRewards.map((reward, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 relative overflow-hidden shadow-sm group hover:border-brand/30 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Calendar size={64} className="text-brand" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="text-brand" size={20} /> {reward.days} Dias
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bônus de Pontos</label>
                      <input
                        type="number"
                        value={reward.bonusPoints}
                        onChange={(e) => {
                          const newR = [...attendanceRewards];
                          newR[idx].bonusPoints = Number(e.target.value);
                          setAttendanceRewards(newR);
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Créditos de Recompensa</label>
                      <input
                        type="number"
                        value={reward.credits}
                        onChange={(e) => {
                          const newR = [...attendanceRewards];
                          newR[idx].credits = Number(e.target.value);
                          setAttendanceRewards(newR);
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
              <Shield className="text-blue-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Abono de Ausência</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Os colaboradores podem utilizar o "Abono" (adquirido com 
                  <span className="font-bold mx-1">500 créditos</span>)
                  para justificar ausências e manter sua assiduidade.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Simple Icons Components for local use
const BookOpenIcon = () => (
  <BookOpen size={18} />
);

const HelpCircleIcon = () => (
  <HelpCircle size={18} />
);
