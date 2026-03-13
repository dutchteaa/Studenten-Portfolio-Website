'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

function firebaseErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Er ging iets mis. Probeer het opnieuw.';
  const msg = err.message;
  if (msg === 'ACCOUNT_NOT_APPROVED') return 'Je account is nog niet goedgekeurd door een beheerder.';
  if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found'))
    return 'E-mailadres of wachtwoord onjuist.';
  if (msg.includes('auth/too-many-requests'))
    return 'Te veel pogingen. Probeer het later opnieuw.';
  if (msg.includes('auth/invalid-email'))
    return 'Ongeldig e-mailadres.';
  if (msg.includes('auth/user-disabled'))
    return 'Dit account is uitgeschakeld.';
  if (msg.includes('auth/network-request-failed'))
    return 'Geen internetverbinding. Controleer je netwerk.';
  return 'Er ging iets mis. Probeer het opnieuw.';
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) router.push('/dashboard');
  }, [user, authLoading, router]);

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
    } catch (err) {
      setError(firebaseErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative">
      {/* Background glow */}
      <div className="hero-glow" style={{ width: '500px', height: '500px', background: 'rgba(99,102,241,0.08)', top: '10%', left: '30%' }} />

      <div className="animate-scale-in w-full max-w-sm relative">
        <div className="card p-7" style={{ boxShadow: 'var(--glow)' }}>
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient)' }}>
              <span className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>SP</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Welkom terug</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Log in op je account</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>E-mailadres</label>
              <input type="email" placeholder="naam@email.nl" value={email} onChange={e => setEmail(e.target.value)} className="input-themed" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Wachtwoord</label>
              <input type="password" placeholder="Wachtwoord" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} className="input-themed" />
            </div>
          </div>

          {error && (
            <div className="badge badge-danger mt-3 w-full justify-center py-2 text-sm">{error}</div>
          )}

          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full mt-5 py-2.5">
            {loading ? 'Bezig...' : 'Inloggen'}
          </button>

          <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Nog geen account?{' '}
            <a href="/register" className="font-semibold hover:underline" style={{ color: 'var(--accent-3)' }}>Registreren</a>
          </p>
        </div>
      </div>
    </div>
  );
}
