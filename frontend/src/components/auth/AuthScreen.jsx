import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Salad, LogIn, UserPlus } from 'lucide-react';

export const AuthScreen = () => {
  const { authenticate } = useApp();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authenticate(mode, { name, email, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
      <form onSubmit={submit} className="glass-panel" style={{ width: '100%', maxWidth: 430, padding: '36px 32px', display: 'grid', gap: 18, borderRadius: 20 }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #c47c10 0%, #e8a830 100%)',
            color: '#fff',
            marginBottom: 10,
            boxShadow: '0 4px 12px rgba(196, 124, 16, 0.35)'
          }}>
            <Salad size={26} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>NutriVision</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted, #71717a)', fontSize: '0.92rem' }}>
            {mode === 'login' ? 'Log in to continue your nutrition & fitness journey.' : 'Create an account to start tracking meals.'}
          </p>
        </div>

        {/* Tab switch between Log In and Sign Up */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          background: 'rgba(0, 0, 0, 0.05)',
          padding: 4,
          borderRadius: 12
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '9px 12px',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? '#18181b' : '#71717a',
              boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <LogIn size={15} />
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '9px 12px',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? '#18181b' : '#71717a',
              boxShadow: mode === 'signup' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <UserPlus size={15} />
            <span>Sign Up</span>
          </button>
        </div>

        {mode === 'signup' && (
          <label className="input-group">
            Name
            <input
              className="text-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Yash"
              required
            />
          </label>
        )}

        <label className="input-group">
          Email
          <input
            className="text-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="input-group">
          Password
          <input
            className="text-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength="8"
            required
          />
        </label>

        {error && <p role="alert" style={{ color: 'var(--rose-400)', margin: '2px 0 0', fontSize: '0.88rem' }}>{error}</p>}

        <button className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </form>
    </main>
  );
};

