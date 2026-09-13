import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { HostPortalModal } from '../../components/vip/HostPortalModal';

export const HostPortal: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setAuthError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setAuthError('');

        try {
      if (isLoginMode) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        const user = data.user;
        const role = user?.user_metadata?.role || '';
        const emailLower = (user?.email || '').toLowerCase();
        
        const isHost = role === 'host' || emailLower.includes('host') || emailLower.includes('nino') || emailLower === 'info@aurora-valtellina.app' || emailLower === 'valtellina.aurora@gmail.com';
        
        if (!isHost) {
          await supabase.auth.signOut();
          throw new Error('Access denied. Only registered hosts can access the Host Portal.');
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/host-portal`,
            data: {
              role: 'host'
            }
          },
        });
        if (error) throw error;
        setAuthError('Registration request received. Check your email for confirmation.');
      }
    } catch (error: any) {
      setAuthError(error.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              {isLoginMode ? 'Sign in to Host Portal' : 'Create an account'}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Manage your properties and guest experiences
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input 
                type="email" 
                required
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
              disabled={loading}
              className="w-full bg-black text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm shadow-sm"
            >
              {loading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Once authenticated, render a simplified host dashboard shell which wraps the existing HostPortalModal content
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-semibold text-gray-900 tracking-tight">Host Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 hidden sm:inline-block">{session.user.email}</span>
            <button 
              onClick={handleLogout}
              className="text-xs font-medium text-gray-600 hover:text-black transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* We reuse the logic/UI of HostPortalModal but render it inline */}
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
