import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, ShieldCheck, PawPrint, GraduationCap, BookOpen, Trophy, Sparkles } from 'lucide-react';
import { AdminDb } from '../services/adminDb';
import { isSupabaseConfigured } from '../services/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado. Configure a conexão para entrar.')
      }

      await AdminDb.auth.signInWithPassword({ email, password });
      await AdminDb.auth.ensureUserRow();
      const profile = await AdminDb.auth.getMyProfile();

      const name = profile?.name || (email?.split('@')[0] || 'Usuário');
      const role = profile?.role || 'gerente';

      const current = JSON.parse(localStorage.getItem('pa_user') || '{}');
      localStorage.setItem('pa_user', JSON.stringify({ ...current, email, name, role: 'gerente', logged: true }));

      navigate('/admin');
    } catch (e) {
      console.error(e);
      const msg = e?.message || 'Falha no login. Verifique suas credenciais.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ───── Left Panel — Brand / Mascot ───── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden"
        style={{ background: 'linear-gradient(165deg, #064E29 0%, #0B6E3D 35%, #129151 65%, #34D399 100%)' }}>

        {/* Decorative blurs */}
        <div className="absolute top-[-80px] left-[-60px] w-[320px] h-[320px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,.6) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,.4) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[10%] w-[200px] h-[200px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,.5) 0%, transparent 70%)' }} />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { top: '12%', left: '15%', size: 6, delay: '0s', dur: '6s' },
            { top: '25%', left: '75%', size: 4, delay: '1s', dur: '8s' },
            { top: '55%', left: '20%', size: 5, delay: '2s', dur: '7s' },
            { top: '70%', left: '65%', size: 3, delay: '0.5s', dur: '5s' },
            { top: '85%', left: '40%', size: 4, delay: '3s', dur: '9s' },
            { top: '35%', left: '85%', size: 5, delay: '1.5s', dur: '6s' },
          ].map((p, i) => (
            <div key={i}
              className="absolute bg-white/20 rounded-full"
              style={{
                top: p.top, left: p.left,
                width: p.size, height: p.size,
                animation: `float ${p.dur} ease-in-out ${p.delay} infinite alternate`
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
              <PawPrint size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight leading-none">PET</h2>
              <h2 className="text-3xl font-black tracking-tight leading-none"
                style={{ color: '#6EE7B7' }}>CLASS</h2>
            </div>
          </div>

          {/* Mascot Image */}
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full opacity-30 blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(52,211,153,.6), transparent)' }} />
            <img
              src="/mascot-login.png"
              alt="Pet Class Mascot"
              className="relative z-10 w-64 h-64 object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
            />
          </div>

          {/* Tagline */}
          <h3 className="text-xl font-bold text-white text-center mb-3 max-w-xs">
            Plataforma de aprendizado para o seu time
          </h3>
          <p className="text-sm text-green-200/80 text-center max-w-sm leading-relaxed">
            Capacite seus colaboradores com trilhas gamificadas, ranking inteligente e recompensas.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { icon: <GraduationCap size={14} />, label: 'Trilhas' },
              { icon: <Trophy size={14} />, label: 'Ranking' },
              { icon: <BookOpen size={14} />, label: 'Quizzes' },
              { icon: <Sparkles size={14} />, label: 'Gamificação' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 text-xs font-medium">
                {f.icon}
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" style={{ height: 80 }}>
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,75 1440,60 L1440,120 L0,120 Z" fill="rgba(255,255,255,0.06)" />
        </svg>
      </div>

      {/* ───── Right Panel — Login Form ───── */}
      <div className="flex-1 flex items-center justify-center relative"
        style={{ background: 'linear-gradient(180deg, #f0fff6 0%, #ffffff 40%, #ffffff 100%)' }}>

        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#129151 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Mobile logo (visible on small screens) */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #0B6E3D, #129151)' }}>
            <PawPrint size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800">Pet Class</span>
        </div>

        <div className="relative z-10 w-full max-w-[420px] px-6 sm:px-8">

          {/* Welcome Header */}
          <div className="mb-8">
            <div className="lg:hidden flex justify-center mb-6">
              <img src="/mascot-login.png" alt="PetClass" className="w-24 h-24 object-contain" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bem-vindo de volta!
            </h1>
            <p className="text-slate-500 mt-2">
              Acesse o painel administrativo Pet Class
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-green-900/5 border border-slate-100 p-7 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-shake">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email corporativo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#129151] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#129151]/20 focus:border-[#129151] focus:bg-white text-sm transition-all"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Senha</label>
                  <button
                    type="button"
                    className="text-xs font-medium text-[#129151] hover:text-[#0B6E3D] transition-colors"
                    onClick={() => alert('Entre em contato com o suporte de TI.')}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#129151] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#129151]/20 focus:border-[#129151] focus:bg-white text-sm transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg shadow-green-700/25 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-700/30 active:translate-y-0"
                style={{ background: 'linear-gradient(135deg, #0B6E3D 0%, #129151 100%)' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar no Painel
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {!isSupabaseConfigured() && (
              <div className="mt-5 pt-5 border-t border-slate-100 text-center">
                <button
                  onClick={() => setError('Supabase não configurado. Configure a conexão.')}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1.5 mx-auto transition-colors"
                >
                  <ShieldCheck size={13} /> Configurar Conexão
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            &copy; {new Date().getFullYear()} Pet Class — Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px) scale(1); opacity: 0.3; }
          50%  { opacity: 0.6; }
          100% { transform: translateY(-30px) scale(1.4); opacity: 0.15; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(2px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
