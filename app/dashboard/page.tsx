'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ProjectType = 'website' | 'game' | 'hardware' | 'overig';
interface Lid { uid: string; naam: string; email: string; }
interface Project {
  id: string; titel: string; beschrijving: string; githubLink: string; demoLink: string;
  afbeeldingUrl: string; youtubeUrl?: string; type: ProjectType; leden: Lid[]; studentId: string; studentNaam: string;
}

const leegForm = { titel: '', beschrijving: '', githubLink: '', demoLink: '', afbeeldingUrl: '', youtubeUrl: '', type: 'website' as ProjectType };
const typeLabels: Record<ProjectType, string> = { website: 'Website', game: 'Game', hardware: 'Hardware', overig: 'Overig' };

export default function DashboardPage() {
  const { user, naam, loading } = useAuth();
  const router = useRouter();
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [form, setForm] = useState(leegForm);
  const [toonFormulier, setToonFormulier] = useState(false);
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [ledenZoek, setLedenZoek] = useState('');
  const [ledenZoekResultaat, setLedenZoekResultaat] = useState<Lid | null | 'niet-gevonden'>(null);
  const [ledenZoekLoading, setLedenZoekLoading] = useState(false);
  const [formulierLeden, setFormulierLeden] = useState<Lid[]>([]);
  const [opslaan_bezig, setOpslaanBezig] = useState(false);
  const [opslaanFout, setOpslaanFout] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  const laadProjecten = useCallback(async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, 'projecten'));
    const alle = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    setProjecten(alle.filter(p => p.studentId === user.uid || (p.leden ?? []).some((l: Lid) => l.uid === user.uid)));
  }, [user]);

  useEffect(() => { if (user) laadProjecten(); }, [user, laadProjecten]);

  function openNieuwFormulier() { setForm(leegForm); setFormulierLeden([]); setLedenZoek(''); setLedenZoekResultaat(null); setBewerkId(null); setToonFormulier(true); }
  function openBewerkFormulier(p: Project) {
    setForm({ titel: p.titel, beschrijving: p.beschrijving, githubLink: p.githubLink ?? '', demoLink: p.demoLink ?? '', afbeeldingUrl: p.afbeeldingUrl ?? '', youtubeUrl: p.youtubeUrl ?? '', type: p.type ?? 'website' });
    setFormulierLeden((p.leden ?? []).filter(l => l.uid !== p.studentId)); setLedenZoek(''); setLedenZoekResultaat(null); setBewerkId(p.id); setToonFormulier(true);
  }
  function sluitFormulier() { setToonFormulier(false); setBewerkId(null); setForm(leegForm); setFormulierLeden([]); setLedenZoek(''); setLedenZoekResultaat(null); setOpslaanFout(''); setOpslaanBezig(false); }

  async function zoekStudent() {
    if (!ledenZoek.trim()) return;
    setLedenZoekLoading(true); setLedenZoekResultaat(null);
    const q = query(collection(db, 'users'), where('email', '==', ledenZoek.trim().toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) { setLedenZoekResultaat('niet-gevonden'); } else {
      const data = snap.docs[0].data() as { uid: string; name: string; email: string };
      setLedenZoekResultaat({ uid: data.uid, naam: data.name, email: data.email });
    }
    setLedenZoekLoading(false);
  }

  function voegLidToe(lid: Lid) { if (!user || lid.uid === user.uid || formulierLeden.some(l => l.uid === lid.uid)) return; setFormulierLeden(prev => [...prev, lid]); setLedenZoek(''); setLedenZoekResultaat(null); }
  function verwijderLid(uid: string) { setFormulierLeden(prev => prev.filter(l => l.uid !== uid)); }

  async function opslaan() {
    if (!form.titel || !form.beschrijving || !user) { setOpslaanFout(!form.titel && !form.beschrijving ? 'Vul een titel en beschrijving in.' : !form.titel ? 'Vul een projecttitel in.' : 'Vul een beschrijving in.'); return; }
    setOpslaanBezig(true); setOpslaanFout('');
    try {
      const eigenaarId = bewerkId ? projecten.find(p => p.id === bewerkId)?.studentId ?? user.uid : user.uid;
      const eigenaarNaam = naam ?? user.email ?? '';
      const eigenaarLid: Lid = { uid: eigenaarId, naam: eigenaarNaam, email: user.email ?? '' };
      const alleLeden = [eigenaarLid, ...formulierLeden.filter(l => l.uid !== eigenaarId)];
      const data = { ...form, leden: alleLeden, studentId: eigenaarId, studentNaam: eigenaarNaam };
      if (bewerkId) { await updateDoc(doc(db, 'projecten', bewerkId), data); } else { await addDoc(collection(db, 'projecten'), { ...data, gepubliceerdOp: new Date().toISOString() }); }
      sluitFormulier(); laadProjecten();
    } catch (err) { console.error('Opslaan mislukt:', err); setOpslaanFout('Opslaan mislukt. Controleer je internetverbinding.'); setOpslaanBezig(false); }
  }

  async function projectVerwijderen(id: string) { await deleteDoc(doc(db, 'projecten', id)); laadProjecten(); }

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
      <div className="max-w-4xl mx-auto px-5 py-10">

        {/* Header */}
        <div className="animate-fade-up flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="section-label">Dashboard</span>
            <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>Mijn Portfolio</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{naam ?? user?.email}</p>
          </div>
          {!toonFormulier && (
            <button onClick={openNieuwFormulier} className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Project toevoegen
            </button>
          )}
        </div>

        {/* Form */}
        {toonFormulier && (
          <div className="animate-fade-up card p-6 mb-8">
            <p className="section-label mb-5">{bewerkId ? 'Project bewerken' : 'Nieuw project'}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Titel *</label>
                <input placeholder="Projecttitel" value={form.titel} onChange={e => setForm({ ...form, titel: e.target.value })} className="input-themed" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Beschrijving *</label>
                <textarea placeholder="Beschrijf je project..." value={form.beschrijving} onChange={e => setForm({ ...form, beschrijving: e.target.value })} rows={4} className="input-themed" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type</label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(typeLabels) as ProjectType[]).map(t => (
                    <button key={t} onClick={() => setForm({ ...form, type: t })} className="text-sm px-3.5 py-1.5 rounded-lg font-medium transition-all"
                      style={form.type === t ? { background: 'var(--gradient)', color: '#fff' } : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>GitHub link</label><input placeholder="https://github.com/..." value={form.githubLink} onChange={e => setForm({ ...form, githubLink: e.target.value })} className="input-themed" /></div>
                <div><label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Demo link</label><input placeholder="https://..." value={form.demoLink} onChange={e => setForm({ ...form, demoLink: e.target.value })} className="input-themed" /></div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Afbeelding URL</label>
                <input placeholder="https://..." value={form.afbeeldingUrl} onChange={e => setForm({ ...form, afbeeldingUrl: e.target.value })} className="input-themed" />
                {form.afbeeldingUrl && <img src={form.afbeeldingUrl} alt="Preview" className="mt-2 w-full max-h-44 object-cover rounded-lg" style={{ border: '1px solid var(--border)' }} onError={e => (e.currentTarget.style.display = 'none')} onLoad={e => (e.currentTarget.style.display = '')} />}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>YouTube link <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optioneel — wordt getoond in plaats van afbeelding)</span></label>
                <input placeholder="https://www.youtube.com/watch?v=..." value={form.youtubeUrl} onChange={e => setForm({ ...form, youtubeUrl: e.target.value })} className="input-themed" />
              </div>
              {/* Leden */}
              <div className="pt-2">
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Teamleden toevoegen</label>
                <div className="flex gap-2">
                  <input placeholder="E-mailadres zoeken..." value={ledenZoek} onChange={e => { setLedenZoek(e.target.value); setLedenZoekResultaat(null); }} onKeyDown={e => e.key === 'Enter' && zoekStudent()} className="input-themed flex-1" />
                  <button onClick={zoekStudent} disabled={ledenZoekLoading} className="btn-secondary text-sm shrink-0">Zoeken</button>
                </div>
                {ledenZoekResultaat === 'niet-gevonden' && <p className="text-xs mt-2" style={{ color: '#f87171' }}>Student niet gevonden.</p>}
                {ledenZoekResultaat && ledenZoekResultaat !== 'niet-gevonden' && (
                  <div className="flex items-center justify-between mt-2 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{ledenZoekResultaat.naam} <span style={{ color: 'var(--text-muted)' }}>({ledenZoekResultaat.email})</span></span>
                    <button onClick={() => voegLidToe(ledenZoekResultaat as Lid)} className="btn-primary text-xs py-1 px-3">Toevoegen</button>
                  </div>
                )}
                {formulierLeden.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {formulierLeden.map(l => (
                      <span key={l.uid} className="badge badge-accent pr-1.5">{l.naam}<button onClick={() => verwijderLid(l.uid)} className="ml-1 font-bold hover:opacity-70">&times;</button></span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {opslaanFout && <div className="badge badge-danger mt-4 w-full justify-center py-2 text-sm">{opslaanFout}</div>}
            <div className="flex gap-2.5 mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={opslaan} disabled={opslaan_bezig} className="btn-primary">{opslaan_bezig ? 'Bezig...' : bewerkId ? 'Opslaan' : 'Publiceren'}</button>
              <button onClick={sluitFormulier} disabled={opslaan_bezig} className="btn-secondary">Annuleren</button>
            </div>
          </div>
        )}

        {/* Project list */}
        {projecten.length === 0 ? (
          <div className="animate-fade-up card p-14 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--gradient-subtle)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-3)' }}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Je hebt nog geen projecten. Voeg je eerste project toe!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projecten.map((p, i) => {
              const isEigenaar = p.studentId === user?.uid;
              return (
                <div key={p.id} className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card overflow-hidden`}>
                  {p.afbeeldingUrl && <img src={p.afbeeldingUrl} alt={p.titel} className="w-full h-40 object-cover" />}
                  <div className="p-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-[0.9375rem] font-semibold" style={{ color: 'var(--text-primary)' }}>{p.titel}</h3>
                        {p.type && <span className="badge badge-accent text-[0.625rem]">{typeLabels[p.type]}</span>}
                        {!isEigenaar && <span className="badge badge-success text-[0.625rem]">Lid</span>}
                      </div>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{p.beschrijving}</p>
                      {(p.leden ?? []).length > 0 && <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Team: {(p.leden ?? []).map(l => l.naam).join(', ')}</p>}
                      <div className="flex gap-2 mt-3">
                        {p.githubLink && <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1 px-2.5">GitHub</a>}
                        {p.demoLink && <a href={p.demoLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-1 px-2.5">Live demo</a>}
                      </div>
                    </div>
                    {isEigenaar && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => openBewerkFormulier(p)} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: '#818cf8', background: 'rgba(99,102,241,0.12)' }}>Bewerken</button>
                        <button onClick={() => projectVerwijderen(p.id)} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: '#f87171', background: 'rgba(239,68,68,0.12)' }}>Verwijderen</button>
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
