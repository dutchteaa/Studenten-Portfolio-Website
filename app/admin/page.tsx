'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

type ProjectType = 'website' | 'game' | 'hardware' | 'overig';
interface Claim { uid: string; naam: string; email: string; claimedAt: string; }
interface Aanvraag { id: string; bedrijfsnaam: string; contactpersoon: string; email: string; projectomschrijving: string; technologieen?: string; deadline?: string; tijdsduur?: string; status: string; claims?: Claim[]; }
interface Project { id: string; titel: string; beschrijving: string; studentNaam: string; githubLink?: string; demoLink?: string; type?: ProjectType; }
interface UserAccount { id: string; uid: string; email: string; name: string; role: string; approved: boolean; createdAt: string; }

const typeLabels: Record<string, string> = { website: 'Website', game: 'Game', hardware: 'Hardware', overig: 'Overig' };

export default function AdminPage() {
  const { role, loading } = useAuth();
  const router = useRouter();
  const [aanvragen, setAanvragen] = useState<Aanvraag[]>([]);
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [gebruikers, setGebruikers] = useState<UserAccount[]>([]);
  const [actieveTab, setActieveTab] = useState<'aanvragen' | 'projecten' | 'gebruikers'>('aanvragen');
  const [openClaims, setOpenClaims] = useState<string | null>(null);
  const [bewerkProject, setBewerkProject] = useState<Project | null>(null);
  const [bewerkForm, setBewerkForm] = useState({ titel: '', beschrijving: '', githubLink: '', demoLink: '', type: 'website' as ProjectType });
  const [opslaanFout, setOpslaanFout] = useState('');

  useEffect(() => { if (!loading && role !== 'admin') router.push('/login'); }, [role, loading, router]);
  useEffect(() => { if (role === 'admin') { laadAanvragen(); laadProjecten(); laadGebruikers(); } }, [role]);

  async function laadAanvragen() { const s = await getDocs(collection(db, 'aanvragen')); setAanvragen(s.docs.map(d => ({ id: d.id, ...d.data() } as Aanvraag))); }
  async function laadProjecten() { const s = await getDocs(collection(db, 'projecten')); setProjecten(s.docs.map(d => ({ id: d.id, ...d.data() } as Project))); }
  async function laadGebruikers() {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const s = await getDocs(q);
    setGebruikers(s.docs.map(d => ({ id: d.id, ...d.data() } as UserAccount)));
  }
  async function statusWijzigen(id: string, s: string) { await updateDoc(doc(db, 'aanvragen', id), { status: s }); laadAanvragen(); }
  async function verwijderClaim(a: Aanvraag, uid: string) { await updateDoc(doc(db, 'aanvragen', a.id), { claims: (a.claims ?? []).filter(c => c.uid !== uid) }); laadAanvragen(); }
  async function aanvraagVerwijderen(id: string) { await deleteDoc(doc(db, 'aanvragen', id)); laadAanvragen(); }
  function isDeadlineVerstreken(d?: string): boolean { if (!d) return false; const date = new Date(d); return !isNaN(date.getTime()) && date < new Date(); }
  async function projectVerwijderen(id: string) { await deleteDoc(doc(db, 'projecten', id)); laadProjecten(); }
  function openBewerkProject(p: Project) { setBewerkProject(p); setBewerkForm({ titel: p.titel, beschrijving: p.beschrijving, githubLink: p.githubLink ?? '', demoLink: p.demoLink ?? '', type: p.type ?? 'website' }); }
  async function slaProjectOp() {
    if (!bewerkProject) return; setOpslaanFout('');
    try { await updateDoc(doc(db, 'projecten', bewerkProject.id), bewerkForm); setBewerkProject(null); laadProjecten(); }
    catch (err: unknown) { setOpslaanFout(err instanceof Error ? err.message : 'Opslaan mislukt.'); }
  }

  async function keurGebruikerGoed(id: string) {
    await updateDoc(doc(db, 'users', id), { approved: true });
    laadGebruikers();
  }

  async function verwijderGebruiker(uid: string) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ uid }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? 'Verwijderen mislukt');
      return;
    }
    laadGebruikers();
  }

  const wachtendGebruikers = gebruikers.filter(g => g.approved === false);
  const goedgekeurdeGebruikers = gebruikers.filter(g => g.approved !== false);

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
      <div className="max-w-5xl mx-auto px-5 py-10">

        <div className="animate-fade-up mb-8">
          <span className="section-label block mb-1">Beheer</span>
          <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="animate-fade-up animate-fade-up-2 grid grid-cols-3 gap-4 mb-7">
          <div className="card p-5 text-center card-glow">
            <p className="text-3xl font-bold gradient-text">{aanvragen.length}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>Aanvragen</p>
          </div>
          <div className="card p-5 text-center card-glow">
            <p className="text-3xl font-bold gradient-text">{projecten.length}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>Projecten</p>
          </div>
          <div className="card p-5 text-center card-glow">
            <p className="text-3xl font-bold" style={{ color: wachtendGebruikers.length > 0 ? '#f59e0b' : 'var(--text-muted)' }}>{wachtendGebruikers.length}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>Wachtend</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="animate-fade-up animate-fade-up-3 flex gap-1.5 mb-6">
          {([
            { key: 'aanvragen' as const, label: `Bedrijfsaanvragen (${aanvragen.length})` },
            { key: 'projecten' as const, label: `Studentprojecten (${projecten.length})` },
            { key: 'gebruikers' as const, label: `Gebruikers${wachtendGebruikers.length > 0 ? ` (${wachtendGebruikers.length} nieuw)` : ''}` },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setActieveTab(tab.key)} className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={actieveTab === tab.key ? { background: 'var(--gradient)', color: '#fff' } : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Aanvragen */}
        {actieveTab === 'aanvragen' && (
          <div className="space-y-3">
            {aanvragen.length === 0 ? (
              <div className="animate-fade-up card p-14 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--gradient-subtle)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-3)' }}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12h6M12 9v6" /></svg>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Er zijn nog geen bedrijfsaanvragen.</p>
              </div>
            ) : aanvragen.map((a, i) => (
              <div key={a.id} className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card overflow-hidden`}>
                <div className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-[0.9375rem] font-semibold" style={{ color: 'var(--text-primary)' }}>{a.bedrijfsnaam}</h3>
                        <span className={`badge text-[0.625rem] font-semibold status-${a.status}`}>{a.status}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.contactpersoon} &middot; {a.email}</p>
                      <p className="mt-2.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a.projectomschrijving}</p>
                      <div className="flex flex-wrap gap-2.5 mt-2.5">
                        {a.technologieen && <span className="badge badge-neutral text-[0.625rem] font-mono">{a.technologieen}</span>}
                        {a.deadline && <span className="text-xs" style={{ color: isDeadlineVerstreken(a.deadline) ? '#f87171' : 'var(--text-muted)' }}>Deadline: {a.deadline}</span>}
                        {a.tijdsduur && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Duur: {a.tijdsduur}</span>}
                      </div>
                      {isDeadlineVerstreken(a.deadline) && <span className="badge badge-danger text-[0.625rem] mt-2 inline-flex">Deadline verstreken</span>}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {(a.claims ?? []).length > 0 && (
                        <button onClick={() => setOpenClaims(openClaims === a.id ? null : a.id)} className="btn-ghost text-xs">
                          {openClaims === a.id ? 'Verberg' : `Claims (${(a.claims ?? []).length})`}
                        </button>
                      )}
                      {a.status === 'nieuw' && (
                        <div className="flex gap-1.5">
                          <button onClick={() => statusWijzigen(a.id, 'goedgekeurd')} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>Goedkeuren</button>
                          <button onClick={() => statusWijzigen(a.id, 'afgewezen')} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Afwijzen</button>
                        </div>
                      )}
                      {a.status === 'goedgekeurd' && (
                        <button onClick={() => aanvraagVerwijderen(a.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Verwijderen</button>
                      )}
                    </div>
                  </div>
                </div>
                {openClaims === a.id && (a.claims ?? []).length > 0 && (
                  <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="section-label mt-4 mb-2.5">Geclaimd door</p>
                    <div className="flex flex-wrap gap-2">
                      {(a.claims ?? []).map((c, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                          <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'var(--gradient)' }}>{c.naam.charAt(0).toUpperCase()}</span>
                          <div>
                            <p className="font-medium text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>{c.naam}</p>
                            <p className="text-[0.6875rem]" style={{ color: 'var(--text-muted)' }}>{c.email}</p>
                          </div>
                          <button onClick={() => verwijderClaim(a, c.uid)} className="ml-1.5 text-xs font-medium px-2 py-1 rounded-lg" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Verwijder</button>
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
          <div className="space-y-3">
            {projecten.length === 0 ? (
              <div className="animate-fade-up card p-14 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--gradient-subtle)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-3)' }}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Er zijn nog geen studentprojecten.</p>
              </div>
            ) : projecten.map((p, i) => (
              <div key={p.id}>
                {bewerkProject?.id === p.id ? (
                  <div className="animate-fade-up card p-5" style={{ borderColor: 'var(--accent-1)' }}>
                    <p className="section-label mb-4">Project bewerken</p>
                    <div className="space-y-3">
                      <div><label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Titel</label><input value={bewerkForm.titel} onChange={e => setBewerkForm({ ...bewerkForm, titel: e.target.value })} className="input-themed" /></div>
                      <div><label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Beschrijving</label><textarea value={bewerkForm.beschrijving} onChange={e => setBewerkForm({ ...bewerkForm, beschrijving: e.target.value })} rows={3} className="input-themed" /></div>
                      <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type</label>
                        <div className="flex gap-2 flex-wrap">
                          {(['website', 'game', 'hardware', 'overig'] as ProjectType[]).map(t => (
                            <button key={t} onClick={() => setBewerkForm({ ...bewerkForm, type: t })} className="text-sm px-3 py-1.5 rounded-lg font-medium"
                              style={bewerkForm.type === t ? { background: 'var(--gradient)', color: '#fff' } : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                              {typeLabels[t]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>GitHub</label><input value={bewerkForm.githubLink} onChange={e => setBewerkForm({ ...bewerkForm, githubLink: e.target.value })} className="input-themed" /></div>
                        <div><label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Demo</label><input value={bewerkForm.demoLink} onChange={e => setBewerkForm({ ...bewerkForm, demoLink: e.target.value })} className="input-themed" /></div>
                      </div>
                    </div>
                    {opslaanFout && <div className="badge badge-danger mt-3 w-full justify-center py-2 text-sm">{opslaanFout}</div>}
                    <div className="flex gap-2.5 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                      <button onClick={slaProjectOp} className="btn-primary text-sm">Opslaan</button>
                      <button onClick={() => { setBewerkProject(null); setOpslaanFout(''); }} className="btn-secondary text-sm">Annuleren</button>
                    </div>
                  </div>
                ) : (
                  <div className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card`}>
                    <div className="p-5 flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-[0.9375rem] font-semibold" style={{ color: 'var(--text-primary)' }}>{p.titel}</h3>
                          {p.type && <span className="badge badge-accent text-[0.625rem]">{typeLabels[p.type]}</span>}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Door: {p.studentNaam}</p>
                        <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{p.beschrijving}</p>
                        <div className="flex gap-2 mt-3">
                          {p.githubLink && <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1 px-2.5">GitHub</a>}
                          {p.demoLink && <a href={p.demoLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-1 px-2.5">Live demo</a>}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => openBewerkProject(p)} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: '#818cf8', background: 'rgba(99,102,241,0.12)' }}>Bewerken</button>
                        <button onClick={() => projectVerwijderen(p.id)} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: '#f87171', background: 'rgba(239,68,68,0.12)' }}>Verwijderen</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Gebruikers */}
        {actieveTab === 'gebruikers' && (
          <div className="space-y-6">
            {/* Wachtend op goedkeuring */}
            <div>
              <p className="section-label mb-3">Wachtend op goedkeuring ({wachtendGebruikers.length})</p>
              {wachtendGebruikers.length === 0 ? (
                <div className="card p-10 text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Geen openstaande registraties.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {wachtendGebruikers.map((g, i) => (
                    <div key={g.id} className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card`}>
                      <div className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: 'var(--gradient)' }}>
                            {g.name?.charAt(0).toUpperCase() ?? '?'}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{g.name}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{g.email}</p>
                          </div>
                          <span className="badge badge-neutral text-[0.625rem] shrink-0 ml-auto mr-2">
                            {new Date(g.createdAt).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => keurGebruikerGoed(g.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>Goedkeuren</button>
                          <button onClick={() => verwijderGebruiker(g.uid)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Afwijzen</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Goedgekeurde gebruikers */}
            <div>
              <p className="section-label mb-3">Actieve studenten ({goedgekeurdeGebruikers.length})</p>
              {goedgekeurdeGebruikers.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Nog geen actieve studenten.</p>
                </div>
              ) : (
                <div className="card overflow-hidden">
                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {goedgekeurdeGebruikers.map(g => (
                      <div key={g.id} className="px-4 py-3 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'var(--gradient)' }}>
                          {g.name?.charAt(0).toUpperCase() ?? '?'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{g.name}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{g.email}</p>
                        </div>
                        <span className="badge badge-success text-[0.625rem] shrink-0">Actief</span>
                        <button onClick={() => verwijderGebruiker(g.uid)} className="text-xs font-medium px-2.5 py-1 rounded-lg shrink-0" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Verwijderen</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
