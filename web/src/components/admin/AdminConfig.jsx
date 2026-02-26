import React, { useState, useEffect } from 'react';
import { Save, Bell, Globe, Shield, Palette, Database, Building2, Layers, ToggleLeft, ToggleRight, FileText, CheckCircle, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { AdminDb } from '../../services/adminDb';
import { useToast } from './ToastContext';


export default function AdminConfig() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [settings, setSettings] = useState({
    // General
    companyName: 'Pet Class',
    domain: 'treinamento.petclass.com',
    supportEmail: 'suporte@petclass.com',

    // Branding
    primaryColor: '#0047AB',
    secondaryColor: '#FFD700',
    logoUrl: '',

    // Gamification & Levels
    dailyPointsLimit: 1000,
    levels: [
      { level: 1, name: 'Iniciante', points: 0 },
      { level: 2, name: 'Júnior', points: 1000 },
      { level: 3, name: 'Pleno', points: 3000 },
      { level: 4, name: 'Sênior', points: 6000 },
      { level: 5, name: 'Especialista', points: 10000 },
    ],

    // Features Toggles
    features: {
      shop: true,
      ranking: true,
      globalRanking: true,
      missions: true,
      chat: false,
      certificates: true,
    },

    // Franchises (Mocked data structure)
    franchises: [
      { id: 1, name: 'Matriz - São Paulo', active: true },
      { id: 2, name: 'Filial - Rio de Janeiro', active: true },
    ]
  });

  // Mock Logs
  const [auditLogs] = useState([
    { id: 1, action: 'UPDATE_SETTINGS', user: 'admin@petclass.com', details: 'Alterou limite de Pontos diário', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 2, action: 'CREATE_MISSION', user: 'gerente@petclass.com', details: 'Criou missão "Vendas de Natal"', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 3, action: 'DELETE_USER', user: 'admin@petclass.com', details: 'Removeu usuário id:452', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  ]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const row = await AdminDb.settings.get();
      if (row) {
        // Merge loaded settings with defaults to ensure all fields exist
        setSettings(prev => ({
          ...prev,
          companyName: row.company_name ?? prev.companyName,
          primaryColor: row.primary_color ?? prev.primaryColor,
          secondaryColor: row.secondary_color ?? prev.secondaryColor,
          dailyPointsLimit: row.daily_xp_limit ?? prev.dailyPointsLimit,
          features: {
            ...prev.features,
            globalRanking: row.global_ranking ?? prev.features.globalRanking
          }
        }));
      }
    } catch (e) {
      console.error('Falha ao carregar configurações', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await AdminDb.settings.save(settings);
      toast.success('Configurações salvas!', 'Alterações aplicadas com sucesso.');
    } catch (e) {
      toast.error('Falha ao salvar', e?.message);
    } finally {
      setSaving(false);
    }
  };

  const updateFeature = (key) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] }
    }));
  };

  const addFranchise = () => {
    const name = window.prompt('Nome da nova unidade:');
    if (name) {
      setSettings(prev => ({
        ...prev,
        franchises: [...prev.franchises, { id: Date.now(), name, active: true }]
      }));
      toast.success('Unidade adicionada!', name);
    }
  };

  const removeFranchise = (id) => {
    if (window.confirm('Remover esta unidade?')) {
      setSettings(prev => ({
        ...prev,
        franchises: prev.franchises.filter(f => f.id !== id)
      }));
      toast.info('Unidade removida.');
    }
  };

  const renderSidebarItem = (id, icon, label) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === id
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-600 hover:bg-gray-50'
        }`}
    >
      {React.cloneElement(icon, { size: 18 })}
      {label}
    </button>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Carregando configurações...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-500 mt-1">Gerencie parâmetros globais, aparência e funcionalidades.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-1">
          {renderSidebarItem('general', <Globe />, 'Geral & Identidade')}
          {renderSidebarItem('appearance', <Palette />, 'Aparência & Tema')}
          {renderSidebarItem('features', <Layers />, 'Funcionalidades')}
          {renderSidebarItem('gamification', <Shield />, 'Pontuação & Níveis')}
          {renderSidebarItem('franchises', <Building2 />, 'Franquias & Unidades')}
          {renderSidebarItem('logs', <FileText />, 'Logs de Auditoria')}
          {renderSidebarItem('database', <Database />, 'Banco de Dados')}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Globe size={20} className="text-blue-600" />
                Identidade da Empresa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                  <input
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domínio do Sistema</label>
                  <input
                    value={settings.domain}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de Suporte</label>
                  <input
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Palette size={20} className="text-blue-600" />
                Cores e Tema
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor Primária (Marca)</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="h-10 w-10 rounded cursor-pointer border-0"
                    />
                    <input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg uppercase"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Usada em botões principais, cabeçalhos e destaques.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor Secundária (Acentos)</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="h-10 w-10 rounded cursor-pointer border-0"
                    />
                    <input
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg uppercase"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Usada em badges, ícones secundários e detalhes.</p>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Layers size={20} className="text-blue-600" />
                Módulos e Funcionalidades
              </h2>
              <div className="space-y-4">
                {Object.entries(settings.features).map(([key, isActive]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                      <p className="text-sm text-gray-500">
                        {isActive ? 'Funcionalidade ativa para todos os usuários.' : 'Funcionalidade desabilitada no sistema.'}
                      </p>
                    </div>
                    <button
                      onClick={() => updateFeature(key)}
                      className={`text-2xl transition-colors ${isActive ? 'text-green-500' : 'text-gray-300'}`}
                    >
                      {isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gamification Tab */}
          {activeTab === 'gamification' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Shield size={20} className="text-blue-600" />
                  Regras de Pontuação
                </h2>
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Limite Diário de Pontos</h3>
                    <p className="text-sm text-gray-500">Máximo de pontos que um usuário pode ganhar em 24h.</p>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      value={settings.dailyPointsLimit}
                      onChange={(e) => setSettings({ ...settings, dailyPointsLimit: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Níveis de Usuário</h2>
                <div className="space-y-3">
                  {settings.levels.map((lvl, index) => (
                    <div key={lvl.level} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full">
                        {lvl.level}
                      </div>
                      <input
                        value={lvl.name}
                        onChange={(e) => {
                          const newLevels = [...settings.levels];
                          newLevels[index].name = e.target.value;
                          setSettings({ ...settings, levels: newLevels });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Nome do Nível"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Pontos Mínimos:</span>
                        <input
                          type="number"
                          value={lvl.points}
                          onChange={(e) => {
                            const newLevels = [...settings.levels];
                            newLevels[index].points = parseInt(e.target.value);
                            setSettings({ ...settings, levels: newLevels });
                          }}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Franchises Tab */}
          {activeTab === 'franchises' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" />
                  Gerenciamento de Unidades
                </h2>
                <button
                  onClick={addFranchise}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
                >
                  <Plus size={16} /> Adicionar Unidade
                </button>
              </div>

              <div className="grid gap-4">
                {settings.franchises.map(franchise => (
                  <div key={franchise.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{franchise.name}</h3>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle size={10} /> Ativa
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFranchise(franchise.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Logs de Auditoria
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Data/Hora</th>
                      <th className="px-4 py-3 font-medium">Usuário</th>
                      <th className="px-4 py-3 font-medium">Ação</th>
                      <th className="px-4 py-3 font-medium">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{log.user}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Database size={20} className="text-blue-600" />
                Manutenção do Banco de Dados
              </h2>

              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg mb-6 flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-yellow-800">Zona de Perigo</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    As ações abaixo afetam diretamente os dados do sistema. Use com cautela e apenas em ambiente de desenvolvimento ou teste.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Gerar Dados de Teste (Seed)</h3>
                  <p className="text-sm text-gray-500">
                    Popula o banco com trilhas, aulas, missões e usuários fictícios para teste.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (!window.confirm('Isso irá criar dados de exemplo. Deseja continuar?')) return;
                    try {
                      setSeeding(true);
                      await AdminDb.setup.seedData();
                      toast.success('Dados gerados!', 'Recarregue a página para ver.');
                    } catch (e) {
                      toast.error('Erro ao gerar dados', e?.message);
                    } finally {
                      setSeeding(false);
                    }
                  }}
                  disabled={seeding}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {seeding ? 'Gerando...' : 'Executar Seed'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
