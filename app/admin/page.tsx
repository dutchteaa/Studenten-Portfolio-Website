'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ProjectType = 'website' | 'game' | 'hardware' | 'overig';

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

interface Project {
  id: string;
  titel: string;
  beschrijving: string;
  studentNaam: string;
  githubLink?: string;
  demoLink?: string;
  type?: ProjectType;
}

const typeLabels: Record<string, string> = {
  website: '🌐 Website',
  game: '🎮 Game',
  hardware: '🔧 Hardware',
  overig: '📦 Overig',
};

export default function AdminPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  const [aanvragen, setAanvragen] = useState<Aanvraag[]>([]);
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [actieveTab, setActieveTab] = useState<'aanvragen' | 'projecten'>('aanvragen');
  const [openClaims, setOpenClaims] = useState<string | null>(null);

  // Project bewerken
  const [bewerkProject, setBewerkProject] = useState<Project | null>(null);
  const [bewerkForm, setBewerkForm] = useState({ titel: '', beschrijving: '', githubLink: '', demoLink: '', type: 'website' as ProjectType });
  const [opslaanFout, setOpslaanFout] = useState('');

  useEffect(() => {
    if (!loading && role !== 'admin') router.push('/login');
  }, [role, loading, router]);

  useEffect(() => {
    if (role === 'admin') {
      laadAanvragen();
      laadProjecten();
    }
  }, [role]);

  async function laadAanvragen() {
    const snapshot = await getDocs(collection(db, 'aanvragen'));
    setAanvragen(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Aanvraag)));
  }

  async function laadProjecten() {
    const snapshot = await getDocs(collection(db, 'projecten'));
    setProjecten(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
  }

  async function statusWijzigen(id: string, nieuweStatus: string) {
    await updateDoc(doc(db, 'aanvragen', id), { status: nieuweStatus });
    laadAanvragen();
  }

  async function verwijderClaim(aanvraag: Aanvraag, uid: string) {
    const newClaims = (aanvraag.claims ?? []).filter(c => c.uid !== uid);
    await updateDoc(doc(db, 'aanvragen', aanvraag.id), { claims: newClaims });
    laadAanvragen();
  }

  async function projectVerwijderen(id: string) {
    await deleteDoc(doc(db, 'projecten', id));
    laadProjecten();
  }

  function openBewerkProject(p: Project) {
    setBewerkProject(p);
    setBewerkForm({
      titel: p.titel,
      beschrijving: p.beschrijving,
      githubLink: p.githubLink ?? '',
      demoLink: p.demoLink ?? '',
      type: p.type ?? 'website',
    });
  }

  async function slaProjectOp() {
    if (!bewerkProject) return;
    setOpslaanFout('');
    try {
      await updateDoc(doc(db, 'projecten', bewerkProject.id), bewerkForm);
      setBewerkProject(null);
      laadProjecten();
    } catch (err: unknown) {
      setOpslaanFout(err instanceof Error ? err.message : 'Opslaan mislukt. Controleer je Firestore-regels.');
    }
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
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="animate-fade-up mb-8">
          <div className="badge-accent mb-3">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
            Admin
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="animate-fade-up animate-fade-up-2 grid grid-cols-2 gap-4 mb-8">
          <div
            className="card-hover rounded-xl p-6 text-center"
            style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
          >
            <p className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>{aanvragen.length}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Aanvragen van bedrijven</p>
          </div>
          <div
            className="card-hover rounded-xl p-6 text-center"
            style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
          >
            <p className="text-4xl font-bold" style={{ color: 'var(--accent)' }}>{projecten.length}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Gepubliceerde projecten</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="animate-fade-up animate-fade-up-3 flex gap-2 mb-6">
          {(['aanvragen', 'projecten'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActieveTab(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                actieveTab === tab
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--bg-white)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {tab === 'aanvragen'
                ? `Bedrijfsaanvragen (${aanvragen.length})`
                : `Studentprojecten (${projecten.length})`}
            </button>
          ))}
        </div>

        {/* Aanvragen */}
        {actieveTab === 'aanvragen' && (
          <div className="space-y-4">
            {aanvragen.map((a, i) => (
              <div
                key={a.id}
                className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} rounded-xl p-6`}
                style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>{a.bedrijfsnaam}</h3>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {a.contactpersoon} · {a.email}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-dark)' }}>
                      {a.projectomschrijving}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {a.technologieen && (
                        <span className="text-xs px-2 py-1 rounded-md font-mono"
                          style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                          {a.technologieen}
                        </span>
                      )}
                      {a.deadline && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Deadline: {a.deadline}</span>
                      )}
                      {a.tijdsduur && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Duur: {a.tijdsduur}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold status-${a.status}`}>
                      {a.status}
                    </span>
                    {(a.claims ?? []).length > 0 && (
                      <button
                        onClick={() => setOpenClaims(openClaims === a.id ? null : a.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg"
                        style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
                      >
                        {openClaims === a.id ? 'Verberg' : `Claims (${(a.claims ?? []).length})`}
                      </button>
                    )}
                    {a.status === 'nieuw' && (
                      <div className="flex gap-2">
                        <button onClick={() => statusWijzigen(a.id, 'goedgekeurd')}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ background: '#dcfce7', color: '#166534' }}>
                          Goedkeuren
                        </button>
                        <button onClick={() => statusWijzigen(a.id, 'afgewezen')}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium"
                          style={{ background: '#fee2e2', color: '#991b1b' }}>
                          Afwijzen
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Claims list for admin */}
                {openClaims === a.id && (a.claims ?? []).length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                      style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
                      Geclaimd door
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(a.claims ?? []).map((c, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: 'var(--accent)' }}>
                            {c.naam.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-medium leading-tight" style={{ color: 'var(--text-dark)' }}>{c.naam}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.email}</p>
                          </div>
                          <button
                            onClick={() => verwijderClaim(a, c.uid)}
                            className="ml-2 text-xs font-medium px-2 py-1 rounded-lg"
                            style={{ background: '#fee2e2', color: '#991b1b' }}
                          >
                            Verwijder
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projecten */}
        {actieveTab === 'projecten' && (
          <div className="space-y-4">
            {projecten.map((p, i) => (
              <div key={p.id}>
                {/* Bewerk modal inline */}
                {bewerkProject?.id === p.id ? (
                  <div
                    className="animate-fade-up rounded-xl p-6"
                    style={{ background: 'var(--bg-white)', border: '2px solid var(--accent)' }}
                  >
                    <h3
                      className="text-xs font-semibold uppercase tracking-widest mb-4"
                      style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      Project bewerken
                    </h3>
                    <div className="space-y-3">
                      <input
                        placeholder="Titel"
                        value={bewerkForm.titel}
                        onChange={e => setBewerkForm({ ...bewerkForm, titel: e.target.value })}
                        className="input-themed"
                      />
                      <textarea
                        placeholder="Beschrijving"
                        value={bewerkForm.beschrijving}
                        onChange={e => setBewerkForm({ ...bewerkForm, beschrijving: e.target.value })}
                        rows={3}
                        className="input-themed"
                      />
                      <div className="flex gap-2 flex-wrap">
                        {(['website', 'game', 'hardware', 'overig'] as ProjectType[]).map(t => (
                          <button
                            key={t}
                            onClick={() => setBewerkForm({ ...bewerkForm, type: t })}
                            className="text-sm px-3 py-1.5 rounded-lg font-medium"
                            style={
                              bewerkForm.type === t
                                ? { background: 'var(--accent)', color: '#fff' }
                                : { background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                            }
                          >
                            {typeLabels[t]}
                          </button>
                        ))}
                      </div>
                      <input
                        placeholder="GitHub link"
                        value={bewerkForm.githubLink}
                        onChange={e => setBewerkForm({ ...bewerkForm, githubLink: e.target.value })}
                        className="input-themed"
                      />
                      <input
                        placeholder="Live demo link"
                        value={bewerkForm.demoLink}
                        onChange={e => setBewerkForm({ ...bewerkForm, demoLink: e.target.value })}
                        className="input-themed"
                      />
                    </div>
                    {opslaanFout && (
                      <p className="text-sm mt-3 px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
                        {opslaanFout}
                      </p>
                    )}
                    <div className="flex gap-3 mt-4">
                      <button onClick={slaProjectOp} className="btn-accent text-sm">Opslaan</button>
                      <button
                        onClick={() => { setBewerkProject(null); setOpslaanFout(''); }}
                        className="text-sm px-4 py-2 rounded-lg font-medium"
                        style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} rounded-xl p-6`}
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
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Door: {p.studentNaam}</p>
                        <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-dark)' }}>{p.beschrijving}</p>
                        <div className="flex gap-3 mt-3">
                          {p.githubLink && (
                            <a href={p.githubLink} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                              style={{ background: 'var(--surface-dark)', color: 'var(--text-on-dark)' }}>
                              GitHub
                            </a>
                          )}
                          {p.demoLink && (
                            <a href={p.demoLink} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                              style={{ background: 'var(--accent)', color: '#fff' }}>
                              Live demo
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => openBewerkProject(p)}
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
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
