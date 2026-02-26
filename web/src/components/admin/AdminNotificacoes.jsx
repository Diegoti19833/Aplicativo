import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Send, 
  Calendar, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  MessageSquare,
  XCircle
} from 'lucide-react';

const AdminNotificacoes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('sent'); // sent, scheduled
  const [searchQuery, setSearchQuery] = useState('');

  // Mock Data
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: 'Manutenção Programada', 
      message: 'O sistema passará por manutenção neste domingo às 02:00.', 
      type: 'warning', 
      audience: 'all', 
      status: 'sent', 
      date: '2023-10-15T10:00:00',
      reads: 1250
    },
    { 
      id: 2, 
      title: 'Nova Trilha Disponível', 
      message: 'Confira a nova trilha de Gestão de Conflitos!', 
      type: 'info', 
      audience: 'gerente', 
      status: 'sent', 
      date: '2023-10-18T14:30:00',
      reads: 850
    },
    { 
      id: 3, 
      title: 'Lembrete de Metas', 
      message: 'Faltam 5 dias para o fechamento do mês.', 
      type: 'alert', 
      audience: 'all', 
      status: 'scheduled', 
      date: '2023-11-25T09:00:00',
      reads: 0
    },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    audience: 'all',
    scheduleDate: '',
    isScheduled: false
  });

  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = item.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [notifications, searchQuery, activeTab]);

  const handleSave = (e) => {
    e.preventDefault();
    const newNotification = {
      id: Date.now(),
      title: formData.title,
      message: formData.message,
      type: formData.type,
      audience: formData.audience,
      status: formData.isScheduled ? 'scheduled' : 'sent',
      date: formData.isScheduled ? formData.scheduleDate : new Date().toISOString(),
      reads: 0
    };

    setNotifications([newNotification, ...notifications]);
    closeModal();
    if (!formData.isScheduled) {
      alert('Notificação enviada com sucesso!');
    } else {
      alert('Notificação agendada com sucesso!');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta notificação?')) {
      setNotifications(notifications.filter(item => item.id !== id));
    }
  };

  const openModal = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      audience: 'all',
      scheduleDate: '',
      isScheduled: false
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return <Bell className="text-blue-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'alert': return <AlertTriangle className="text-red-500" size={20} />;
      default: return <Bell className="text-gray-500" size={20} />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'info': return 'Informativo';
      case 'warning': return 'Aviso';
      case 'alert': return 'Urgente';
      default: return 'Geral';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-purple-600" />
            Central de Notificações
          </h1>
          <p className="text-gray-500 mt-1">Envie alertas e mensagens para os usuários do sistema.</p>
        </div>
        
        <button 
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Send size={20} />
          Nova Notificação
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('sent')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'sent' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Enviadas
          </button>
          <button 
            onClick={() => setActiveTab('scheduled')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'scheduled' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Agendadas
          </button>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar notificações..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredNotifications.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                item.type === 'alert' ? 'bg-red-50' : 
                item.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
              }`}>
                {getTypeIcon(item.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      {item.status === 'scheduled' ? <Calendar size={14} /> : <CheckCircle size={14} />}
                      {new Date(item.date).toLocaleString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      item.type === 'alert' ? 'bg-red-50 text-red-700 border-red-200' : 
                      item.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{item.message}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Users size={16} />
                      Público: <span className="capitalize font-medium text-gray-700">{item.audience === 'all' ? 'Todos' : item.audience}</span>
                    </div>
                    {item.status === 'sent' && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle size={16} className="text-green-500" />
                        {item.reads} leituras
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma notificação encontrada</h3>
            <p className="text-gray-500">Tente mudar os filtros ou crie uma nova notificação.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Nova Notificação</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  placeholder="Título da notificação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea 
                  required
                  rows="3"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                  placeholder="Conteúdo da mensagem..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                  >
                    <option value="info">Informativo</option>
                    <option value="warning">Aviso</option>
                    <option value="alert">Urgente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Público Alvo</label>
                  <select 
                    value={formData.audience}
                    onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                  >
                    <option value="all">Todos</option>
                    <option value="gerente">Gerentes</option>
                    <option value="funcionario">Funcionários</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="schedule"
                  checked={formData.isScheduled}
                  onChange={(e) => setFormData({...formData, isScheduled: e.target.checked})}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="schedule" className="text-sm text-gray-700">Agendar envio</label>
              </div>

              {formData.isScheduled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                  <input 
                    type="datetime-local" 
                    required={formData.isScheduled}
                    value={formData.scheduleDate}
                    onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {formData.isScheduled ? <Calendar size={18} /> : <Send size={18} />}
                  {formData.isScheduled ? 'Agendar' : 'Enviar Agora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificacoes;
