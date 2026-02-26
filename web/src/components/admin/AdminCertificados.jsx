import React, { useState } from 'react';
import { Award, Plus, Search, Trash2, Edit, Eye, Download, Check, X, FileText, User, Calendar, PenTool } from 'lucide-react';

export default function AdminCertificados() {
  const [activeTab, setActiveTab] = useState('templates'); // templates, issued
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, issue
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [search, setSearch] = useState('');

  // Mock Data: Templates
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Conclusão de Curso Básico',
      title: 'CERTIFICADO DE CONCLUSÃO',
      body: 'Certificamos que {nome} concluiu com êxito o Curso Básico de Atendimento ao Cliente, com carga horária de {horas} horas.',
      bgImage: 'https://img.freepik.com/free-vector/elegant-white-certificate-template_23-2148421447.jpg',
      signatureName: 'Diretoria de Treinamento',
      created_at: '2023-10-15'
    },
    {
      id: 2,
      name: 'Funcionário do Mês',
      title: 'RECONHECIMENTO',
      body: 'Este certificado é concedido a {nome} em reconhecimento ao seu excelente desempenho como Funcionário do Mês de {mes}.',
      bgImage: 'https://img.freepik.com/free-vector/luxury-certificate-template-with-golden-frame_23-2148455685.jpg',
      signatureName: 'CEO GamePop',
      created_at: '2023-11-01'
    }
  ]);

  // Mock Data: Issued Certificates
  const [issued] = useState([
    {
      id: 101,
      templateId: 1,
      templateName: 'Conclusão de Curso Básico',
      userName: 'João Silva',
      userEmail: 'joao@gamepop.com.br',
      issueDate: '2023-11-10',
      code: 'CERT-2023-101'
    },
    {
      id: 102,
      templateId: 2,
      templateName: 'Funcionário do Mês',
      userName: 'Maria Oliveira',
      userEmail: 'maria@gamepop.com.br',
      issueDate: '2023-11-12',
      code: 'CERT-2023-102'
    }
  ]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    body: '',
    bgImage: '',
    signatureName: ''
  });

  const handleOpenModal = (mode, data = null) => {
    setModalMode(mode);
    if (mode === 'edit' && data) {
      setFormData({ ...data });
      setSelectedTemplate(data);
    } else if (mode === 'create') {
      setFormData({
        name: '',
        title: 'CERTIFICADO',
        body: 'Certificamos que {nome} completou...',
        bgImage: '',
        signatureName: ''
      });
    }
    setShowModal(true);
  };

  const handleSaveTemplate = () => {
    if (modalMode === 'create') {
      const newTemplate = {
        ...formData,
        id: Date.now(),
        created_at: new Date().toISOString().split('T')[0]
      };
      setTemplates([...templates, newTemplate]);
    } else if (modalMode === 'edit') {
      setTemplates(templates.map(t => t.id === selectedTemplate.id ? { ...formData, id: t.id, created_at: t.created_at } : t));
    }
    setShowModal(false);
  };

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este modelo?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredIssued = issued.filter(i => 
    i.userName.toLowerCase().includes(search.toLowerCase()) || 
    i.templateName.toLowerCase().includes(search.toLowerCase()) ||
    i.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="text-purple-600" size={28} />
            Certificados
          </h1>
          <p className="text-gray-500 mt-1">Gerencie modelos e emissão de certificados digitais.</p>
        </div>
        <button 
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} /> Novo Modelo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'templates' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Modelos de Certificado
        </button>
        <button
          onClick={() => setActiveTab('issued')}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'issued' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Certificados Emitidos
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={activeTab === 'templates' ? "Buscar modelos..." : "Buscar certificados..."}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>

        {activeTab === 'templates' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  {template.bgImage ? (
                    <img src={template.bgImage} alt={template.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Award size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => handleOpenModal('edit', template)} className="p-2 bg-white rounded-full text-gray-700 hover:text-purple-600 transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteTemplate(template.id)} className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">Criado em: {template.created_at}</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <PenTool size={14} className="mt-1 text-gray-400" />
                      <span className="line-clamp-1">{template.title}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <FileText size={14} className="mt-1 text-gray-400" />
                      <span className="line-clamp-2 text-xs">{template.body}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Certificado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredIssued.map(cert => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{cert.code}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{cert.userName}</span>
                        <span className="text-xs text-gray-500">{cert.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{cert.templateName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cert.issueDate}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-purple-600 hover:text-purple-800 transition-colors p-1">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Template Editor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Novo Modelo de Certificado' : 'Editar Modelo'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Modelo (Interno)</label>
                  <input
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Ex: Conclusão Onboarding"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título do Certificado</label>
                  <input
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Ex: CERTIFICADO DE EXCELÊNCIA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Corpo</label>
                  <p className="text-xs text-gray-500 mb-2">Variáveis disponíveis: {'{nome}'}, {'{data}'}, {'{curso}'}</p>
                  <textarea
                    value={formData.body}
                    onChange={e => setFormData({...formData, body: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem de Fundo</label>
                  <input
                    value={formData.bgImage}
                    onChange={e => setFormData({...formData, bgImage: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Signatário</label>
                  <input
                    value={formData.signatureName}
                    onChange={e => setFormData({...formData, signatureName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Ex: João da Silva - CEO"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center">
                <h3 className="text-sm font-semibold text-gray-500 mb-4 w-full">Pré-visualização</h3>
                <div className="relative w-full aspect-[1.414/1] bg-white shadow-lg overflow-hidden text-center flex flex-col items-center justify-center p-8">
                  {formData.bgImage && (
                    <img src={formData.bgImage} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
                  )}
                  <div className="relative z-10 w-full">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6 uppercase tracking-widest">{formData.title || 'TÍTULO'}</h2>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-8 px-4 font-serif italic">
                      {formData.body ? formData.body.replace('{nome}', 'Nome do Usuário').replace('{data}', '01/01/2024') : 'Texto do certificado...'}
                    </p>
                    <div className="mt-8 pt-4 border-t border-gray-400 inline-block px-12">
                      <p className="font-serif font-bold text-gray-800">{formData.signatureName || 'Assinatura'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Check size={18} /> Salvar Modelo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
