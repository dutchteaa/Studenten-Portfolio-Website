'use client';

import { useState } from 'react';
import { register } from '@/lib/auth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');
    if (!email.toLowerCase().endsWith('@novacollege.nl')) {
      setError('Alleen @novacollege.nl e-mailadressen zijn toegestaan.');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Er ging iets mis bij het registreren.');
      }
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-dots" style={{ background: 'var(--bg)' }}>
        <div className="animate-scale-in w-full max-w-sm">
          <div className="card p-7 text-center" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Account aangemaakt</h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Je account is aangemaakt. Log in om aan de slag te gaan.
            </p>
            <a href="/login" className="btn-primary w-full mt-5 py-2.5">
              Naar inloggen
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-dots" style={{ background: 'var(--bg)' }}>
      <div className="animate-scale-in w-full max-w-sm">
        <div className="card p-7" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="text-center mb-7">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent)' }}>
              <span className="text-white text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>SP</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Account aanmaken</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Registreer om projecten toe te voegen</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Volledige naam</label>
              <input type="text" placeholder="Jan de Vries" value={name} onChange={e => setName(e.target.value)}
                className="input-themed" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>E-mailadres</label>
              <input type="email" placeholder="naam@novacollege.nl" value={email} onChange={e => setEmail(e.target.value)}
                className="input-themed" />
              <p className="text-[0.6875rem] mt-1" style={{ color: 'var(--text-muted)' }}>
                Alleen @novacollege.nl adressen
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Wachtwoord</label>
              <input type="password" placeholder="Min. 6 tekens" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                className="input-themed" />
            </div>
          </div>

          {error && (
            <div className="mt-3 px-3 py-2 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <button onClick={handleRegister} disabled={loading} className="btn-primary w-full mt-5 py-2.5">
            {loading ? 'Bezig...' : 'Registreren'}
          </button>

          <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Al een account?{' '}
            <a href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              Inloggen
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
