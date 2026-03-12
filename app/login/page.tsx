'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

type View = 'login' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.data()?.role;
      router.push(role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setError('E-mailadres of wachtwoord onjuist');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Voer je e-mailadres in');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch {
      setError('Er is iets misgegaan. Controleer je e-mailadres.');
    } finally {
      setLoading(false);
    }
  }

  function switchView(next: View) {
    setView(next);
    setError('');
    setResetSent(false);
    setPassword('');
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
          {view === 'login' ? (
            <>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>Inloggen</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Welkom terug</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>Wachtwoord vergeten</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>We sturen je een herstelmail</p>
            </>
          )}
        </div>

        {view === 'login' && (
          <>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="E-mailadres"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-themed"
              />
              <div>
                <input
                  type="password"
                  placeholder="Wachtwoord"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="input-themed"
                />
                <div className="text-right mt-1.5">
                  <button
                    onClick={() => switchView('forgot')}
                    className="text-xs hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    Wachtwoord vergeten?
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm mt-3 px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-accent w-full mt-6 text-center"
              style={{ padding: '0.75rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Bezig...' : 'Inloggen'}
            </button>

            <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
              Nog geen account?{' '}
              <a href="/register" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
                Registreren
              </a>
            </p>
          </>
        )}

        {view === 'forgot' && (
          <>
            {resetSent ? (
              <div className="text-center space-y-4">
                <div
                  className="mx-auto w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ background: '#d1fae5' }}
                >
                  ✓
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>Mail verstuurd!</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Check je inbox op <strong>{email}</strong> voor de herstellink.
                  </p>
                </div>
                <button
                  onClick={() => switchView('login')}
                  className="btn-accent w-full text-center"
                  style={{ padding: '0.75rem' }}
                >
                  Terug naar inloggen
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Voer je e-mailadres in en we sturen je een link om je wachtwoord te herstellen.
                  </p>
                  <input
                    type="email"
                    placeholder="E-mailadres"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                    className="input-themed"
                  />
                </div>

                {error && (
                  <p className="text-sm mt-3 px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="btn-accent w-full mt-6 text-center"
                  style={{ padding: '0.75rem', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Versturen...' : 'Herstelmail sturen'}
                </button>

                <button
                  onClick={() => switchView('login')}
                  className="w-full mt-3 text-sm text-center hover:underline"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ← Terug naar inloggen
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}