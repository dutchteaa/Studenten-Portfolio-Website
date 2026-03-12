'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface Claim { uid: string; naam: string; email: string; claimedAt: string; }
interface Aanvraag {
  id: string; bedrijfsnaam: string; contactpersoon: string; email: string;
  projectomschrijving: string; technologieen?: string; deadline?: string; tijdsduur?: string;
  status: string; claims?: Claim[];
}

export default function OpdrachtenPage() {
  const { user, naam, role } = useAuth();
  const [aanvragen, setAanvragen] = useState<Aanvraag[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [unclaimingId, setUnclaimingId] = useState<string | null>(null);
  const [openClaims, setOpenClaims] = useState<string | null>(null);

  async function laadAanvragen() {
    const q = query(collection(db, 'aanvragen'), where('status', '==', 'goedgekeurd'));
    const snapshot = await getDocs(q);
    setAanvragen(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Aanvraag)));
    setLoading(false);
  }

  useEffect(() => { laadAanvragen(); }, []);

  async function claimOpdracht(id: string) {
    if (!user) return; setClaimingId(id);
    await updateDoc(doc(db, 'aanvragen', id), { claims: arrayUnion({ uid: user.uid, naam: naam ?? user.email ?? '', email: user.email ?? '', claimedAt: new Date().toISOString() }) });
    await laadAanvragen(); setClaimingId(null);
  }

  async function unclaimOpdracht(a: Aanvraag) {
    if (!user) return; setUnclaimingId(a.id);
    await updateDoc(doc(db, 'aanvragen', a.id), { claims: (a.claims ?? []).filter(c => c.uid !== user.uid) });
    await laadAanvragen(); setUnclaimingId(null);
  }

  function heeftGeclaimd(a: Aanvraag) { return (a.claims ?? []).some(c => c.uid === user?.uid); }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="pt-10 pb-8 px-5 relative" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="hero-glow" style={{ width: '400px', height: '400px', background: 'rgba(139,92,246,0.06)', top: '-100px', left: '50%', transform: 'translateX(-50%)' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <span className="badge badge-accent mb-4 inline-flex">Opdrachten</span>
          <h1 className="animate-fade-up text-3xl font-bold tracking-tight">
            Beschikbare <span className="gradient-text">opdrachten</span>
          </h1>
          <p className="animate-fade-up animate-fade-up-2 mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
            Goedgekeurde projecten van bedrijven die je kunt claimen
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">
        {!user && (
          <div className="card mb-6 p-4 flex items-center gap-3" style={{ borderColor: 'rgba(245,158,11,0.25)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <div>
              <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>Log in om opdrachten te claimen</p>
              <a href="/login" className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}>Naar inloggen &rarr;</a>
            </div>
          </div>
        )}

        {aanvragen.length === 0 ? (
          <div className="animate-fade-up card p-14 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--gradient-subtle)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-3)' }}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12h6M12 9v6" /></svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Er zijn momenteel geen goedgekeurde opdrachten.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {aanvragen.map((a, i) => {
              const claims = a.claims ?? [];
              const alGeclaimd = heeftGeclaimd(a);
              const isOpen = openClaims === a.id;
              return (
                <div key={a.id} className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card overflow-hidden`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{a.bedrijfsnaam}</h2>
                          <span className="badge badge-success text-[0.625rem]">Goedgekeurd</span>
                          {claims.length > 0 && <span className="badge badge-accent text-[0.625rem]">{claims.length} student{claims.length !== 1 ? 'en' : ''}</span>}
                        </div>
                        <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>{a.projectomschrijving}</p>
                        <div className="flex flex-wrap gap-4 mt-3">
                          {a.technologieen && (
                            <div>
                              <p className="text-[0.625rem] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Technologieen</p>
                              <div className="flex flex-wrap gap-1">
                                {a.technologieen.split(',').map((t, idx) => <span key={idx} className="badge badge-neutral text-[0.625rem] font-mono">{t.trim()}</span>)}
                              </div>
                            </div>
                          )}
                          {a.deadline && <div><p className="text-[0.625rem] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Deadline</p><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a.deadline}</p></div>}
                          {a.tijdsduur && <div><p className="text-[0.625rem] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Duur</p><p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{a.tijdsduur}</p></div>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2.5 shrink-0 min-w-[160px]">
                        <div className="rounded-xl p-3.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                          <p className="text-[0.625rem] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Contact</p>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.contactpersoon}</p>
                          <a href={`mailto:${a.email}`} className="text-xs block mt-0.5 hover:underline" style={{ color: 'var(--accent-3)' }}>{a.email}</a>
                        </div>
                        {user && (alGeclaimd ? (
                          <div className="space-y-1.5">
                            <div className="badge badge-success w-full justify-center py-2.5 text-xs font-semibold">Geclaimed</div>
                            <button onClick={() => unclaimOpdracht(a)} disabled={unclaimingId === a.id} className="text-xs font-medium w-full py-2.5 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                              {unclaimingId === a.id ? 'Bezig...' : 'Claim intrekken'}
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => claimOpdracht(a.id)} disabled={claimingId === a.id} className="btn-primary w-full text-sm py-2.5">
                            {claimingId === a.id ? 'Bezig...' : 'Claim opdracht'}
                          </button>
                        ))}
                        {(user || role === 'admin') && claims.length > 0 && (
                          <button onClick={() => setOpenClaims(isOpen ? null : a.id)} className="btn-ghost text-xs justify-center">
                            {isOpen ? 'Verberg' : `Bekijk claims (${claims.length})`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {isOpen && claims.length > 0 && (
                    <div className="px-5 pb-5 pt-0" style={{ borderTop: '1px solid var(--border)' }}>
                      <p className="section-label mt-4 mb-2.5">Geclaimd door</p>
                      <div className="flex flex-wrap gap-2">
                        {claims.map((c, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'var(--gradient)' }}>{c.naam.charAt(0).toUpperCase()}</span>
                            <div>
                              <p className="font-medium text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>{c.naam}</p>
                              <p className="text-[0.6875rem]" style={{ color: 'var(--text-muted)' }}>{new Date(c.claimedAt).toLocaleDateString('nl-NL')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2), transparent)' }}>
          <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-secondary)' }}>
            <h2 className="text-lg font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Interesse in een opdracht?</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Claim de opdracht en neem contact op met het bedrijf.</p>
            <a href="/dashboard" className="btn-primary">Naar mijn dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}
