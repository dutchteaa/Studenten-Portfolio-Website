'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  ingediendOp?: string;
}

export default function AanvragenPage() {
  const [aanvragen, setAanvragen] = useState<Aanvraag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function laadAanvragen() {
      const q = query(collection(db, 'aanvragen'), where('status', '==', 'goedgekeurd'));
      const snapshot = await getDocs(q);
      setAanvragen(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Aanvraag)));
      setLoading(false);
    }
    laadAanvragen();
  }, []);

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
            Project aanvragen
          </h1>
          <p className="animate-fade-up animate-fade-up-2 mt-3 text-lg" style={{ color: 'var(--text-muted)' }}>
            Bekijk de goedgekeurde projecten die bedrijven hebben aangevraagd
          </p>
        </div>

        {/* Aanvragen list */}
        {aanvragen.length === 0 ? (
          <div
            className="animate-fade-up text-center py-16 rounded-2xl"
            style={{ background: 'var(--bg-white)', border: '1px dashed var(--border)' }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl"
              style={{ background: 'var(--accent-glow)' }}
            >
              📋
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Er zijn momenteel geen goedgekeurde projectaanvragen.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {aanvragen.map((a, i) => (
              <div
                key={a.id}
                className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card-hover rounded-xl p-6`}
                style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-xl font-bold" style={{ color: 'var(--text-dark)' }}>
                        {a.bedrijfsnaam}
                      </h2>
                      <span
                        className="text-xs px-3 py-1 rounded-full font-semibold"
                        style={{ background: '#dcfce7', color: '#166534' }}
                      >
                        ✓ Goedgekeurd
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-dark)' }}>
                      {a.projectomschrijving}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-4">
                      {a.technologieen && (
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                            Technologieën
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {a.technologieen.split(',').map((t, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 rounded-md font-mono"
                                style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
                              >
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

                  {/* Contact info */}
                  <div
                    className="rounded-xl p-4 shrink-0 min-w-[160px]"
                    style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}
                  >
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                      Contactpersoon
                    </p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{a.contactpersoon}</p>
                    <a
                      href={`mailto:${a.email}`}
                      className="text-xs mt-1 block hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      {a.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          className="mt-12 rounded-2xl p-8 text-center"
          style={{ background: 'var(--surface-dark)', border: '1px solid var(--surface-dark-border)' }}
        >
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-on-dark)' }}>
            Interesse in een opdracht?
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-on-dark-muted)' }}>
            Neem contact op met de contactpersoon van het bedrijf via het e-mailadres.
          </p>
          <a href="/dashboard" className="btn-accent">
            Naar mijn dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
