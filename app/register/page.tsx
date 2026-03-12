'use client';

import { useState } from 'react';
import { register } from '@/lib/auth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    setError('');
    if (!name.trim()) {
      setError('Vul je volledige naam in.');
      return;
    }
    if (!email.toLowerCase().endsWith('@novacollege.nl')) {
      setError('Alleen @novacollege.nl e-mailadressen zijn toegestaan.');
      return;
    }
    try {
      await register(email, password, name);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Er ging iets mis bij het registreren.');
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-grid" style={{ background: 'var(--bg)' }}>
        <div
          className="animate-scale-in w-full max-w-md rounded-2xl p-8 shadow-lg text-center"
          style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl"
            style={{ background: 'var(--accent-glow)' }}>
            ✉️
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>Verifieer je e-mail</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            We hebben een verificatie-e-mail gestuurd naar <strong>{email}</strong>.
            Klik op de link in de e-mail om je account te activeren, en log daarna in.
          </p>
          
            href="/login"
            className="btn-accent block w-full mt-6 text-center"
            style={{ padding: '0.75rem' }}
          >
            Naar inloggen
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-grid" style={{ background: 'var(--bg)' }}>
      <div
        className="animate-scale-in w-full max-w-md rounded-2xl p-8 shadow-lg"
        style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
      >
        <div className="text-center mb-8">
          <div className="badge-accent justify-center mb-4">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>SP.dev</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>Account aanmaken</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Registreer als student om projecten toe te voegen
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Volledige naam"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-themed"
            />
            <p className="text-xs mt-1 px-1" style={{ color: 'var(--text-muted)' }}>
              Vul je voor- en achternaam in zoals op je schoolpas.
            </p>
          </div>
          <div>
            <input
              type="email"
              placeholder="naam@novacollege.nl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-themed"
            />
            <p className="text-xs mt-1 px-1" style={{ color: 'var(--text-muted)' }}>
              ⚠️ Alleen <strong>@novacollege.nl</strong> e-mailadressen zijn toegestaan.
            </p>
          </div>
          <input
            type="password"
            placeholder="Wachtwoord (min. 6 tekens)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            className="input-themed"
          />
        </div>

        {error && (
          <p className="text-sm mt-3 px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
            {error}
          </p>
        )}

        <button onClick={handleRegister} className="btn-accent w-full mt-6 text-center" style={{ padding: '0.75rem' }}>
          Registreren
        </button>

        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Al een account?{' '}
          <a href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
            Inloggen
          </a>
        </p>
      </div>
    </div>
  );
}