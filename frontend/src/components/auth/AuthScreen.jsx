import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

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
    setLoading(true); setError('');
    try { await authenticate(mode, { name, email, password }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return <main className="app-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
    <form onSubmit={submit} className="glass-panel" style={{ width: '100%', maxWidth: 420, padding: 32, display: 'grid', gap: 16 }}>
      <div><h1>NutriVision</h1><p>{mode === 'login' ? 'Sign in to continue your health log.' : 'Create your NutriVision account.'}</p></div>
      {mode === 'signup' && <label className="input-group">Name<input className="text-input" value={name} onChange={e => setName(e.target.value)} required /></label>}
      <label className="input-group">Email<input className="text-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label className="input-group">Password<input className="text-input" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength="8" required /></label>
      {error && <p role="alert" style={{ color: 'var(--rose-400)' }}>{error}</p>}
      <button className="btn btn-primary" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      <button type="button" className="btn btn-secondary" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}</button>
    </form>
  </main>;
};
