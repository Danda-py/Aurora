import React, { useState, useEffect } from 'react';
import { KeyRound, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { HostPortalModal } from '../../components/vip/HostPortalModal';

interface HostSessionInfo {
  authenticated: boolean;
  email: string | null;
}

export const HostPortal: React.FC = () => {
  const [session, setSession] = useState<HostSessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      setSession({ authenticated: Boolean(data.authenticated), email: data.email || null });
    } catch {
      setSession({ authenticated: false, email: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Credenziali non valide.');
      }
      setPassword('');
      await checkSession();
    } catch (error: any) {
      setAuthError(error.message || 'Si è verificato un errore durante l\'accesso.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setSession({ authenticated: false, email: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center font-sans text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-2 border-[#ff9f0a] border-t-transparent"></div>
          <span className="text-xs text-[#86868b] font-mono tracking-wide">Caricamento Portale Host...</span>
        </div>
      </div>
    );
  }

  if (!session?.authenticated) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4 font-sans text-white selection:bg-[#ff9f0a]/30 selection:text-white">
        <div className="max-w-md w-full bg-[#161618] rounded-3xl shadow-2xl border border-white/10 p-7 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto mb-3 text-[#ff9f0a] shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Aurora Valtellina
            </h2>
            <p className="text-xs text-[#86868b] mt-1">
              Portale Host • Accesso Riservato
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1.5">Email Host</label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1c1c1e] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] outline-none transition-all text-sm text-white placeholder-white/20"
                placeholder="es. davide.andaloro.3410@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-1.5">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1c1c1e] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] outline-none transition-all text-sm text-white placeholder-white/20"
                placeholder="••••••••"
              />
            </div>

            {/* Quick-fill helper for Host */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1.5">
              <span className="font-bold text-amber-400 block text-[11px] flex items-center gap-1.5">
                <span>💡</span> Accesso Rapido Host:
              </span>
              <p className="text-[11px] text-amber-200/80">
                Email: <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-amber-300">davide.andaloro.3410@gmail.com</code>
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail('davide.andaloro.3410@gmail.com');
                  setPassword('AuroraMorbegno2025!');
                }}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline mt-1 block cursor-pointer transition"
              >
                👉 Compila credenziali Host in 1 click
              </button>
            </div>

            {authError && (
              <div className="text-[#ff453a] text-xs text-center bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-xl p-2.5">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm shadow-lg shadow-blue-500/20 cursor-pointer active:scale-[0.98]"
            >
              {submitting ? 'Accesso in corso...' : 'Accedi al Portale Host'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Una volta autenticati, mostra la dashboard host
  return (
    <div className="min-h-screen bg-[#000000] font-sans text-white selection:bg-[#ff9f0a]/30 selection:text-white">
      <header className="bg-[#161618]/90 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-[#ff9f0a] shadow-inner">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight">Aurora Valtellina • Portale Host</h1>
              <p className="text-[10px] text-[#86868b]">Control Panel & CMS</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-xs text-[#86868b] font-mono hidden sm:inline-block">{session.email}</span>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-white/80 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 cursor-pointer"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6">
        <div className="bg-[#161618] rounded-2xl sm:rounded-3xl shadow-2xl border border-white/[0.08] overflow-hidden">
          <HostPortalContent />
        </div>
      </main>
    </div>
  );
};

// A helper component to render the portal contents without the modal wrapper
function HostPortalContent() {
  return (
    <div className="p-0">
       <HostPortalModal isOpen={true} onClose={() => {}} inlineMode={true} />
    </div>
  );
}
