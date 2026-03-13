'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface Claim {
  uid: string;
  naam: string;
  email: string;
  claimedAt: string;
}

interface Aanvraag {
  id: string;
  bedrijfsnaam: string;
  contactpersoon: string;
  email: string;
  projectomschrijving: string;
  technologieen?: string;
  deadline?: string;
  tijdsduur?: string;
  status: string;
  claims?: Claim[];
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

  useEffect(() => {
    laadAanvragen();
  }, []);

  async function claimOpdracht(id: string) {
    if (!user) return;
    setClaimingId(id);
    const claim: Claim = {
      uid: user.uid,
      naam: naam ?? user.email ?? '',
      email: user.email ?? '',
      claimedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'aanvragen', id), {
      claims: arrayUnion(claim),
    });
    await laadAanvragen();
    setClaimingId(null);
  }

  async function unclaimOpdracht(aanvraag: Aanvraag) {
    if (!user) return;
    setUnclaimingId(aanvraag.id);
    const newClaims = (aanvraag.claims ?? []).filter(c => c.uid !== user.uid);
    await updateDoc(doc(db, 'aanvragen', aanvraag.id), { claims: newClaims });
    await laadAanvragen();
    setUnclaimingId(null);
  }

  function heeftGeclaimd(a: Aanvraag) {
    return (a.claims ?? []).some(c => c.uid === user?.uid);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="badge-accent">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
          Laden...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="badge-accent justify-center mb-5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
            Opdrachten
          </div>
          <h1 className="animate-fade-up text-4xl font-bold" style={{ color: 'var(--text-dark)' }}>
            Beschikbare opdrachten
          </h1>
          <p className="animate-fade-up animate-fade-up-2 mt-3 text-lg" style={{ color: 'var(--text-muted)' }}>
            Bekijk de goedgekeurde projecten die bedrijven hebben aangevraagd en claim ze
          </p>
        </div>

        {/* Not logged in notice */}
        {!user && (
          <div
            className="mb-8 rounded-xl px-5 py-4 text-center"
            style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}
          >
            <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
              Log in om opdrachten te claimen
            </p>
            <a href="/login" className="text-xs mt-1 inline-block hover:underline" style={{ color: '#b45309' }}>
              Naar inloggen →
            </a>
          </div>
        )}

        {/* Aanvragen list */}
        {aanvragen.length === 0 ? (
          <div
            className="animate-fade-up text-center py-16 rounded-2xl"
            style={{ background: 'var(--bg-white)', border: '1px dashed var(--border)' }}
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl"
              style={{ background: 'var(--accent-glow)' }}>
              📋
            </div>
            <p style={{ color: 'var(--text-muted)' }}>Er zijn momenteel geen goedgekeurde opdrachten.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {aanvragen.map((a, i) => {
              const claims = a.claims ?? [];
              const alGeclaimd = heeftGeclaimd(a);
              const isOpen = openClaims === a.id;

              return (
                <div
                  key={a.id}
                  className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} rounded-xl overflow-hidden`}
                  style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h2 className="text-xl font-bold" style={{ color: 'var(--text-dark)' }}>
                            {a.bedrijfsnaam}
                          </h2>
                          <span className="text-xs px-3 py-1 rounded-full font-semibold"
                            style={{ background: '#dcfce7', color: '#166534' }}>
                            ✓ Goedgekeurd
                          </span>
                          {claims.length > 0 && (
                            <span className="text-xs px-3 py-1 rounded-full font-semibold"
                              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                              {claims.length} student{claims.length !== 1 ? 'en' : ''} geclaimd
                            </span>
                          )}
                        </div>
<<<<<<< Updated upstream

                        <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-dark)' }}>
                          {a.projectomschrijving}
                        </p>

                        <div className="flex flex-wrap gap-4 mt-4">
                          {a.technologieen && (
                            <div>
                              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Technologieën</p>
                              <div className="flex flex-wrap gap-1">
                                {a.technologieen.split(',').map((t, idx) => (
                                  <span key={idx} className="text-xs px-2 py-1 rounded-md font-mono"
                                    style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                                    {t.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {a.deadline && (
                            <div>
                              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Deadline</p>
                              <p className="text-sm" style={{ color: 'var(--text-dark)' }}>{a.deadline}</p>
                            </div>
                          )}
                          {a.tijdsduur && (
                            <div>
                              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Duur</p>
                              <p className="text-sm" style={{ color: 'var(--text-dark)' }}>{a.tijdsduur}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact + Claim */}
                      <div className="flex flex-col gap-3 shrink-0">
                        <div className="rounded-xl p-4 min-w-[160px]"
                          style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>Contactpersoon</p>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{a.contactpersoon}</p>
                          <a href={`mailto:${a.email}`} className="text-xs mt-1 block hover:underline"
                            style={{ color: 'var(--accent)' }}>
                            {a.email}
                          </a>
                        </div>

                        {/* Claim / Unclaim — only for logged-in users */}
                        {user && (
                          alGeclaimd ? (
                            <div className="flex flex-col gap-2">
                              <span className="text-sm font-semibold px-4 py-2.5 rounded-xl text-center"
                                style={{ background: '#dcfce7', color: '#166534' }}>
                                ✓ Geclaimed
                              </span>
                              <button
                                onClick={() => unclaimOpdracht(a)}
                                disabled={unclaimingId === a.id}
                                className="text-xs font-medium px-4 py-2 rounded-xl transition-all"
                                style={{ background: '#fee2e2', color: '#991b1b' }}
                              >
                                {unclaimingId === a.id ? 'Bezig...' : 'Claim intrekken'}
                              </button>
                            </div>
=======
                        <div className="flex flex-col gap-2.5 shrink-0 min-w-[160px]">
                          <div className="rounded-xl p-3.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <p className="text-[0.625rem] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Contact</p>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.contactpersoon}</p>
                            <a href={`mailto:${a.email}`} className="text-xs block mt-0.5 hover:underline" style={{ color: 'var(--accent-3)' }}>{a.email}</a>
                          </div>
                          {alGeclaimd ? (
                            <button onClick={() => unclaimOpdracht(a)} disabled={unclaimingId === a.id} className="text-xs font-medium w-full py-2.5 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                              {unclaimingId === a.id ? 'Bezig...' : 'Claim intrekken'}
                            </button>
>>>>>>> Stashed changes
                          ) : (
                            <button
                              onClick={() => claimOpdracht(a.id)}
                              disabled={claimingId === a.id}
                              className="text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                              style={{ background: 'var(--accent)', color: '#fff' }}
                            >
                              {claimingId === a.id ? 'Bezig...' : 'Claim opdracht'}
                            </button>
                          )
                        )}

                        {/* View claims */}
                        {(user || role === 'admin') && claims.length > 0 && (
                          <button
                            onClick={() => setOpenClaims(isOpen ? null : a.id)}
                            className="text-xs font-medium px-4 py-2 rounded-lg"
                            style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                          >
                            {isOpen ? 'Verberg' : `Bekijk claims (${claims.length})`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Claims list */}
                  {isOpen && claims.length > 0 && (
                    <div
                      className="px-6 pb-5 pt-0 border-t"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest mt-4 mb-3"
                        style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
                        Geclaimd door
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {claims.map((c, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                          >
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: 'var(--accent)' }}
                            >
                              {c.naam.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-medium leading-tight" style={{ color: 'var(--text-dark)' }}>{c.naam}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {new Date(c.claimedAt).toLocaleDateString('nl-NL')}
                              </p>
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

        {/* CTA */}
        <div className="mt-12 rounded-2xl p-8 text-center"
          style={{ background: 'var(--surface-dark)', border: '1px solid var(--surface-dark-border)' }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-on-dark)' }}>
            Interesse in een opdracht?
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-on-dark-muted)' }}>
            Claim de opdracht en neem contact op met het bedrijf.
          </p>
          <a href="/dashboard" className="btn-accent">Naar mijn dashboard</a>
        </div>
      </div>
    </div>
  );
}
