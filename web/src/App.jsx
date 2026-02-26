import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom'
import './index.css'
import {
  Home, Map, Trophy, User, ShoppingBag, Settings, LogOut,
  CheckCircle, PlayCircle, Star, Award, Gift, Bell, Volume2,
  LayoutDashboard, Lock, Mail, ArrowRight, ChevronRight, Briefcase,
  CreditCard, Package, BookOpen
} from 'lucide-react'
import TrailsSection from './components/trails/TrailsSection'

import AdminDashboard from './components/admin/AdminDashboard'
import StudentDashboard from './components/student/StudentDashboard'
import Login from './components/Login'
import { AdminDb } from './services/adminDb'
import { isSupabaseConfigured } from './services/supabaseClient'

// --- Components ---

function Sidebar() {
  const linkClass = ({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-green-50 text-brand' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
  const s = getSession()
  const isAdmin = s?.role === 'gerente' || s?.role === 'admin'

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-10 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-brand font-bold text-xl">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white">
            <Award size={20} />
          </div>
          PET CLASS
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavLink className={linkClass} to="/"> <Home size={20} /> <span>Início</span> </NavLink>
        <NavLink className={linkClass} to="/trilhas"> <Map size={20} /> <span>Trilhas</span> </NavLink>
        <NavLink className={linkClass} to="/ranking"> <Trophy size={20} /> <span>Ranking</span> </NavLink>
        <NavLink className={linkClass} to="/loja"> <ShoppingBag size={20} /> <span>Loja</span> </NavLink>
        <NavLink className={linkClass} to="/perfil"> <User size={20} /> <span>Perfil</span> </NavLink>
        {isAdmin && (
          <NavLink className={linkClass} to="/admin"> <LayoutDashboard size={20} /> <span>Admin</span> </NavLink>
        )}
        <div className="pt-4 mt-4 border-t border-gray-100">
          <NavLink className={linkClass} to="/config"> <Settings size={20} /> <span>Configurações</span> </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-brand font-bold text-xs">
            {s?.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{s?.name || 'Usuário'}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{s?.role || 'Funcionário'}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 pl-64">
      <Sidebar />
      <main className="max-w-7xl mx-auto p-8">
        {children}
      </main>
    </div>
  )
}

// --- Auth & Session ---

const getSession = () => {
  try { return JSON.parse(localStorage.getItem('pa_user') || 'null') } catch { return null }
}
const saveSession = (data) => {
  const current = getSession() || {}
  localStorage.setItem('pa_user', JSON.stringify({ ...current, ...data, logged: true }))
}
const clearSession = () => localStorage.removeItem('pa_user')

function RequireAuth({ children }) {
  const [ready, setReady] = useState(false)
  const [ok, setOk] = useState(false)
  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        if (!isSupabaseConfigured()) {
          const session = getSession()
          if (alive) {
            setOk(!!session?.logged)
            setReady(true)
          }
          return
        }
        const session = await AdminDb.auth.getSession()
        if (!alive) return
        if (!session) {
          clearSession()
          setOk(false)
        } else {
          setOk(true)
        }
      } catch {
        clearSession()
        if (alive) setOk(false)
      } finally {
        if (alive) setReady(true)
      }
    }
    run()
    return () => { alive = false }
  }, [])
  if (!ready) return <div className="flex items-center justify-center min-h-screen text-gray-500">Carregando...</div>
  if (!ok) return <Navigate to="/login" replace />
  return children
}

function RequireAdmin({ children }) {
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)
  useEffect(() => {
    let alive = true
    async function check() {
      const localSession = getSession()
      const localAllowed = !!localSession && ['admin', 'gerente'].includes(localSession.role)
      try {
        if (!isSupabaseConfigured()) {
          // In dev mode (no Supabase), allow if logged in at all
          if (alive) {
            setAllowed(!!localSession?.logged)
            setReady(true)
          }
          return
        }
        const profile = await AdminDb.auth.getMyProfile()
        if (alive) {
          setAllowed(!!(profile && ['admin', 'gerente'].includes(profile.role)) || localAllowed)
          setReady(true)
        }
      } catch {
        if (alive) { setAllowed(localAllowed); setReady(true) }
      }
    }
    check()
    return () => { alive = false }
  }, [])
  if (!ready) return <div className="flex items-center justify-center min-h-screen text-gray-500">Verificando permissões...</div>
  if (!allowed) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
        <Lock size={32} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
      <p className="text-gray-500 mb-6">Você precisa ter permissão de Admin ou Gerente para acessar este painel.</p>
      <div className="flex flex-col gap-3">
        <button onClick={() => { localStorage.removeItem('pa_user'); window.location.href = '/login'; }} className="btn btn-primary">
          Voltar ao Login
        </button>
        <button
          onClick={() => {
            const s = getSession() || {}
            saveSession({ ...s, role: 'gerente' })
            window.location.reload()
          }}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          🔧 Entrar como Gerente (modo dev)
        </button>
      </div>
    </div>
  )
  return children
}

// --- Pages ---

function SelectRole() {
  const navigate = useNavigate()
  const roles = [
    { key: 'gerente', label: 'Gerente', icon: <Briefcase size={24} /> },
    { key: 'funcionario', label: 'Funcionário', icon: <User size={24} /> },
    { key: 'caixa', label: 'Caixa', icon: <CreditCard size={24} /> }
  ]
  const choose = async (role) => {
    try {
      await AdminDb.auth.ensureUserRow()
      const profile = await AdminDb.auth.getMyProfile()
      if (profile?.id) await AdminDb.users.setRole({ id: profile.id, role })
      saveSession({ role })
      navigate('/')
    } catch (e) {
      alert(e?.message || 'Falha ao salvar perfil')
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Selecione seu perfil de acesso</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map(r => (
            <button
              key={r.key}
              onClick={() => choose(r.key)}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:border-brand hover:shadow-md transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-16 h-16 bg-green-50 text-brand rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                {r.icon}
              </div>
              <div className="font-semibold text-lg text-gray-900">{r.label}</div>
              <div className="text-sm text-brand font-medium">Entrar como {r.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const s = getSession() || { name: 'Aluno', role: 'funcionario' }
  const userName = s.name || 'Aluno'
  const role = s.role || 'funcionario'
  const xp = 1250
  const level = 2
  const progressPct = 25

  const nextLessonsByRole = {
    gerente: [
      { icon: <Briefcase size={20} />, label: 'Liderança' },
      { icon: <Package size={20} />, label: 'Gestão de Estoque' },
      { icon: <Trophy size={20} />, label: 'Metas' }
    ],
    funcionario: [
      { icon: <User size={20} />, label: 'Atendimento' },
      { icon: <ShoppingBag size={20} />, label: 'Vendas' },
      { icon: <Gift size={20} />, label: 'Produtos Pet' }
    ],
    caixa: [
      { icon: <CreditCard size={20} />, label: 'PDV' },
      { icon: <Trophy size={20} />, label: 'Fechamento' },
      { icon: <User size={20} />, label: 'Relacionamento' }
    ],
  }
  const next = nextLessonsByRole[role] || nextLessonsByRole.funcionario

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {userName}</h1>
          <p className="text-gray-500">Bem-vindo ao seu painel de treinamento.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Seu Progresso</h3>
                <p className="text-sm text-gray-500">Nível {level} • {xp} Pontos</p>
              </div>
              <div className="w-12 h-12 bg-green-50 text-brand rounded-full flex items-center justify-center font-bold">
                {level}
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
              <div className="bg-brand h-2.5 rounded-full" style={{ width: `${progressPct}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 text-right">{progressPct}% para o próximo nível</p>
          </div>

          {/* Active Lessons */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Próximas Aulas</h3>
              <button onClick={() => navigate('/trilhas')} className="text-sm text-brand font-medium hover:underline">Ver todas</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {next.map(n => (
                <button
                  key={n.label}
                  onClick={() => navigate('/aula')}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-brand hover:shadow-sm transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-50 group-hover:text-brand transition-colors">
                    {n.icon}
                  </div>
                  <div className="font-medium text-gray-900">{n.label}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    Iniciar <ArrowRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Achievements */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conquistas Recentes</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Medalha de Ouro</div>
                  <div className="text-xs text-gray-500">Completou 10 aulas</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <Star size={20} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Destaque da Semana</div>
                  <div className="text-xs text-gray-500">Top 3 no Ranking</div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Mission */}
          <div className="bg-gradient-to-r from-brand to-brand-dark p-6 rounded-xl shadow-md text-white">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Target size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Meta Diária</span>
            </div>
            <h3 className="font-bold text-lg mb-1">Ganhe 50 Pontos hoje</h3>
            <p className="text-sm opacity-80 mb-4">Complete uma aula ou quiz para atingir sua meta.</p>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div className="bg-white h-1.5 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Target({ size }) { return <Trophy size={size} /> } // Helper

function Trilhas() {
  const navigate = useNavigate()
  const s = getSession() || { role: 'funcionario' }
  const role = s.role || 'funcionario'
  const trilhasPorPapel = {
    gerente: ['Liderança', 'Gestão de Loja', 'Estoque'],
    funcionario: ['Atendimento', 'Vendas', 'Produtos Pet'],
    caixa: ['PDV', 'Fechamento', 'Relacionamento']
  }
  const nodes = trilhasPorPapel[role] || trilhasPorPapel.funcionario
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Trilhas de Aprendizagem</h2>
        <p className="text-gray-500">Cursos disponíveis para seu perfil profissional.</p>
      </div>
      <TrailsSection nodes={nodes} navigate={navigate} />
    </div>
  )
}

function AulaQuiz() {
  const navigate = useNavigate()
  const [answer, setAnswer] = useState(null)

  const confirm = () => {
    const ok = answer === 'Ouvir com atenção'
    if (ok) {
      alert('Resposta correta! +10 pontos')
      navigate('/trilhas')
    } else {
      alert('Tente novamente. Dica: A escuta ativa é fundamental.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-brand bg-green-50 px-3 py-1 rounded-full">Quiz de Fixação</span>
            <span className="text-sm text-gray-500">10 Pontos</span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Pergunta 1</h2>
          <p className="text-gray-600 mb-8">Qual a melhor abordagem inicial quando um cliente apresenta uma reclamação sobre um produto?</p>

          <div className="space-y-3">
            {['Ouvir com atenção e empatia', 'Interromper para explicar a política', 'Ignorar e chamar o gerente', 'Manter expressão séria e distante'].map(opt => (
              <label key={opt} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${answer === opt ? 'border-brand bg-green-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                <input type="radio" name="q1" className="w-4 h-4 text-brand" onChange={() => setAnswer(opt)} checked={answer === opt} />
                <span className={`ml-3 ${answer === opt ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{opt}</span>
              </label>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <button className="btn btn-primary flex-1" onClick={confirm} disabled={!answer}>Confirmar Resposta</button>
            <button className="btn btn-secondary" onClick={() => navigate('/trilhas')}>Pular</button>
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>Aula: Atendimento ao Cliente</span>
          <span>1/5 Questões</span>
        </div>
      </div>
    </div>
  )
}

function Ranking() {
  const s = getSession() || { name: 'Você' }
  const userName = s.name || 'Você'

  const data = [
    { pos: 1, name: 'Pedro', score: 320, level: 5, role: 'Vendedor' },
    { pos: 2, name: 'Maria', score: 310, level: 5, role: 'Gerente' },
    { pos: 3, name: 'João', score: 300, level: 4, role: 'Caixa' },
    { pos: 4, name: userName, score: 295, level: 4, role: 'Vendedor' },
    { pos: 5, name: 'Alice', score: 280, level: 3, role: 'Vendedor' },
    { pos: 6, name: 'Bruno', score: 270, level: 3, role: 'Caixa' },
    { pos: 7, name: 'Carla', score: 260, level: 3, role: 'Vendedor' },
    { pos: 8, name: 'Daniel', score: 250, level: 2, role: 'Estoquista' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ranking Geral</h2>
        <p className="text-gray-500">Acompanhe o desempenho da equipe.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-20">Posição</th>
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Nível</th>
                <th className="px-6 py-4 text-right">Pontuação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((d) => (
                <tr key={d.name} className={`hover:bg-gray-50 transition-colors ${d.name === userName ? 'bg-green-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                      ${d.pos === 1 ? 'bg-yellow-100 text-yellow-700' :
                        d.pos === 2 ? 'bg-gray-200 text-gray-700' :
                          d.pos === 3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                      {d.pos}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {d.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{d.name} {d.name === userName && '(Você)'}</div>
                        <div className="text-xs text-gray-500">{d.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Nível {d.level}</td>
                  <td className="px-6 py-4 text-right font-medium text-brand">{d.score} Pontos</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Perfil() {
  const navigate = useNavigate()
  const s = getSession() || { name: 'Aluno', role: 'funcionario' }
  const logout = async () => {
    try {
      await AdminDb.auth.signOut()
    } finally {
      clearSession()
      navigate('/login')
    }
  }
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Meu Perfil</h2>
        <p className="text-gray-500">Gerencie suas informações e preferências.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400 text-3xl font-bold">
          {s.name ? s.name.substring(0, 2).toUpperCase() : <User size={40} />}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{s.name || 'Aluno'}</h3>
        <p className="text-gray-500 capitalize mb-6">{s.role || 'Funcionário'}</p>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-brand">1250</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Pontos</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-brand">2</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Nível</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button className="btn btn-secondary w-full" onClick={() => navigate('/perfil/edit')}>
            <Settings size={16} /> Editar Perfil
          </button>
          <button className="btn btn-primary bg-red-600 hover:bg-red-700 border-red-600 w-full" onClick={logout}>
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>
      </div>
    </div>
  )
}

function PerfilEdit() {
  const navigate = useNavigate()
  const [name, setName] = useState('Maria')
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Editar Informações</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="pt-4 flex gap-3">
            <button className="btn btn-primary" onClick={() => navigate('/perfil')}>Salvar Alterações</button>
            <button className="btn btn-secondary" onClick={() => navigate('/perfil')}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Loja() {
  const itens = [
    { id: 1, nome: 'Certificado de Excelência', precoPontos: 200, icon: <Award size={32} /> },
    { id: 2, nome: 'Kit Boas-vindas', precoPontos: 500, icon: <Gift size={32} /> },
    { id: 3, nome: 'Caneca Corporativa', precoPontos: 350, icon: <ShoppingBag size={32} /> },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Loja de Benefícios</h2>
        <p className="text-gray-500">Troque seus pontos por recompensas exclusivas.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {itens.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-50 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
              {item.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{item.nome}</h3>
            <div className="text-brand font-semibold mb-4">{item.precoPontos} Pontos</div>
            <button className="btn btn-primary w-full text-sm">Resgatar</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Config() {
  const navigate = useNavigate()
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-500">Personalize sua experiência no sistema.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        <div className="p-6 flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              <Bell size={18} /> Notificações
            </div>
            <div className="text-sm text-gray-500">Receber alertas sobre progresso e novas aulas.</div>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
            <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
          </button>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              <Volume2 size={18} /> Sons do Sistema
            </div>
            <div className="text-sm text-gray-500">Ativar efeitos sonoros ao completar tarefas.</div>
          </div>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand">
            <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
          </button>
        </div>
        <div className="p-6">
          <button className="btn btn-primary" onClick={() => navigate('/')}>Voltar ao Início</button>
        </div>
      </div>
    </div>
  )
}

function Cadastro() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const canCreate = name && email && password
  const [loading, setLoading] = useState(false)
  const create = async () => {
    try {
      setLoading(true)
      const data = await AdminDb.auth.signUp({ email, password, name })
      if (!data?.session) {
        alert('Conta criada. Confirme o email para entrar.')
        navigate('/login')
        return
      }
      await AdminDb.auth.ensureUserRow()
      saveSession({ name, email, role: 'funcionario' })
      navigate('/selecionar')
    } catch (e) {
      alert(e?.message || 'Falha ao criar conta')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center">
        <div className="w-12 h-12 bg-brand text-white rounded-lg flex items-center justify-center mx-auto mb-4">
          <Award size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar Nova Conta</h2>

        <div className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400"><User size={18} /></span>
              <input className="input pl-10" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Corporativo</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400"><Mail size={18} /></span>
              <input className="input pl-10" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400"><Lock size={18} /></span>
              <input type="password" className="input pl-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <button className="btn btn-primary w-full mt-2" disabled={!canCreate || loading} onClick={create}>
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <button className="text-brand text-sm font-medium hover:underline" onClick={() => navigate('/login')}>
            Já possui uma conta? Entrar
          </button>
        </div>
      </div>
    </div>
  )
}

function Admin() {
  return <AdminDashboard />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/selecionar" element={<RequireAuth><SelectRole /></RequireAuth>} />

        {/* User Routes with Layout */}
        <Route path="/trilhas" element={<RequireAuth><Layout><Trilhas /></Layout></RequireAuth>} />
        <Route path="/aula" element={<RequireAuth><Layout><AulaQuiz /></Layout></RequireAuth>} />
        <Route path="/ranking" element={<RequireAuth><Layout><Ranking /></Layout></RequireAuth>} />
        <Route path="/perfil" element={<RequireAuth><Layout><Perfil /></Layout></RequireAuth>} />
        <Route path="/perfil/edit" element={<RequireAuth><Layout><PerfilEdit /></Layout></RequireAuth>} />
        <Route path="/loja" element={<RequireAuth><Layout><Loja /></Layout></RequireAuth>} />
        <Route path="/config" element={<RequireAuth><Layout><Config /></Layout></RequireAuth>} />

        {/* Admin Route */}
        <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        <Route path="/admin/*" element={<RequireAuth><Admin /></RequireAuth>} />
        {/* Student Dashboard */}
        <Route path="/student/*" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}
