import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Book, PlayCircle, X, Check, Video, FileText, Pencil, Trash, List, Clock, AlignLeft, ExternalLink, HelpCircle } from 'lucide-react';
import { AdminDb } from '../../services/adminDb';

const QuizBuilder = ({ value, onChange }) => {
  const quiz = value || { title: '', questions: [] };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      options: [
        { id: Date.now() + 1, text: '', isCorrect: false },
        { id: Date.now() + 2, text: '', isCorrect: false }
      ]
    };
    onChange({ ...quiz, questions: [...(quiz.questions || []), newQuestion] });
  };

  const updateQuestion = (qId, updates) => {
    const newQuestions = (quiz.questions || []).map(q => q.id === qId ? { ...q, ...updates } : q);
    onChange({ ...quiz, questions: newQuestions });
  };

  const removeQuestion = (qId) => {
    onChange({ ...quiz, questions: (quiz.questions || []).filter(q => q.id !== qId) });
  };

  const addOption = (qId) => {
    const newQuestions = (quiz.questions || []).map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: [...(q.options || []), { id: Date.now(), text: '', isCorrect: false }]
        };
      }
      return q;
    });
    onChange({ ...quiz, questions: newQuestions });
  };

  const updateOption = (qId, optId, updates) => {
    const newQuestions = (quiz.questions || []).map(q => {
      if (q.id === qId) {
        const newOptions = (q.options || []).map(o => o.id === optId ? { ...o, ...updates } : o);
        if (updates.isCorrect) {
             newOptions.forEach(o => {
                 if (o.id !== optId) o.isCorrect = false;
             });
        }
        return { ...q, options: newOptions };
      }
      return q;
    });
    onChange({ ...quiz, questions: newQuestions });
  };

  const removeOption = (qId, optId) => {
     const newQuestions = (quiz.questions || []).map(q => {
      if (q.id === qId) {
        return { ...q, options: (q.options || []).filter(o => o.id !== optId) };
      }
      return q;
    });
    onChange({ ...quiz, questions: newQuestions });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
      <div>
         <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Título do Quiz</label>
         <input 
            className="input" 
            style={{ width: '100%', padding: 10 }}
            value={quiz.title || ''}
            onChange={e => onChange({ ...quiz, title: e.target.value })}
            placeholder="Ex: Avaliação de Conhecimentos"
         />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {quiz.questions?.map((q, index) => (
          <div key={q.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#f9fafb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
               <span style={{ fontWeight: 600, color: '#374151' }}>Pergunta {index + 1}</span>
               <button onClick={() => removeQuestion(q.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>Remover Pergunta</button>
            </div>
            
            <input 
              className="input" 
              style={{ width: '100%', marginBottom: 12, padding: 10 }} 
              value={q.text} 
              onChange={e => updateQuestion(q.id, { text: e.target.value })}
              placeholder="Digite a pergunta..."
            />

            <div style={{ display: 'grid', gap: 8, paddingLeft: 12 }}>
               {(q.options || []).map((opt, optIndex) => (
                 <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div 
                      onClick={() => updateOption(q.id, opt.id, { isCorrect: true })}
                      style={{ 
                        width: 20, height: 20, borderRadius: '50%', border: opt.isCorrect ? '5px solid #059669' : '2px solid #D1D5DB',
                        background: opt.isCorrect ? '#059669' : 'transparent',
                        cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                      title="Marcar como correta"
                    >
                        {opt.isCorrect && <Check size={12} color="white" />}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#6B7280', width: 20 }}>{String.fromCharCode(65 + optIndex)}</span>
                    <input 
                       className="input" 
                       style={{ flex: 1, padding: 8, borderColor: opt.isCorrect ? '#059669' : '#e5e7eb' }}
                       value={opt.text}
                       onChange={e => updateOption(q.id, opt.id, { text: e.target.value })}
                       placeholder={`Opção ${String.fromCharCode(65 + optIndex)}`}
                    />
                    <button onClick={() => removeOption(q.id, opt.id)} style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                 </div>
               ))}
               <button 
                 onClick={() => addOption(q.id)}
                 style={{ color: '#0047AB', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, textAlign: 'left', marginTop: 4 }}
               >
                 + Adicionar Alternativa
               </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={addQuestion}
        className="btn-secondary"
        style={{ padding: 12, border: '1px dashed #0047AB', color: '#0047AB', background: '#EFF6FF', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
      >
        + Adicionar Pergunta
      </button>
    </div>
  );
};

export default function AdminTrilhas() {
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingTrail, setSavingTrail] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  
  // Modals state
  const [showNewTrailModal, setShowNewTrailModal] = useState(false);
  const [showEditTrailModal, setShowEditTrailModal] = useState(false);
  const [showNewLessonModal, setShowNewLessonModal] = useState(false);
  const [showManageLessonsModal, setShowManageLessonsModal] = useState(false);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);

  // Selection state
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [currentTrailLessons, setCurrentTrailLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [search, setSearch] = useState('');
  
  // Form states
  const [newTrailData, setNewTrailData] = useState({ title: '', level: 'Básico', estimatedMinutes: 60, description: '' });
  const [editingTrailData, setEditingTrailData] = useState(null);
  const [newLessonData, setNewLessonData] = useState({ title: '', type: 'video', content: '', durationMinutes: 15, quizData: null });
  const [editingLessonData, setEditingLessonData] = useState(null);

  useEffect(() => {
    loadTrails();
  }, []);

  const formatMinutes = (mins) => {
    const m = Number(mins) || 0;
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h <= 0) return `${r}min`;
    if (r <= 0) return `${h}h`;
    return `${h}h ${r}min`;
  };

  const loadTrails = async () => {
    try {
      setLoading(true);
      const data = await AdminDb.trails.list();
      setTrails(data);
    } catch (e) {
      alert(e?.message || 'Falha ao carregar trilhas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrail = async () => {
    if (!newTrailData.title) return alert('Preencha o título da trilha');
    try {
      setSavingTrail(true);
      await AdminDb.trails.create({
        title: newTrailData.title,
        description: newTrailData.description,
        levelLabel: newTrailData.level,
        estimatedMinutes: newTrailData.estimatedMinutes,
      });
      setNewTrailData({ title: '', level: 'Básico', estimatedMinutes: 60, description: '' });
      setShowNewTrailModal(false);
      await loadTrails();
      alert('Trilha criada com sucesso!');
    } catch (e) {
      alert(e?.message || 'Falha ao criar trilha');
    } finally {
      setSavingTrail(false);
    }
  };

  const handleUpdateTrail = async () => {
    if (!editingTrailData.title) return alert('Preencha o título da trilha');
    try {
      setSavingTrail(true);
      await AdminDb.trails.update({
        id: editingTrailData.id,
        title: editingTrailData.title,
        description: editingTrailData.description,
        levelLabel: editingTrailData.level,
        estimatedMinutes: editingTrailData.estimatedMinutes,
        isActive: editingTrailData.is_active
      });
      setEditingTrailData(null);
      setShowEditTrailModal(false);
      await loadTrails();
    } catch (e) {
      alert(e?.message || 'Falha ao atualizar trilha');
    } finally {
      setSavingTrail(false);
    }
  };

  const handleDeleteTrail = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta trilha? Todas as aulas serão removidas.')) return;
    try {
      await AdminDb.trails.remove({ id });
      await loadTrails();
    } catch (e) {
      alert(e?.message || 'Falha ao excluir trilha');
    }
  };

  const openEditTrailModal = (trail) => {
    setEditingTrailData({
      id: trail.id,
      title: trail.title,
      description: trail.description || '',
      level: trail.difficulty_level === 1 ? 'Básico' : trail.difficulty_level === 3 ? 'Intermediário' : 'Avançado',
      estimatedMinutes: trail.estimated_duration,
      is_active: trail.is_active
    });
    setShowEditTrailModal(true);
  };

  const handleManageLessons = async (trail) => {
    setSelectedTrail(trail);
    try {
      const lessons = await AdminDb.lessons.listByTrail({ trailId: trail.id });
      setCurrentTrailLessons(lessons);
      setShowManageLessonsModal(true);
    } catch (e) {
      alert(e?.message || 'Erro ao carregar aulas');
    }
  };

  const handleCreateLesson = async () => {
    if (!newLessonData.title || !selectedTrail) return alert('Preencha os dados da aula');
    try {
      setSavingLesson(true);
      
      let finalContent = newLessonData.content;
      if (newLessonData.type === 'quiz') {
          finalContent = JSON.stringify(newLessonData.quizData || { title: newLessonData.title, questions: [] });
      }

      await AdminDb.lessons.create({
        trailId: selectedTrail.id,
        title: newLessonData.title,
        type: newLessonData.type,
        contentOrUrl: finalContent,
        durationMinutes: newLessonData.durationMinutes,
      });
      setNewLessonData({ title: '', type: 'video', content: '', durationMinutes: 15, quizData: null });
      setShowNewLessonModal(false);
      // Refresh lessons list if managing
      if (showManageLessonsModal) {
         const lessons = await AdminDb.lessons.listByTrail({ trailId: selectedTrail.id });
         setCurrentTrailLessons(lessons);
      }
      await loadTrails(); // Update total lessons count
      alert('Aula criada com sucesso!');
    } catch (e) {
      alert(e?.message || 'Falha ao criar aula');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleUpdateLesson = async () => {
    if (!editingLessonData.title) return alert('Preencha o título da aula');
    try {
      setSavingLesson(true);

      let finalContent = editingLessonData.content;
      if (editingLessonData.type === 'quiz') {
          finalContent = JSON.stringify(editingLessonData.quizData || { title: editingLessonData.title, questions: [] });
      }

      await AdminDb.lessons.update({
        id: editingLessonData.id,
        title: editingLessonData.title,
        type: editingLessonData.type,
        contentOrUrl: finalContent,
        durationMinutes: editingLessonData.durationMinutes,
      });
      setEditingLessonData(null);
      setShowEditLessonModal(false);
      
      // Refresh lessons list
      if (selectedTrail) {
        const lessons = await AdminDb.lessons.listByTrail({ trailId: selectedTrail.id });
        setCurrentTrailLessons(lessons);
      }
      await loadTrails();
    } catch (e) {
      alert(e?.message || 'Falha ao atualizar aula');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta aula?')) return;
    try {
      await AdminDb.lessons.remove({ id: lessonId });
      // Refresh lessons list
      if (selectedTrail) {
        const lessons = await AdminDb.lessons.listByTrail({ trailId: selectedTrail.id });
        setCurrentTrailLessons(lessons);
      }
      await loadTrails();
    } catch (e) {
      alert(e?.message || 'Falha ao excluir aula');
    }
  };

  const openLessonModal = (trail) => {
    setSelectedTrail(trail);
    setShowNewLessonModal(true);
  };

  const openEditLessonModal = (lesson) => {
    let quizData = null;
    const type = lesson.lesson_type === 'video' ? 'video' : lesson.lesson_type === 'quiz' ? 'quiz' : 'text';
    let content = lesson.video_url || lesson.content || '';

    if (type === 'quiz') {
        try {
            quizData = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content;
        } catch (e) {
            quizData = { title: lesson.title, questions: [] };
        }
    }

    setEditingLessonData({
      id: lesson.id,
      title: lesson.title,
      type: type,
      content: content,
      durationMinutes: lesson.duration,
      quizData: quizData
    });
    setShowEditLessonModal(true);
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Trilhas & Aulas</h1>
          <p style={{ color: '#6B7280' }}>Gerencie o conteúdo educacional da plataforma.</p>
        </div>
        <button 
          onClick={() => setShowNewTrailModal(true)}
          className="btn-primary" 
          style={{ 
            background: '#0047AB', color: 'white', border: 'none', padding: '10px 20px', 
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600 
          }}
        >
          <Plus size={20} />
          Nova Trilha
        </button>
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 10 }} />
            <input 
              placeholder="Buscar trilhas..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                width: '100%', padding: '8px 12px 8px 40px', borderRadius: 8, 
                border: '1px solid #e5e7eb', fontSize: 14 
              }} 
            />
          </div>
          <select style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>
            <option>Todos os Níveis</option>
            <option>Básico</option>
            <option>Intermediário</option>
            <option>Avançado</option>
          </select>
        </div>

        {loading ? (
          <div style={{ padding: 24 }}>Carregando trilhas...</div>
        ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, color: '#6B7280', fontWeight: 600 }}>TÍTULO</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, color: '#6B7280', fontWeight: 600 }}>MÓDULOS</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, color: '#6B7280', fontWeight: 600 }}>DURAÇÃO</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, color: '#6B7280', fontWeight: 600 }}>STATUS</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, color: '#6B7280', fontWeight: 600 }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {trails
              .filter((t) => {
                if (!search.trim()) return true
                return String(t.title || '').toLowerCase().includes(search.trim().toLowerCase())
              })
              .map((trail) => (
              <tr key={trail.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: '#EFF6FF', borderRadius: 8, display: 'grid', placeItems: 'center', color: '#0047AB' }}>
                      <Book size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1F2937' }}>{trail.title}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>Nível {trail.difficulty_level}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#6B7280' }}>{trail.total_lessons || 0} módulos</td>
                <td style={{ padding: '16px 24px', color: '#6B7280' }}>{formatMinutes(trail.estimated_duration)}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                    background: trail.is_active ? '#ECFDF5' : '#F3F4F6',
                    color: trail.is_active ? '#059669' : '#4B5563'
                  }}>
                    {trail.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleManageLessons(trail)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginRight: 8 }}
                    title="Gerenciar Aulas"
                  >
                    <List size={18} color="#4B5563" />
                  </button>
                  <button 
                    onClick={() => openEditTrailModal(trail)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginRight: 8 }}
                    title="Editar Trilha"
                  >
                    <Pencil size={18} color="#4B5563" />
                  </button>
                  <button 
                    onClick={() => handleDeleteTrail(trail.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginRight: 8 }}
                    title="Excluir Trilha"
                  >
                    <Trash size={18} color="#EF4444" />
                  </button>
                  <button 
                    onClick={() => openLessonModal(trail)}
                    style={{ background: '#EFF6FF', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 6, color: '#0047AB', fontSize: 12, fontWeight: 600 }}
                    title="Adicionar Aula Rápida"
                  >
                    + Aula
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Quick Action Card */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 32 }}>
        <div 
          onClick={() => { if (trails[0]) { setSelectedTrail(trails[0]); setShowNewLessonModal(true); } }}
          className="card" 
          style={{ padding: 24, border: '1px dashed #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, cursor: 'pointer', background: '#f9fafb' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E0E7FF', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
            <PlayCircle size={24} color="#4F46E5" />
          </div>
          <div style={{ fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>Criar Nova Aula Rápida</div>
          <div style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>Adicione conteúdo para a primeira trilha.</div>
        </div>
      </div>

      {/* NEW TRAIL MODAL */}
      {showNewTrailModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: 500, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Nova Trilha</h3>
              <button onClick={() => setShowNewTrailModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Título</label>
                <input className="input" style={{ width: '100%' }} value={newTrailData.title} onChange={e => setNewTrailData({...newTrailData, title: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Descrição</label>
                <textarea className="input" style={{ width: '100%', minHeight: 80 }} value={newTrailData.description} onChange={e => setNewTrailData({...newTrailData, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Nível</label>
                  <select className="input" style={{ width: '100%' }} value={newTrailData.level} onChange={e => setNewTrailData({...newTrailData, level: e.target.value})}>
                    <option>Básico</option>
                    <option>Intermediário</option>
                    <option>Avançado</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Duração Estimada (min)</label>
                  <input className="input" type="number" style={{ width: '100%' }} value={newTrailData.estimatedMinutes} onChange={e => setNewTrailData({...newTrailData, estimatedMinutes: Number(e.target.value)})} />
                </div>
              </div>
              <button 
                onClick={handleCreateTrail} 
                disabled={savingTrail} 
                className="btn-primary" 
                style={{ 
                  marginTop: 24, 
                  justifyContent: 'center',
                  background: '#0047AB',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 16,
                  width: '100%'
                }}
              >
                {savingTrail ? 'Criando...' : 'Criar Trilha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TRAIL MODAL */}
      {showEditTrailModal && editingTrailData && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: 500, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Editar Trilha</h3>
              <button onClick={() => setShowEditTrailModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Título</label>
                <input className="input" style={{ width: '100%' }} value={editingTrailData.title} onChange={e => setEditingTrailData({...editingTrailData, title: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Descrição</label>
                <textarea className="input" style={{ width: '100%', minHeight: 80 }} value={editingTrailData.description} onChange={e => setEditingTrailData({...editingTrailData, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Nível</label>
                  <select className="input" style={{ width: '100%' }} value={editingTrailData.level} onChange={e => setEditingTrailData({...editingTrailData, level: e.target.value})}>
                    <option>Básico</option>
                    <option>Intermediário</option>
                    <option>Avançado</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Duração Estimada (min)</label>
                  <input className="input" type="number" style={{ width: '100%' }} value={editingTrailData.estimatedMinutes} onChange={e => setEditingTrailData({...editingTrailData, estimatedMinutes: Number(e.target.value)})} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 <input type="checkbox" checked={editingTrailData.is_active} onChange={e => setEditingTrailData({...editingTrailData, is_active: e.target.checked})} />
                 <label>Trilha Ativa</label>
              </div>
              <button 
                onClick={handleUpdateTrail} 
                disabled={savingTrail} 
                className="btn-primary" 
                style={{ 
                  marginTop: 24, 
                  justifyContent: 'center',
                  background: '#0047AB',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 16,
                  width: '100%'
                }}
              >
                {savingTrail ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE LESSONS MODAL */}
      {showManageLessonsModal && selectedTrail && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: 700, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: 24, borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <h3 style={{ fontSize: 18, fontWeight: 700 }}>Gerenciar Aulas</h3>
                 <p style={{ color: '#6B7280', fontSize: 14 }}>{selectedTrail.title}</p>
               </div>
               <div style={{ display: 'flex', gap: 8 }}>
                 <button 
                   onClick={() => setShowNewLessonModal(true)}
                   className="btn-primary" 
                   style={{ padding: '8px 16px', fontSize: 14, display: 'flex', gap: 6, alignItems: 'center', background: '#0047AB', color: 'white', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600 }}
                 >
                   <Plus size={16} /> Nova Aula
                 </button>
                 <button onClick={() => setShowManageLessonsModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20}/></button>
               </div>
            </div>
            <div style={{ overflowY: 'auto', padding: 24 }}>
               {currentTrailLessons.length === 0 ? (
                 <div style={{ textAlign: 'center', color: '#6B7280', padding: 32 }}>Nenhuma aula cadastrada nesta trilha.</div>
               ) : (
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                     <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                       <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#6B7280' }}>ORDEM</th>
                       <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#6B7280' }}>TÍTULO</th>
                       <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#6B7280' }}>TIPO</th>
                       <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, color: '#6B7280' }}>AÇÕES</th>
                     </tr>
                   </thead>
                   <tbody>
                     {currentTrailLessons.map((lesson, idx) => (
                       <tr key={lesson.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                         <td style={{ padding: '12px 0', width: 60 }}>{idx + 1}</td>
                         <td style={{ padding: '12px 0' }}>{lesson.title}</td>
                         <td style={{ padding: '12px 0' }}>
                            <span style={{ 
                              padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                              background: lesson.lesson_type === 'video' ? '#EFF6FF' : lesson.lesson_type === 'quiz' ? '#FEF3C7' : '#F3F4F6',
                              color: lesson.lesson_type === 'video' ? '#1D4ED8' : lesson.lesson_type === 'quiz' ? '#D97706' : '#4B5563'
                            }}>
                              {lesson.lesson_type === 'video' ? 'VÍDEO' : lesson.lesson_type === 'quiz' ? 'QUIZ' : 'TEXTO'}
                            </span>
                         </td>
                         <td style={{ padding: '12px 0', textAlign: 'right' }}>
                           <button onClick={() => openEditLessonModal(lesson)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 8 }} title="Editar">
                             <Pencil size={16} color="#4B5563" />
                           </button>
                           <button onClick={() => handleDeleteLesson(lesson.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Excluir">
                             <Trash size={16} color="#DC2626" />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
            </div>
          </div>
        </div>
      )}

      {/* NEW LESSON MODAL */}
      {showNewLessonModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: 600, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Nova Aula</h3>
              <button onClick={() => setShowNewLessonModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display: 'grid', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Título da Aula</label>
                <input className="input" style={{ width: '100%', padding: 10 }} value={newLessonData.title} onChange={e => setNewLessonData({...newLessonData, title: e.target.value})} placeholder="Ex: Introdução ao Atendimento" />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Tipo de Conteúdo</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button 
                    onClick={() => setNewLessonData({...newLessonData, type: 'video'})}
                    style={{ 
                      flex: 1, padding: 16, border: newLessonData.type === 'video' ? '2px solid #0047AB' : '1px solid #e5e7eb', 
                      borderRadius: 12, background: newLessonData.type === 'video' ? '#EFF6FF' : 'white', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                    }}
                  >
                    <Video size={24} color={newLessonData.type === 'video' ? '#0047AB' : '#6B7280'} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: newLessonData.type === 'video' ? '#0047AB' : '#374151' }}>Vídeo Aula</span>
                  </button>
                  <button 
                    onClick={() => setNewLessonData({...newLessonData, type: 'text'})}
                    style={{ 
                      flex: 1, padding: 16, border: newLessonData.type === 'text' ? '2px solid #0047AB' : '1px solid #e5e7eb', 
                      borderRadius: 12, background: newLessonData.type === 'text' ? '#EFF6FF' : 'white', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                    }}
                  >
                    <FileText size={24} color={newLessonData.type === 'text' ? '#0047AB' : '#6B7280'} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: newLessonData.type === 'text' ? '#0047AB' : '#374151' }}>Texto / Artigo</span>
                  </button>
                  <button 
                    onClick={() => setNewLessonData({...newLessonData, type: 'quiz', quizData: newLessonData.quizData || { title: newLessonData.title, questions: [] }})}
                    style={{ 
                      flex: 1, padding: 16, border: newLessonData.type === 'quiz' ? '2px solid #0047AB' : '1px solid #e5e7eb', 
                      borderRadius: 12, background: newLessonData.type === 'quiz' ? '#EFF6FF' : 'white', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                    }}
                  >
                    <HelpCircle size={24} color={newLessonData.type === 'quiz' ? '#0047AB' : '#6B7280'} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: newLessonData.type === 'quiz' ? '#0047AB' : '#374151' }}>Quiz</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Duração Estimada (min)</label>
                <input className="input" type="number" style={{ width: '100%', padding: 10 }} value={newLessonData.durationMinutes} onChange={e => setNewLessonData({...newLessonData, durationMinutes: Number(e.target.value)})} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                  {newLessonData.type === 'video' ? 'URL do Vídeo' : newLessonData.type === 'quiz' ? 'Conteúdo do Quiz' : 'Conteúdo da Aula'}
                </label>
                {newLessonData.type === 'video' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      className="input" 
                      style={{ flex: 1, padding: 10 }} 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      value={newLessonData.content} 
                      onChange={e => setNewLessonData({...newLessonData, content: e.target.value})} 
                    />
                    {newLessonData.content && (
                      <a 
                        href={newLessonData.content} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', color: '#374151' }}
                        title="Testar Link"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                ) : newLessonData.type === 'quiz' ? (
                  <QuizBuilder 
                    value={newLessonData.quizData} 
                    onChange={(val) => setNewLessonData({...newLessonData, quizData: val})} 
                  />
                ) : (
                  <textarea 
                    className="input" 
                    style={{ width: '100%', minHeight: 150, padding: 10, fontFamily: 'sans-serif' }} 
                    placeholder="Digite o conteúdo da aula aqui..." 
                    value={newLessonData.content} 
                    onChange={e => setNewLessonData({...newLessonData, content: e.target.value})} 
                  />
                )}
                {newLessonData.type === 'video' && (
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                  Cole o link direto do YouTube ou Vimeo.
                </p>
                )}
              </div>

              <button onClick={handleCreateLesson} disabled={savingLesson} className="btn-primary" style={{ marginTop: 8, justifyContent: 'center', padding: 12, fontSize: 16 }}>
                {savingLesson ? 'Salvando...' : 'Salvar Aula'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LESSON MODAL */}
      {showEditLessonModal && editingLessonData && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 120, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: 600, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Editar Aula</h3>
              <button onClick={() => setShowEditLessonModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <div style={{ display: 'grid', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Título da Aula</label>
                <input className="input" style={{ width: '100%', padding: 10 }} value={editingLessonData.title} onChange={e => setEditingLessonData({...editingLessonData, title: e.target.value})} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Tipo de Conteúdo</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button 
                    onClick={() => setEditingLessonData({...editingLessonData, type: 'video'})}
                    style={{ 
                      flex: 1, padding: 16, border: editingLessonData.type === 'video' ? '2px solid #0047AB' : '1px solid #e5e7eb', 
                      borderRadius: 12, background: editingLessonData.type === 'video' ? '#EFF6FF' : 'white', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                    }}
                  >
                    <Video size={24} color={editingLessonData.type === 'video' ? '#0047AB' : '#6B7280'} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: editingLessonData.type === 'video' ? '#0047AB' : '#374151' }}>Vídeo Aula</span>
                  </button>
                  <button 
                    onClick={() => setEditingLessonData({...editingLessonData, type: 'text'})}
                    style={{ 
                      flex: 1, padding: 16, border: editingLessonData.type === 'text' ? '2px solid #0047AB' : '1px solid #e5e7eb', 
                      borderRadius: 12, background: editingLessonData.type === 'text' ? '#EFF6FF' : 'white', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                    }}
                  >
                    <FileText size={24} color={editingLessonData.type === 'text' ? '#0047AB' : '#6B7280'} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: editingLessonData.type === 'text' ? '#0047AB' : '#374151' }}>Texto / Artigo</span>
                  </button>
                  <button 
                    onClick={() => setEditingLessonData({...editingLessonData, type: 'quiz', quizData: editingLessonData.quizData || { title: editingLessonData.title, questions: [] }})}
                    style={{ 
                      flex: 1, padding: 16, border: editingLessonData.type === 'quiz' ? '2px solid #0047AB' : '1px solid #e5e7eb', 
                      borderRadius: 12, background: editingLessonData.type === 'quiz' ? '#EFF6FF' : 'white', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                    }}
                  >
                    <HelpCircle size={24} color={editingLessonData.type === 'quiz' ? '#0047AB' : '#6B7280'} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: editingLessonData.type === 'quiz' ? '#0047AB' : '#374151' }}>Quiz</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>Duração Estimada (min)</label>
                <input className="input" type="number" style={{ width: '100%', padding: 10 }} value={editingLessonData.durationMinutes} onChange={e => setEditingLessonData({...editingLessonData, durationMinutes: Number(e.target.value)})} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                  {editingLessonData.type === 'video' ? 'URL do Vídeo' : editingLessonData.type === 'quiz' ? 'Conteúdo do Quiz' : 'Conteúdo da Aula'}
                </label>
                 {editingLessonData.type === 'video' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      className="input" 
                      style={{ flex: 1, padding: 10 }} 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      value={editingLessonData.content} 
                      onChange={e => setEditingLessonData({...editingLessonData, content: e.target.value})} 
                    />
                    {editingLessonData.content && (
                      <a 
                        href={editingLessonData.content} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', color: '#374151' }}
                        title="Testar Link"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                ) : editingLessonData.type === 'quiz' ? (
                  <QuizBuilder 
                    value={editingLessonData.quizData} 
                    onChange={(val) => setEditingLessonData({...editingLessonData, quizData: val})} 
                  />
                ) : (
                  <textarea 
                    className="input" 
                    style={{ width: '100%', minHeight: 150, padding: 10, fontFamily: 'sans-serif' }} 
                    placeholder="Digite o conteúdo da aula aqui..." 
                    value={editingLessonData.content} 
                    onChange={e => setEditingLessonData({...editingLessonData, content: e.target.value})} 
                  />
                )}
              </div>

              <button onClick={handleUpdateLesson} disabled={savingLesson} className="btn-primary" style={{ marginTop: 8, justifyContent: 'center', padding: 12, fontSize: 16 }}>
                {savingLesson ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
