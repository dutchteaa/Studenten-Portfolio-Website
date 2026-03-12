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
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.data()?.role;
      router.push(role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setError('E-mailadres of wachtwoord onjuist');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-dots" style={{ background: 'var(--bg)' }}>
      <div className="animate-scale-in w-full max-w-sm">
        <div className="card p-7" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="text-center mb-7">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent)' }}>
              <span className="text-white text-sm font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>SP</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Welkom terug</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Log in op je account</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>E-mailadres</label>
              <input type="email" placeholder="naam@novacollege.nl" value={email} onChange={e => setEmail(e.target.value)}
                className="input-themed" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Wachtwoord</label>
              <input type="password" placeholder="Wachtwoord" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="input-themed" />
            </div>
          </div>

          {error && (
            <div className="mt-3 px-3 py-2 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full mt-5 py-2.5">
            {loading ? 'Bezig...' : 'Inloggen'}
          </button>

          <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Nog geen account?{' '}
            <a href="/register" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              Registreren
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
