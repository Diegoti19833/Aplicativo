import React, { useState } from 'react';
import { BookOpen, Plus, Search, Trash2, Edit, Check, X, Filter, Upload, FileQuestion, HelpCircle, Award } from 'lucide-react';

export default function AdminQuizBank() {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: 'Qual é o princípio fundamental do atendimento ao cliente?',
      options: ['Rapidez', 'Empatia', 'Venda a qualquer custo', 'Ignorar reclamações'],
      correctAnswer: 1, // Index of correct option
      category: 'Atendimento',
      difficulty: 'Fácil',
      xp: 10
    },
    {
      id: 2,
      text: 'O que significa CRM?',
      options: ['Customer Relationship Management', 'Customer Return Model', 'Central de Reclamações Mista', 'Controle de Receita Mensal'],
      correctAnswer: 0,
      category: 'Vendas',
      difficulty: 'Médio',
      xp: 20
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: 'Geral',
    difficulty: 'Fácil',
    xp: 10
  });

  const handleOpenModal = (mode, data = null) => {
    setModalMode(mode);
    if (mode === 'edit' && data) {
      setFormData({ ...data });
      setCurrentQuestion(data);
    } else {
      setFormData({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        category: 'Geral',
        difficulty: 'Fácil',
        xp: 10
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (modalMode === 'create') {
      const newQ = { ...formData, id: Date.now() };
      setQuestions([...questions, newQ]);
    } else {
      setQuestions(questions.map(q => q.id === currentQuestion.id ? { ...formData, id: q.id } : q));
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Excluir esta questão?')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || q.category === filterCategory;
    const matchDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchSearch && matchCategory && matchDifficulty;
  });

  const categories = [...new Set(questions.map(q => q.category))];

  return (
    <div className="p-8 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={28} />
            Banco de Questões
          </h1>
          <p className="text-gray-500 mt-1">Gerencie as perguntas utilizadas em quizzes e avaliações.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
            <Upload size={18} /> Importar CSV
          </button>
          <button 
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={20} /> Nova Questão
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar questão..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg">
             <Filter size={16} className="text-gray-400" />
             <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-transparent border-none text-sm text-gray-700 focus:outline-none cursor-pointer"
             >
                <option value="all">Todas Categorias</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg">
             <HelpCircle size={16} className="text-gray-400" />
             <select 
                value={filterDifficulty} 
                onChange={e => setFilterDifficulty(e.target.value)}
                className="bg-transparent border-none text-sm text-gray-700 focus:outline-none cursor-pointer"
             >
                <option value="all">Todas Dificuldades</option>
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Difícil">Difícil</option>
             </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="grid gap-4">
        {filteredQuestions.map(q => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    q.difficulty === 'Fácil' ? 'bg-green-100 text-green-700' : 
                    q.difficulty === 'Médio' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                    {q.category}
                  </span>
                  <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-medium border border-green-100">
                    <Award size={12} />
                    {q.points} Pontos
                  </span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900 text-lg mb-4">{q.text}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, idx) => (
                  <div key={idx} className={`p-3 rounded-lg text-sm border flex items-center gap-3 ${
                    idx === q.correctAnswer 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-gray-50 border-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      idx === q.correctAnswer ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
                    }`}>
                      {idx === q.correctAnswer && <Check size={12} />}
                    </div>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
              <button 
                onClick={() => handleOpenModal('edit', q)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                title="Editar"
              >
                <Edit size={20} />
              </button>
              <button 
                onClick={() => handleDelete(q.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                title="Excluir"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileQuestion size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Nenhuma questão encontrada</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Nova Questão' : 'Editar Questão'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enunciado da Pergunta</label>
                <textarea
                  value={formData.text}
                  onChange={e => setFormData({...formData, text: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="Digite a pergunta aqui..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <input
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    list="categories-list"
                  />
                  <datalist id="categories-list">
                    <option value="Atendimento" />
                    <option value="Vendas" />
                    <option value="Produto" />
                    <option value="Institucional" />
                  </datalist>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Dificuldade</label>
                   <select 
                      value={formData.difficulty} 
                      onChange={e => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   >
                      <option value="Fácil">Fácil</option>
                      <option value="Médio">Médio</option>
                      <option value="Difícil">Difícil</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Opções de Resposta</label>
                <div className="space-y-3">
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === idx}
                        onChange={() => setFormData({...formData, correctAnswer: idx})}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <input
                        value={opt}
                        onChange={e => {
                          const newOptions = [...formData.options];
                          newOptions[idx] = e.target.value;
                          setFormData({...formData, options: newOptions});
                        }}
                        className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formData.correctAnswer === idx ? 'border-green-300 bg-green-50' : 'border-gray-200'
                        }`}
                        placeholder={`Opção ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-8">Selecione o botão radial para marcar a resposta correta.</p>
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Recompensa (Pontos)</label>
                 <input
                    type="number"
                    value={formData.points}
                    onChange={e => setFormData({...formData, points: Number(e.target.value)})}
                    className="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                 />
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
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Check size={18} /> Salvar Questão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}