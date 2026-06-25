import React, { useState, useEffect } from 'react';
import { fetchApi } from './api.js';
import Dashboard from './Dashboard.jsx';

// ==========================================
// LOGIN PAGE
// ==========================================
function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await fetchApi('/auth/login', 'POST', {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem('ngo_token', data.token);
        localStorage.setItem('ngo_user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        await fetchApi('/auth/register', 'POST', {
          email: form.email,
          password: form.password,
          full_name: form.full_name,
        });
        setMode('login');
        setError('');
        setForm((f) => ({ ...f, full_name: '', password: '' }));
        alert('Account created! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-4 shadow-lg shadow-brand-500/30">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">NGO Training Platform</h1>
          <p className="text-brand-300 text-sm mt-1">Field Staff Learning Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-slate-100">
            {['login', 'register'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError(''); }}
                className={`flex-1 py-4 text-sm font-semibold uppercase tracking-widest transition-colors ${
                  mode === tab
                    ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={set('full_name')}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="you@organization.org"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={mode === 'register' ? 8 : 1}
                value={form.password}
                onChange={set('password')}
                placeholder={mode === 'register' ? 'Minimum 8 characters' : '••••••••'}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm uppercase tracking-widest shadow-md shadow-brand-600/30 hover:shadow-lg hover:shadow-brand-600/40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Secured with JWT · Data encrypted in transit
        </p>
      </div>
    </div>
  );
}

// ==========================================
// SESSION EXPIRED BANNER
// ==========================================
function SessionExpiredBanner({ onDismiss }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up">
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span className="text-sm font-semibold">Your session expired. Please sign in again.</span>
      <button onClick={onDismiss} className="ml-2 text-white/70 hover:text-white text-lg leading-none">&times;</button>
    </div>
  );
}

// ==========================================
// MAIN APP
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [appLoading, setAppLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('ngo_user');
      const storedToken = localStorage.getItem('ngo_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('ngo_user');
      localStorage.removeItem('ngo_token');
    }
    setAppLoading(false);
  }, []);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      setSessionExpired(true);
    };
    window.addEventListener('ngo:session-expired', handler);
    return () => window.removeEventListener('ngo:session-expired', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ngo_token');
    localStorage.removeItem('ngo_user');
    setUser(null);
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <>
      {sessionExpired && (
        <SessionExpiredBanner onDismiss={() => setSessionExpired(false)} />
      )}
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={(u) => { setUser(u); setSessionExpired(false); }} />
      )}
    </>
  );
}
