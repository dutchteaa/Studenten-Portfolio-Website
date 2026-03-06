'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleRegister() {
    try {
      await register(email, password, name);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Er ging iets mis bij het registreren.');
      }
    }
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
          <input type="text" placeholder="Volledige naam" value={name} onChange={e => setName(e.target.value)}
            className="input-themed" />
          <input type="email" placeholder="E-mailadres" value={email} onChange={e => setEmail(e.target.value)}
            className="input-themed" />
          <input type="password" placeholder="Wachtwoord (min. 6 tekens)" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            className="input-themed" />
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
