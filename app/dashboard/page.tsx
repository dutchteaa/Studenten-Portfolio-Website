'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  collection, addDoc, getDocs, query, where,
  deleteDoc, doc, updateDoc,
} from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';
import { db } from '@/lib/firebase';

type ProjectType = 'website' | 'game' | 'hardware' | 'overig';

interface Lid {
  uid: string;
  naam: string;
  email: string;
}

interface Project {
  id: string;
  titel: string;
  beschrijving: string;
  githubLink: string;
  demoLink: string;
  afbeeldingUrl: string;
  type: ProjectType;
  leden: Lid[];
  studentId: string;
  studentNaam: string;
}

const leegForm = {
  titel: '', beschrijving: '', githubLink: '', demoLink: '',
  afbeeldingUrl: '', type: 'website' as ProjectType,
};

const typeLabels: Record<ProjectType, string> = {
  website: '🌐 Website',
  game: '🎮 Game',
  hardware: '🔧 Hardware',
  overig: '📦 Overig',
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [projecten, setProjecten] = useState<Project[]>([]);
  const [form, setForm] = useState(leegForm);
  const [toonFormulier, setToonFormulier] = useState(false);
  const [bewerkId, setBewerkId] = useState<string | null>(null);

  // Members state
  const [ledenZoek, setLedenZoek] = useState('');
  const [ledenZoekResultaat, setLedenZoekResultaat] = useState<Lid | null | 'niet-gevonden'>(null);
  const [ledenZoekLoading, setLedenZoekLoading] = useState(false);
  const [formulierLeden, setFormulierLeden] = useState<Lid[]>([]);

  // Verification resend
  const [verificatieSent, setVerificatieSent] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const laadProjecten = useCallback(async () => {
    if (!user) return;
    // Haal projecten op waar user eigenaar is, of lid van is
    const snapshot = await getDocs(collection(db, 'projecten'));
    const alle = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    const mijn = alle.filter(p =>
      p.studentId === user.uid ||
      (p.leden ?? []).some((l: Lid) => l.uid === user.uid)
    );
    setProjecten(mijn);
  }, [user]);

  useEffect(() => {
    if (user) laadProjecten();
  }, [user, laadProjecten]);

  function openNieuwFormulier() {
    setForm(leegForm);
    setFormulierLeden([]);
    setLedenZoek('');
    setLedenZoekResultaat(null);
    setBewerkId(null);
    setToonFormulier(true);
  }

  function openBewerkFormulier(p: Project) {
    setForm({
      titel: p.titel,
      beschrijving: p.beschrijving,
      githubLink: p.githubLink ?? '',
      demoLink: p.demoLink ?? '',
      afbeeldingUrl: p.afbeeldingUrl ?? '',
      type: p.type ?? 'website',
    });
    setFormulierLeden(p.leden ?? []);
    setLedenZoek('');
    setLedenZoekResultaat(null);
    setBewerkId(p.id);
    setToonFormulier(true);
  }

  function sluitFormulier() {
    setToonFormulier(false);
    setBewerkId(null);
    setForm(leegForm);
    setFormulierLeden([]);
    setLedenZoek('');
    setLedenZoekResultaat(null);
  }

  async function zoekStudent() {
    if (!ledenZoek.trim()) return;
    setLedenZoekLoading(true);
    setLedenZoekResultaat(null);
    const q = query(collection(db, 'users'), where('email', '==', ledenZoek.trim().toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) {
      setLedenZoekResultaat('niet-gevonden');
    } else {
      const data = snap.docs[0].data() as { uid: string; name: string; email: string };
      setLedenZoekResultaat({ uid: data.uid, naam: data.name, email: data.email });
    }
    setLedenZoekLoading(false);
  }

  function voegLidToe(lid: Lid) {
    if (!user) return;
    if (lid.uid === user.uid) return; // niet zichzelf toevoegen
    if (formulierLeden.some(l => l.uid === lid.uid)) return; // al lid
    setFormulierLeden(prev => [...prev, lid]);
    setLedenZoek('');
    setLedenZoekResultaat(null);
  }

  function verwijderLid(uid: string) {
    setFormulierLeden(prev => prev.filter(l => l.uid !== uid));
  }

  async function opslaan() {
    if (!form.titel || !form.beschrijving || !user) return;
    const data = {
      ...form,
      leden: formulierLeden,
      studentId: bewerkId
        ? projecten.find(p => p.id === bewerkId)?.studentId ?? user.uid
        : user.uid,
      studentNaam: user.displayName ?? user.email,
    };
    if (bewerkId) {
      await updateDoc(doc(db, 'projecten', bewerkId), data);
    } else {
      await addDoc(collection(db, 'projecten'), {
        ...data,
        gepubliceerdOp: new Date().toISOString(),
      });
    }
    sluitFormulier();
    laadProjecten();
  }

  async function projectVerwijderen(id: string) {
    await deleteDoc(doc(db, 'projecten', id));
    laadProjecten();
  }

  async function stuurVerificatie() {
    if (!user) return;
    await sendEmailVerification(user);
    setVerificatieSent(true);
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

        {/* E-mail verificatie banner */}
        {user && !user.emailVerified && (
          <div
            className="animate-fade-up mb-6 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
            style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
                ⚠️ E-mail niet geverifieerd
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                Verifieer je e-mailadres om volledige toegang te krijgen. Controleer je inbox bij {user.email}.
              </p>
            </div>
            <button
              onClick={stuurVerificatie}
              disabled={verificatieSent}
              className="text-xs font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
              style={{ background: verificatieSent ? '#fcd34d' : '#f59e0b', color: '#fff' }}
            >
              {verificatieSent ? 'Verstuurd ✓' : 'Opnieuw sturen'}
            </button>
          </div>
        )}

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
          {!toonFormulier && (
            <button onClick={openNieuwFormulier} className="btn-accent text-sm">
              + Project toevoegen
            </button>
          )}
        </div>

        {/* Project form */}
        {toonFormulier && (
          <div
            className="animate-fade-up rounded-2xl p-6 mb-8 shadow-sm"
            style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {bewerkId ? 'Project bewerken' : 'Nieuw project'}
            </h2>
            <div className="space-y-3">
              <input placeholder="Projecttitel *" value={form.titel} onChange={e => setForm({ ...form, titel: e.target.value })}
                className="input-themed" />
              <textarea placeholder="Beschrijving *" value={form.beschrijving} onChange={e => setForm({ ...form, beschrijving: e.target.value })}
                rows={4} className="input-themed" />

              {/* Type selectie */}
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Project type *
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(typeLabels) as ProjectType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, type: t })}
                      className="text-sm px-4 py-2 rounded-lg font-medium transition-all"
                      style={
                        form.type === t
                          ? { background: 'var(--accent)', color: '#fff' }
                          : { background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                      }
                    >
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              <input placeholder="GitHub link (optioneel)" value={form.githubLink} onChange={e => setForm({ ...form, githubLink: e.target.value })}
                className="input-themed" />
              <input placeholder="Live demo link (optioneel)" value={form.demoLink} onChange={e => setForm({ ...form, demoLink: e.target.value })}
                className="input-themed" />
              <input placeholder="Afbeelding URL (optioneel)" value={form.afbeeldingUrl} onChange={e => setForm({ ...form, afbeeldingUrl: e.target.value })}
                className="input-themed" />

              {/* Leden toevoegen */}
              <div className="pt-1">
                <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Teamleden toevoegen (optioneel)
                </label>
                <div className="flex gap-2">
                  <input
                    placeholder="E-mailadres student zoeken..."
                    value={ledenZoek}
                    onChange={e => { setLedenZoek(e.target.value); setLedenZoekResultaat(null); }}
                    onKeyDown={e => e.key === 'Enter' && zoekStudent()}
                    className="input-themed flex-1"
                  />
                  <button
                    onClick={zoekStudent}
                    disabled={ledenZoekLoading}
                    className="text-sm px-4 py-2 rounded-lg font-medium"
                    style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
                  >
                    Zoeken
                  </button>
                </div>
                {ledenZoekResultaat === 'niet-gevonden' && (
                  <p className="text-xs mt-2" style={{ color: '#991b1b' }}>Student niet gevonden.</p>
                )}
                {ledenZoekResultaat && ledenZoekResultaat !== 'niet-gevonden' && (
                  <div
                    className="flex items-center justify-between mt-2 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}
                  >
                    <span className="text-sm" style={{ color: 'var(--text-dark)' }}>
                      {ledenZoekResultaat.naam} <span style={{ color: 'var(--text-muted)' }}>({ledenZoekResultaat.email})</span>
                    </span>
                    <button
                      onClick={() => voegLidToe(ledenZoekResultaat as Lid)}
                      className="text-xs font-semibold px-3 py-1 rounded-lg"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      Toevoegen
                    </button>
                  </div>
                )}
                {formulierLeden.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formulierLeden.map(l => (
                      <span
                        key={l.uid}
                        className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
                      >
                        {l.naam}
                        <button onClick={() => verwijderLid(l.uid)} style={{ color: 'var(--accent)', fontWeight: 700 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={opslaan} className="btn-accent text-sm">
                {bewerkId ? 'Opslaan' : 'Publiceren'}
              </button>
              <button
                onClick={sluitFormulier}
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
            {projecten.map((p, i) => {
              const isEigenaar = p.studentId === user?.uid;
              return (
                <div
                  key={p.id}
                  className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card-hover rounded-xl p-6`}
                  style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>{p.titel}</h3>
                        {p.type && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
                          >
                            {typeLabels[p.type] ?? p.type}
                          </span>
                        )}
                        {!isEigenaar && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
                          >
                            Lid
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{p.beschrijving}</p>
                      {(p.leden ?? []).length > 0 && (
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                          Team: {[{ naam: p.studentNaam }, ...(p.leden ?? [])].map(l => l.naam).join(', ')}
                        </p>
                      )}
                      <div className="flex gap-3 mt-3">
                        {p.githubLink && (
                          <a href={p.githubLink} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-semibold px-3 py-1 rounded-lg"
                            style={{ background: 'var(--surface-dark)', color: 'var(--text-on-dark)' }}>
                            GitHub
                          </a>
                        )}
                        {p.demoLink && (
                          <a href={p.demoLink} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-semibold px-3 py-1 rounded-lg hover:opacity-80"
                            style={{ background: 'var(--accent)', color: '#fff' }}>
                            Live demo
                          </a>
                        )}
                      </div>
                    </div>
                    {isEigenaar && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => openBewerkFormulier(p)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ color: '#1e40af', background: '#dbeafe' }}
                        >
                          Bewerken
                        </button>
                        <button
                          onClick={() => projectVerwijderen(p.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ color: '#991b1b', background: '#fee2e2' }}
                        >
                          Verwijderen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
