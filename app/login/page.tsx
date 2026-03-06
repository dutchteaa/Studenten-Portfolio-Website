'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin() {
    try {
      const user = await login(email, password);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.data()?.role;
      router.push(role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setError('E-mailadres of wachtwoord onjuist');
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>Inloggen</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Welkom terug</p>
        </div>

        <div className="space-y-4">
          <input type="email" placeholder="E-mailadres" value={email} onChange={e => setEmail(e.target.value)}
            className="input-themed" />
          <input type="password" placeholder="Wachtwoord" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="input-themed" />
        </div>

        {error && (
          <p className="text-sm mt-3 px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
            {error}
          </p>
        )}

        <button onClick={handleLogin} className="btn-accent w-full mt-6 text-center" style={{ padding: '0.75rem' }}>
          Inloggen
        </button>

        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Nog geen account?{' '}
          <a href="/register" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
            Registreren
          </a>
        </p>
      </div>
    </div>
  );
}
