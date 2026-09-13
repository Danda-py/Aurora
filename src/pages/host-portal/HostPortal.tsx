import React, { useState, useEffect } from 'react';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session?.authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Accesso Host Portal
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Area riservata: accesso consentito solo all'host con la propria password personale.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all text-sm"
                placeholder="host@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <div className="text-red-500 text-xs text-center bg-red-50 rounded-lg p-2">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm shadow-sm"
            >
              {submitting ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Una volta autenticati, mostra la dashboard host (nessuna registrazione: unico host configurato via env)
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-semibold text-gray-900 tracking-tight">Host Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 hidden sm:inline-block">{session.email}</span>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-gray-600 hover:text-black transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
