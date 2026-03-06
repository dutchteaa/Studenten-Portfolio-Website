'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/lib/auth';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Project {
  id: string;
  titel: string;
  beschrijving: string;
  githubLink: string;
  demoLink: string;
  afbeeldingUrl: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [form, setForm] = useState({ titel: '', beschrijving: '', githubLink: '', demoLink: '', afbeeldingUrl: '' });
  const [toonFormulier, setToonFormulier] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const laadProjecten = useCallback(async () => {
    if (!user) return;
    const q = query(collection(db, 'projecten'), where('studentId', '==', user.uid));
    const snapshot = await getDocs(q);
    setProjecten(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
  }, [user]);

  useEffect(() => {
    if (user) laadProjecten();
  }, [user, laadProjecten]);

  async function projectToevoegen() {
    if (!form.titel || !form.beschrijving || !user) return;
    await addDoc(collection(db, 'projecten'), {
      ...form,
      studentId: user.uid,
      studentNaam: user.displayName ?? user.email,
      gepubliceerdOp: new Date().toISOString(),
    });
    setForm({ titel: '', beschrijving: '', githubLink: '', demoLink: '', afbeeldingUrl: '' });
    setToonFormulier(false);
    laadProjecten();
  }

  async function projectVerwijderen(id: string) {
    await deleteDoc(doc(db, 'projecten', id));
    laadProjecten();
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
    <div className="min-h-screen p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="animate-fade-up flex justify-between items-center mb-8">
          <div>
            <div className="badge-accent mb-3">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
              Student Dashboard
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>Mijn Portfolio</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setToonFormulier(!toonFormulier)}
              className="btn-accent text-sm"
            >
              + Project toevoegen
            </button>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="text-sm px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: 'var(--bg-white)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              Uitloggen
            </button>
          </div>
        </div>

        {/* Add project form */}
        {toonFormulier && (
          <div
            className="animate-fade-up rounded-2xl p-6 mb-8 shadow-sm"
            style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}
            >
              Nieuw project
            </h2>
            <div className="space-y-3">
              <input placeholder="Projecttitel *" value={form.titel} onChange={e => setForm({ ...form, titel: e.target.value })}
                className="input-themed" />
              <textarea placeholder="Beschrijving *" value={form.beschrijving} onChange={e => setForm({ ...form, beschrijving: e.target.value })}
                rows={4} className="input-themed" />
              <input placeholder="GitHub link (optioneel)" value={form.githubLink} onChange={e => setForm({ ...form, githubLink: e.target.value })}
                className="input-themed" />
              <input placeholder="Live demo link (optioneel)" value={form.demoLink} onChange={e => setForm({ ...form, demoLink: e.target.value })}
                className="input-themed" />
              <input placeholder="Afbeelding URL (optioneel)" value={form.afbeeldingUrl} onChange={e => setForm({ ...form, afbeeldingUrl: e.target.value })}
                className="input-themed" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={projectToevoegen} className="btn-accent text-sm">Publiceren</button>
              <button
                onClick={() => setToonFormulier(false)}
                className="text-sm px-5 py-2 rounded-lg font-medium transition-colors"
                style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                Annuleren
              </button>
            </div>
          </div>
        )}

        {/* Project list */}
        {projecten.length === 0 ? (
          <div
            className="animate-fade-up text-center py-16 rounded-2xl"
            style={{ background: 'var(--bg-white)', border: '1px dashed var(--border)' }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl"
              style={{ background: 'var(--accent-glow)' }}
            >
              📁
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Je hebt nog geen projecten. Voeg je eerste project toe!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projecten.map((p, i) => (
              <div
                key={p.id}
                className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card-hover rounded-xl p-6 flex justify-between items-start`}
                style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>{p.titel}</h3>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{p.beschrijving}</p>
                  <div className="flex gap-3 mt-3">
                    {p.githubLink && (
                      <a href={p.githubLink} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                        style={{ background: 'var(--surface-dark)', color: 'var(--text-on-dark)' }}>
                        GitHub
                      </a>
                    )}
                    {p.demoLink && (
                      <a href={p.demoLink} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors hover:opacity-80"
                        style={{ background: 'var(--accent)', color: '#fff' }}>
                        Live demo
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => projectVerwijderen(p.id)}
                  className="ml-4 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: '#991b1b', background: '#fee2e2' }}
                >
                  Verwijderen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
