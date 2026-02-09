import React, { useEffect, useState } from 'react';
import {
  LayoutGrid, BookOpen, Users, Award, ShoppingBag, Target,
  Search, Bell, LogOut, Settings, BarChart3,
  TrendingUp, FileText, ChevronRight, Trophy
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { AdminDb } from '../../services/adminDb';

import AdminTrilhas from './AdminTrilhas';
import AdminUsers from './AdminUsers';
import AdminRelatorios from './AdminRelatorios';
import AdminConfig from './AdminConfig';
import AdminRanking from './AdminRanking';
import AdminLoja from './AdminLoja';
import AdminMissoes from './AdminMissoes';

function DashboardHome() {
  const [overview, setOverview] = useState(null);
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [dashData, trailsData] = await Promise.all([
          AdminDb.reports.getAdminDashboard().catch(() => null),
          AdminDb.trails.list().catch(() => [])
        ]);
        if (!alive) return;
        setOverview(dashData);
        setTrails(trailsData.slice(0, 5));
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const kpis = overview?.success ? {
    totalUsers: overview.total_users || 0,
    totalXp: overview.total_xp || 0,
    lessonsCompleted: overview.total_lessons_completed || 0,
    newUsers: overview.new_users_30d || 0,
    totalPurchases: overview.total_purchases || 0,
    coinsSpent: overview.total_coins_spent || 0,
    activeUsers: overview.active_users || 0,
  } : { totalUsers: 0, totalXp: 0, lessonsCompleted: 0, newUsers: 0, totalPurchases: 0, coinsSpent: 0, activeUsers: 0 };

  const monthlyData = overview?.monthly_completions || [];
  const chartData = monthlyData.map(d => ({ name: d.month, completions: d.completions }));

  const COLORS = ['#0047AB', '#E5E7EB'];

  const pieData = [
    { name: 'Ativos', value: kpis.activeUsers },
    { name: 'Inativos', value: Math.max(0, kpis.totalUsers - kpis.activeUsers) },
  ];

  const activePercent = kpis.totalUsers > 0 ? Math.round((kpis.activeUsers / kpis.totalUsers) * 100) : 0;

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#6B7280' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        Carregando dados do dashboard...
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 4, letterSpacing: '-0.02em' }}>Visao Geral</h1>
        <p style={{ color: '#6B7280', fontSize: 14 }}>Dados em tempo real do Pet Class</p>
      </div>

      {/* KPIs com gradiente */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ background: 'linear-gradient(135deg, #0047AB, #1C74D9)', borderRadius: 16, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.15, fontSize: 80 }}>👥</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Users size={20} />
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>Total de Usuarios</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{kpis.totalUsers.toLocaleString()}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>{kpis.activeUsers} ativos ({activePercent}%)</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', borderRadius: 16, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.15, fontSize: 80 }}>⭐</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Award size={20} />
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>XP Total Gerado</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{kpis.totalXp.toLocaleString()}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>todos os usuarios</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #059669, #10B981)', borderRadius: 16, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.15, fontSize: 80 }}>📚</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <BookOpen size={20} />
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>Aulas Concluidas</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{kpis.lessonsCompleted.toLocaleString()}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>total geral</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', borderRadius: 16, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.15, fontSize: 80 }}>🚀</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <TrendingUp size={20} />
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>Novos (30 dias)</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{kpis.newUsers.toLocaleString()}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>{kpis.totalPurchases} compras na loja</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#111827' }}>Conclusoes Mensais de Aulas</h3>
          <div style={{ height: 280 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0047AB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0047AB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 13 }} />
                  <Area type="monotone" dataKey="completions" stroke="#0047AB" strokeWidth={2.5} fill="url(#colorCompletions)" name="Conclusoes" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#9CA3AF' }}>
                <div>
                  <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>📊</div>
                  Sem dados de conclusoes ainda
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#111827' }}>Usuarios Ativos</h3>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: '#0047AB' }}>{activePercent}%</span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" startAngle={90} endAngle={-270}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0047AB' }} />
              <span style={{ color: '#6B7280' }}>Ativos ({kpis.activeUsers})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5E7EB' }} />
              <span style={{ color: '#6B7280' }}>Inativos ({Math.max(0, kpis.totalUsers - kpis.activeUsers)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Economia e Trilhas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#111827' }}>Economia da Loja</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{kpis.totalPurchases}</div>
              <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginTop: 4 }}>Compras Realizadas</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius: 14, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#D97706' }}>{kpis.coinsSpent.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginTop: 4 }}>Moedas Gastas</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#111827' }}>Trilhas Ativas</h3>
          {trails.length > 0 ? trails.map((trail, i) => (
            <div key={trail.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < trails.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${trail.color || '#0047AB'}15`, display: 'grid', placeItems: 'center', fontSize: 18 }}>
                {trail.icon || '📚'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{trail.title}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{trail.total_lessons || 0} aulas</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: trail.is_active ? '#D1FAE5' : '#FEE2E2', color: trail.is_active ? '#059669' : '#DC2626' }}>
                {trail.is_active ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          )) : (
            <div style={{ color: '#9CA3AF', textAlign: 'center', padding: 20, fontSize: 14 }}>Nenhuma trilha cadastrada</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const session = await AdminDb.auth.getSession();
        if (!session) {
          localStorage.removeItem('pa_user');
          navigate('/login');
          return;
        }
        await AdminDb.auth.ensureUserRow();
        const p = await AdminDb.auth.getMyProfile();
        if (!alive) return;
        if (p && !['admin', 'gerente'].includes(p.role)) {
          navigate('/login');
          return;
        }
        setProfile(p);
      } catch (e) {
        console.error('Erro no AdminDashboard check:', e);
      } finally {
        if (alive) setProfileLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, [navigate]);

  const roleLabel = (role) => {
    const r = String(role || '').toLowerCase();
    if (r === 'admin') return 'Admin';
    if (r === 'gerente') return 'Gerente';
    if (r === 'caixa') return 'Caixa';
    if (r === 'franqueado') return 'Franqueado';
    return 'Funcionario';
  };

  const handleLogout = async () => {
    try {
      await AdminDb.auth.signOut();
    } finally {
      localStorage.removeItem('pa_user');
      navigate('/login');
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'trilhas': return <AdminTrilhas />;
      case 'users': return <AdminUsers />;
      case 'ranking': return <AdminRanking />;
      case 'loja': return <AdminLoja />;
      case 'missoes': return <AdminMissoes />;
      case 'reports': return <AdminRelatorios />;
      case 'settings': return <AdminConfig />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#F3F4F6' }}>

      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 10
      }}>
        <div className="brand" style={{
          height: 70,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid #f3f4f6',
          gap: 12
        }}>
          <div style={{ width: 32, height: 32, background: 'var(--brand)', borderRadius: 8, display: 'grid', placeItems: 'center', color: '#fff' }}>
            <Award size={20} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--brand-dark)' }}>PET CLASS</span>
        </div>

        <nav style={{ padding: 20, flex: 1 }}>
          <MenuItem icon={<LayoutGrid size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <MenuItem icon={<BookOpen size={20}/>} label="Trilhas & Aulas" active={activeTab === 'trilhas'} onClick={() => setActiveTab('trilhas')} />
          <MenuItem icon={<Users size={20}/>} label="Usuarios" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <MenuItem icon={<Trophy size={20}/>} label="Ranking" active={activeTab === 'ranking'} onClick={() => setActiveTab('ranking')} />
          <MenuItem icon={<ShoppingBag size={20}/>} label="Loja & Premios" active={activeTab === 'loja'} onClick={() => setActiveTab('loja')} />
          <MenuItem icon={<Target size={20}/>} label="Missoes Diarias" active={activeTab === 'missoes'} onClick={() => setActiveTab('missoes')} />
          <MenuItem icon={<FileText size={20}/>} label="Relatorios" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <div style={{ margin: '20px 0', borderTop: '1px solid #f3f4f6' }} />
          <MenuItem icon={<Settings size={20}/>} label="Configuracoes" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div style={{ padding: 20 }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))',
            borderRadius: 16,
            padding: 20,
            color: '#fff',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Pet Class Pro</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Painel Administrativo</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 260 }}>

        {/* Header */}
        <header style={{
          height: 70,
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 9
        }}>
          <div style={{ fontSize: 14, color: '#6B7280' }}>
            Painel Administrativo
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
                  {profileLoading ? 'Carregando...' : (profile?.name || 'Admin')}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {profileLoading ? '' : roleLabel(profile?.role)}
                </div>
              </div>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Admin')}&background=0047AB&color=fff`}
                alt="Admin"
                style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
              />
              <button onClick={handleLogout} style={{ background: '#FEF2F2', border: 'none', padding: 8, borderRadius: 8, cursor: 'pointer', marginLeft: 8 }}>
                <LogOut size={18} color="#EF4444" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        {renderContent()}

      </main>
    </div>
  );
}

function MenuItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '12px 16px',
        border: 'none',
        background: active ? '#EFF6FF' : 'transparent',
        color: active ? '#0047AB' : '#6B7280',
        borderRadius: 12,
        cursor: 'pointer',
        marginBottom: 4,
        fontWeight: active ? 600 : 400,
        transition: 'all 0.2s ease'
      }}
    >
      {icon}
      <span style={{ fontSize: 14 }}>{label}</span>
      {active && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
    </button>
  );
}

function KPICard({ title, value, icon, subtitle }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F9FAFB', display: 'grid', placeItems: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{value}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#6B7280' }}>{subtitle}</div>}
      </div>
    </div>
  );
}
