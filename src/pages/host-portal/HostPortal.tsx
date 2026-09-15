import React, { useState, useEffect } from 'react';
import { HostPortalModal } from '../../components/vip/HostPortalModal';
import { Sparkles, ExternalLink, LayoutDashboard, Smartphone, LogOut, Lock } from 'lucide-react';

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
  const [activeView, setActiveView] = useState<'dashboard' | 'standalone'>('dashboard');

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
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
        <div className="text-center space-y-3">
          <div className="mx-auto w-7 h-7 border-2 border-white/20 border-t-[#ff9f0a] rounded-full animate-spin"></div>
          <p className="text-xs text-[#86868b] font-mono">Caricamento Aurora Host Portal...</p>
        </div>
      </div>
    );
  }

  if (!session?.authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans text-white">
        <div className="max-w-md w-full bg-[#161618] rounded-3xl shadow-2xl border border-white/[0.08] p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ff9f0a] mx-auto shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Aurora Host Portal
            </h2>
            <p className="text-xs text-[#86868b]">
              Accesso riservato all'Host • Apple HIG Dark System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#86868b] mb-1.5">Email Host</label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1c1c1e] border border-white/10 rounded-xl focus:border-[#ff9f0a] focus:ring-1 focus:ring-[#ff9f0a] text-white outline-none transition text-sm font-mono placeholder-[#86868b]"
                placeholder="host@aurora-valtellina.app"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#86868b] mb-1.5">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1c1c1e] border border-white/10 rounded-xl focus:border-[#ff9f0a] focus:ring-1 focus:ring-[#ff9f0a] text-white outline-none transition text-sm font-mono placeholder-[#86868b]"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <div className="text-[#ff453a] text-xs text-center bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-xl p-2.5">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#ff9f0a] hover:bg-[#e08e08] active:scale-[0.98] text-black font-bold py-3 rounded-xl transition disabled:opacity-50 text-sm shadow-md cursor-pointer"
            >
              {submitting ? 'Accesso in corso...' : 'Accedi al Portale Host'}
            </button>
          </form>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#86868b]">
            <a
              href="/host-portal/"
              className="hover:text-white transition flex items-center gap-1"
            >
              <span>Portale Standalone</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/visual-cms"
              className="hover:text-[#ff9f0a] transition flex items-center gap-1"
            >
              <span>Visual CMS</span>
              <Sparkles className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-sans text-white flex flex-col">
      {/* Top Apple HIG Header */}
      <header className="bg-[#121214]/90 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-30 shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ff9f0a] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                  Aurora Host Portal
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-[#ff9f0a]/15 text-[#ff9f0a] border border-[#ff9f0a]/30 px-2 py-0.5 rounded-full font-bold">
                  Dark Mode
                </span>
              </div>
              <p className="text-[11px] text-[#86868b] font-mono hidden sm:block truncate">
                Morbegno • Appartamento Aurora in Valtellina
              </p>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#1c1c1e] p-1 rounded-xl border border-white/[0.08] text-xs font-medium shrink-0">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer text-xs ${
                activeView === 'dashboard'
                  ? 'bg-white/10 text-white font-bold shadow-xs'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dashboard Completa</span>
              <span className="md:hidden">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView('standalone')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer text-xs ${
                activeView === 'standalone'
                  ? 'bg-white/10 text-white font-bold shadow-xs'
                  : 'text-[#86868b] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Simulatore Standalone</span>
              <span className="md:hidden">Standalone</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="/host-portal/"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white border border-white/10 transition"
              title="Apri il portale standalone in una nuova scheda"
            >
              <span>Nuova Scheda</span>
              <ExternalLink className="w-3 h-3 text-[#86868b]" />
            </a>

            <a
              href="/visual-cms"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0071e3]/15 text-[#0071e3] hover:bg-[#0071e3]/25 text-xs font-medium border border-[#0071e3]/30 transition"
            >
              <Sparkles className="w-3 h-3" />
              <span>Visual CMS</span>
            </a>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#86868b] hover:text-[#ff453a] border border-white/10 transition cursor-pointer flex items-center gap-1.5"
              title="Disconnetti"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6 flex flex-col">
        {activeView === 'dashboard' ? (
          <div className="w-full flex-1 flex flex-col">
            <HostPortalModal isOpen={true} onClose={() => {}} inlineMode={true} />
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-2 text-xs text-[#86868b] font-mono">
              <span>Simulatore Standalone • WYSIWYG & Canali</span>
              <a
                href="/host-portal/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition flex items-center gap-1"
              >
                <span>Apri a tutto schermo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex-1 w-full rounded-2xl sm:rounded-3xl border border-white/[0.08] overflow-hidden bg-black shadow-2xl min-h-[82vh]">
              <iframe
                src="/host-portal/index.html"
                title="Aurora Standalone Host Portal"
                className="w-full h-full min-h-[82vh] border-0"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HostPortal;

