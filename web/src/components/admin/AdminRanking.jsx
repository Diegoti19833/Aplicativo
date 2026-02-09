import React, { useEffect, useState } from 'react';
import { Trophy, Search, Download, TrendingUp, Flame, BookOpen, Brain } from 'lucide-react';
import { AdminDb } from '../../services/adminDb';

export default function AdminRanking() {
  const [ranking, setRanking] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      setLoading(true);
      const data = await AdminDb.ranking.getFull({ limit: 100 });
      if (data?.success) {
        setRanking(data.ranking || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error('Erro ao carregar ranking:', e);
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = (role) => {
    const r = String(role || '').toLowerCase();
    if (r === 'admin') return 'Admin';
    if (r === 'gerente') return 'Gerente';
    if (r === 'caixa') return 'Caixa';
    if (r === 'franqueado') return 'Franqueado';
    return 'Funcionario';
  };

  const roleBadgeColor = (role) => {
    const r = String(role || '').toLowerCase();
    if (r === 'admin') return { bg: '#FEF3C7', color: '#D97706' };
    if (r === 'gerente') return { bg: '#DBEAFE', color: '#2563EB' };
    if (r === 'caixa') return { bg: '#E0E7FF', color: '#4F46E5' };
    if (r === 'franqueado') return { bg: '#FCE7F3', color: '#DB2777' };
    return { bg: '#D1FAE5', color: '#059669' };
  };

  const positionIcon = (pos) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `${pos}`;
  };

  const filtered = ranking.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const exportCSV = () => {
    const headers = ['Posicao,Nome,Email,Funcao,XP,Nivel,Coins,Streak,Aulas,Quizzes'];
    const rows = filtered.map(u =>
      `${u.position},"${u.name}","${u.email}",${roleLabel(u.role)},${u.total_xp},${u.level},${u.coins},${u.current_streak},${u.lessons_completed},${u.quizzes_completed}`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranking_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#6B7280' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
        Carregando ranking...
      </div>
    );
  }

  const podiumOrder = ranking.length >= 3 ? [ranking[1], ranking[0], ranking[2]] : ranking.slice(0, 3);
  const podiumHeights = [140, 180, 120];
  const podiumColors = [
    { bg: 'linear-gradient(135deg, #94A3B8, #CBD5E1)', border: '#94A3B8', medal: '🥈' },
    { bg: 'linear-gradient(135deg, #F59E0B, #FCD34D)', border: '#F59E0B', medal: '🥇' },
    { bg: 'linear-gradient(135deg, #CD7F32, #DDA15E)', border: '#CD7F32', medal: '🥉' },
  ];

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 4, letterSpacing: '-0.02em' }}>
            Ranking Completo
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14 }}>{total} usuarios participando</p>
        </div>
        <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #059669, #10B981)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 13, boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* Podium */}
      {ranking.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginBottom: 32, padding: '20px 0' }}>
          {podiumOrder.map((u, i) => {
            const pc = podiumColors[i];
            return (
              <div key={u.id} style={{ textAlign: 'center', width: 180 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{pc.medal}</div>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=${pc.border.replace('#','')}&color=fff&size=64&bold=true`} alt="" style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${pc.border}`, marginBottom: 8 }} />
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1F2937', marginBottom: 2 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{u.total_xp?.toLocaleString()} XP</div>
                <div style={{ background: pc.bg, height: podiumHeights[i], borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>Lv.{u.level}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{u.lessons_completed} aulas</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search and stats bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '10px 16px', borderRadius: 12, border: '1px solid #e5e7eb', flex: 1, maxWidth: 400, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <Search size={18} color="#9CA3AF" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            style={{ border: 'none', background: 'transparent', marginLeft: 10, outline: 'none', fontSize: 14, width: '100%', color: '#1F2937' }}
          />
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
          {filtered.length} de {ranking.length} usuarios
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              <th style={{ textAlign: 'center', padding: '14px 12px', fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
              <th style={{ textAlign: 'left', padding: '14px 12px', fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usuario</th>
              <th style={{ textAlign: 'left', padding: '14px 12px', fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Funcao</th>
              <th style={{ textAlign: 'right', padding: '14px 12px', fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>XP</th>
              <th style={{ textAlign: 'right', padding: '14px 12px', fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nivel</th>
              <th style={{ textAlign: 'right', padding: '14px 12px', fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coins</th>
              <th style={{ textAlign: 'right', padding: '14px 12px', fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</th>
              <th style={{ textAlign: 'right', padding: '14px 12px', fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aulas</th>
              <th style={{ textAlign: 'right', padding: '14px 12px', fontSize: 11, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quizzes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, idx) => {
              const badge = roleBadgeColor(u.role);
              const isTop3 = u.position <= 3;
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6', background: isTop3 ? '#FFFBEB' : idx % 2 === 0 ? '#fff' : '#FAFAFA', transition: 'background 0.15s' }}>
                  <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 700, fontSize: isTop3 ? 20 : 14 }}>{positionIcon(u.position)}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=0047AB&color=fff&size=36&bold=true`} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1F2937' }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color, fontWeight: 700 }}>
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 700, color: '#0047AB', fontSize: 14 }}>{u.total_xp?.toLocaleString()}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 600 }}>{u.level}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 600, color: '#D97706' }}>{u.coins?.toLocaleString()}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: u.current_streak > 0 ? '#EF4444' : '#9CA3AF', fontWeight: 600 }}>
                      {u.current_streak > 0 && '🔥'} {u.current_streak}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 500 }}>{u.lessons_completed}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 500 }}>{u.quizzes_completed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            Nenhum usuario encontrado
          </div>
        )}
      </div>
    </div>
  );
}
