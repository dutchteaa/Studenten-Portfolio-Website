'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) router.push('/dashboard');
  }, [user, authLoading, router]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');
    if (!name.trim()) {
      setError('Vul je volledige naam in.');
      return;
    }
setLoading(true);
    try {
      await register(email, password, name);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis bij het registreren.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 relative">
        <div className="hero-glow" style={{ width: '400px', height: '400px', background: 'rgba(34,197,94,0.08)', top: '20%', left: '40%' }} />
        <div className="animate-scale-in w-full max-w-sm relative">
          <div className="card p-7 text-center" style={{ boxShadow: 'var(--glow)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Aanvraag verstuurd</h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Je account is aangemaakt en wacht op goedkeuring van een beheerder. Je ontvangt een melding zodra je account is geactiveerd.</p>
            <a href="/login" className="btn-primary w-full mt-5 py-2.5">Naar inloggen</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 relative">
      <div className="hero-glow" style={{ width: '500px', height: '500px', background: 'rgba(139,92,246,0.08)', top: '10%', right: '20%' }} />
      <div className="animate-scale-in w-full max-w-sm relative">
        <div className="card p-7" style={{ boxShadow: 'var(--glow)' }}>
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient)' }}>
              <span className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-mono)' }}>SP</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Account aanmaken</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Registreer om projecten toe te voegen</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Volledige naam</label>
              <input type="text" placeholder="Jan de Vries" value={name} onChange={e => setName(e.target.value)} className="input-themed" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>E-mailadres</label>
              <input type="email" placeholder="naam@novacollege.nl" value={email} onChange={e => setEmail(e.target.value)} className="input-themed" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Wachtwoord</label>
              <input type="password" placeholder="Min. 6 tekens" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()} className="input-themed" />
            </div>
          </div>

          {error && (
            <div className="badge badge-danger mt-3 w-full justify-center py-2 text-sm">{error}</div>
          )}

          <button onClick={handleRegister} disabled={loading} className="btn-primary w-full mt-5 py-2.5">
            {loading ? 'Bezig...' : 'Registreren'}
          </button>

          <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Al een account?{' '}
            <a href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent-3)' }}>Inloggen</a>
          </p>
        </div>
      </div>
    </div>
  );
}
