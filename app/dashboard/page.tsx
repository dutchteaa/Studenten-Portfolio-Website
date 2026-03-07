'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  collection, addDoc, getDocs, query, where,
  deleteDoc, doc, updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { sendEmailVerification } from 'firebase/auth';
import { db, storage } from '@/lib/firebase';

type ProjectType = 'website' | 'game' | 'hardware' | 'overig';
type MediaType = 'image' | 'video';

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
  mediaType?: MediaType;
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

const MAX_VIDEO_MB = 10;

export default function DashboardPage() {
  const { user, naam, loading } = useAuth();
  const router = useRouter();

  const [projecten, setProjecten] = useState<Project[]>([]);
  const [form, setForm] = useState(leegForm);
  const [toonFormulier, setToonFormulier] = useState(false);
  const [bewerkId, setBewerkId] = useState<string | null>(null);

  // File upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaBestand, setMediaBestand] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFileType, setMediaFileType] = useState<MediaType | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFout, setUploadFout] = useState('');

  // Members
  const [ledenZoek, setLedenZoek] = useState('');
  const [ledenZoekResultaat, setLedenZoekResultaat] = useState<Lid | null | 'niet-gevonden'>(null);
  const [ledenZoekLoading, setLedenZoekLoading] = useState(false);
  const [formulierLeden, setFormulierLeden] = useState<Lid[]>([]);

  // Save state
  const [opslaan_bezig, setOpslaanBezig] = useState(false);
  const [opslaanFout, setOpslaanFout] = useState('');

  // Email verification
  const [verificatieSent, setVerificatieSent] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const laadProjecten = useCallback(async () => {
    if (!user) return;
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

  function handleFileKiezen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg';

    if (!isVideo && !isImage) {
      setUploadFout('Alleen .png, .jpeg afbeeldingen of videobestanden zijn toegestaan.');
      return;
    }
    if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setUploadFout(`Video mag maximaal ${MAX_VIDEO_MB} MB zijn (huidig: ${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      return;
    }

    setUploadFout('');
    setMediaBestand(file);
    setMediaFileType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  }

  function verwijderMedia() {
    setMediaBestand(null);
    setMediaPreview(null);
    setMediaFileType(null);
    setUploadFout('');
    setForm(f => ({ ...f, afbeeldingUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function uploadMedia(file: File): Promise<{ url: string; type: MediaType }> {
    return new Promise((resolve, reject) => {
      const ext = file.name.split('.').pop();
      const storageRef = ref(storage, `projecten/${user!.uid}/${Date.now()}.${ext}`);
      const task = uploadBytesResumable(storageRef, file);
      task.on('state_changed',
        snap => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        err => reject(err),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          setUploadProgress(null);
          resolve({ url, type: file.type.startsWith('video/') ? 'video' : 'image' });
        }
      );
    });
  }

  function openNieuwFormulier() {
    setForm(leegForm);
    setFormulierLeden([]);
    setLedenZoek('');
    setLedenZoekResultaat(null);
    setBewerkId(null);
    setToonFormulier(true);
    verwijderMedia();
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
    setFormulierLeden((p.leden ?? []).filter(l => l.uid !== p.studentId));
    setLedenZoek('');
    setLedenZoekResultaat(null);
    setBewerkId(p.id);
    setToonFormulier(true);
    // Show existing media preview
    if (p.afbeeldingUrl) {
      setMediaPreview(p.afbeeldingUrl);
      setMediaFileType(p.mediaType ?? 'image');
    } else {
      verwijderMedia();
    }
  }

  function sluitFormulier() {
    setToonFormulier(false);
    setBewerkId(null);
    setForm(leegForm);
    setFormulierLeden([]);
    setLedenZoek('');
    setLedenZoekResultaat(null);
    setOpslaanFout('');
    setOpslaanBezig(false);
    verwijderMedia();
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
    if (lid.uid === user.uid) return;
    if (formulierLeden.some(l => l.uid === lid.uid)) return;
    setFormulierLeden(prev => [...prev, lid]);
    setLedenZoek('');
    setLedenZoekResultaat(null);
  }

  function verwijderLid(uid: string) {
    setFormulierLeden(prev => prev.filter(l => l.uid !== uid));
  }

  async function opslaan() {
    if (!form.titel || !form.beschrijving || !user) return;

    setOpslaanBezig(true);
    setOpslaanFout('');

    try {
      const eigenaarId = bewerkId
        ? projecten.find(p => p.id === bewerkId)?.studentId ?? user.uid
        : user.uid;
      const eigenaarNaam = naam ?? user.email ?? '';

      const eigenaarLid: Lid = { uid: eigenaarId, naam: eigenaarNaam, email: user.email ?? '' };
      const alleLedenZonderEigenaar = formulierLeden.filter(l => l.uid !== eigenaarId);
      const alleLeden = [eigenaarLid, ...alleLedenZonderEigenaar];

      let mediaUrl = form.afbeeldingUrl;
      let mediaType: MediaType | undefined = mediaFileType ?? undefined;

      if (mediaBestand) {
        try {
          const result = await uploadMedia(mediaBestand);
          mediaUrl = result.url;
          mediaType = result.type;
        } catch {
          setUploadFout('Upload mislukt. Controleer je Firebase Storage regels.');
          setOpslaanBezig(false);
          return;
        }
      }

      const data = {
        ...form,
        afbeeldingUrl: mediaUrl,
        mediaType: mediaType ?? null,
        leden: alleLeden,
        studentId: eigenaarId,
        studentNaam: eigenaarNaam,
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
    } catch (err) {
      console.error('Opslaan mislukt:', err);
      setOpslaanFout('Opslaan mislukt. Controleer je internetverbinding en Firebase-rechten.');
      setOpslaanBezig(false);
    }
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
          <div className="animate-fade-up mb-6 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
            style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#92400e' }}>⚠️ E-mail niet geverifieerd</p>
              <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                Verifieer je e-mailadres om volledige toegang te krijgen. Controleer je inbox bij {user.email}.
              </p>
            </div>
            <button onClick={stuurVerificatie} disabled={verificatieSent}
              className="text-xs font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
              style={{ background: verificatieSent ? '#fcd34d' : '#f59e0b', color: '#fff' }}>
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
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{naam ?? user?.email}</p>
          </div>
          {!toonFormulier && (
            <button onClick={openNieuwFormulier} className="btn-accent text-sm">
              + Project toevoegen
            </button>
          )}
        </div>

        {/* Project form */}
        {toonFormulier && (
          <div className="animate-fade-up rounded-2xl p-6 mb-8 shadow-sm"
            style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
              {bewerkId ? 'Project bewerken' : 'Nieuw project'}
            </h2>
            <div className="space-y-3">
              <input placeholder="Projecttitel *" value={form.titel}
                onChange={e => setForm({ ...form, titel: e.target.value })} className="input-themed" />
              <textarea placeholder="Beschrijving *" value={form.beschrijving}
                onChange={e => setForm({ ...form, beschrijving: e.target.value })}
                rows={4} className="input-themed" />

              {/* Type */}
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>Project type *</label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(typeLabels) as ProjectType[]).map(t => (
                    <button key={t} onClick={() => setForm({ ...form, type: t })}
                      className="text-sm px-4 py-2 rounded-lg font-medium transition-all"
                      style={form.type === t
                        ? { background: 'var(--accent)', color: '#fff' }
                        : { background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                      }>
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              <input placeholder="GitHub link (optioneel)" value={form.githubLink}
                onChange={e => setForm({ ...form, githubLink: e.target.value })} className="input-themed" />
              <input placeholder="Live demo link (optioneel)" value={form.demoLink}
                onChange={e => setForm({ ...form, demoLink: e.target.value })} className="input-themed" />

              {/* Media upload */}
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Afbeelding of video (optioneel · video max {MAX_VIDEO_MB} MB)
                </label>

                {mediaPreview ? (
                  <div className="relative rounded-xl overflow-hidden"
                    style={{ border: '1px solid var(--border)' }}>
                    {mediaFileType === 'video' ? (
                      <video src={mediaPreview} controls className="w-full max-h-56 object-contain bg-black" />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="w-full max-h-56 object-cover" />
                    )}
                    {/* Only show remove if it's a new file (not existing URL) */}
                    {mediaBestand && (
                      <button onClick={verwijderMedia}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: '#fee2e2', color: '#991b1b' }}>
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 rounded-xl flex flex-col items-center gap-2 transition-all"
                    style={{ border: '2px dashed var(--border)', background: 'var(--bg)', color: 'var(--text-muted)' }}>
                    <span className="text-2xl">📎</span>
                    <span className="text-sm font-medium">Klik om bestand te kiezen</span>
                    <span className="text-xs">.png, .jpg, .jpeg · video (max {MAX_VIDEO_MB} MB)</span>
                  </button>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,video/*"
                  onChange={handleFileKiezen}
                  className="hidden"
                />

                {/* Change button when preview is shown */}
                {mediaPreview && (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{ color: 'var(--accent)', background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                    Ander bestand kiezen
                  </button>
                )}

                {uploadFout && (
                  <p className="text-xs mt-2 px-3 py-1.5 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
                    {uploadFout}
                  </p>
                )}

                {uploadProgress !== null && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${uploadProgress}%`, background: 'var(--accent)' }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Uploaden... {uploadProgress}%</p>
                  </div>
                )}
              </div>

              {/* Leden */}
              <div className="pt-1">
                <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Teamleden toevoegen (optioneel)
                </label>
                <div className="flex gap-2">
                  <input placeholder="E-mailadres student zoeken..."
                    value={ledenZoek}
                    onChange={e => { setLedenZoek(e.target.value); setLedenZoekResultaat(null); }}
                    onKeyDown={e => e.key === 'Enter' && zoekStudent()}
                    className="input-themed flex-1" />
                  <button onClick={zoekStudent} disabled={ledenZoekLoading}
                    className="text-sm px-4 py-2 rounded-lg font-medium"
                    style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                    Zoeken
                  </button>
                </div>
                {ledenZoekResultaat === 'niet-gevonden' && (
                  <p className="text-xs mt-2" style={{ color: '#991b1b' }}>Student niet gevonden.</p>
                )}
                {ledenZoekResultaat && ledenZoekResultaat !== 'niet-gevonden' && (
                  <div className="flex items-center justify-between mt-2 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-dark)' }}>
                      {ledenZoekResultaat.naam}{' '}
                      <span style={{ color: 'var(--text-muted)' }}>({ledenZoekResultaat.email})</span>
                    </span>
                    <button onClick={() => voegLidToe(ledenZoekResultaat as Lid)}
                      className="text-xs font-semibold px-3 py-1 rounded-lg"
                      style={{ background: 'var(--accent)', color: '#fff' }}>
                      Toevoegen
                    </button>
                  </div>
                )}
                {formulierLeden.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formulierLeden.map(l => (
                      <span key={l.uid} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                        {l.naam}
                        <button onClick={() => verwijderLid(l.uid)} style={{ color: 'var(--accent)', fontWeight: 700 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {opslaanFout && (
              <p className="text-xs mt-4 px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#991b1b' }}>
                {opslaanFout}
              </p>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={opslaan} disabled={uploadProgress !== null || opslaan_bezig} className="btn-accent text-sm">
                {uploadProgress !== null
                  ? `Uploaden ${uploadProgress}%`
                  : opslaan_bezig
                  ? 'Bezig...'
                  : bewerkId ? 'Opslaan' : 'Publiceren'}
              </button>
              <button onClick={sluitFormulier} disabled={opslaan_bezig}
                className="text-sm px-5 py-2 rounded-lg font-medium transition-colors"
                style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Annuleren
              </button>
            </div>
          </div>
        )}

        {/* Project list */}
        {projecten.length === 0 ? (
          <div className="animate-fade-up text-center py-16 rounded-2xl"
            style={{ background: 'var(--bg-white)', border: '1px dashed var(--border)' }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl"
              style={{ background: 'var(--accent-glow)' }}>📁</div>
            <p style={{ color: 'var(--text-muted)' }}>Je hebt nog geen projecten. Voeg je eerste project toe!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projecten.map((p, i) => {
              const isEigenaar = p.studentId === user?.uid;
              return (
                <div key={p.id}
                  className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card-hover rounded-xl overflow-hidden`}
                  style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}>

                  {/* Media preview in card */}
                  {p.afbeeldingUrl && (
                    p.mediaType === 'video' ? (
                      <video src={p.afbeeldingUrl} controls className="w-full max-h-48 object-contain bg-black" />
                    ) : (
                      <img src={p.afbeeldingUrl} alt={p.titel} className="w-full h-40 object-cover" />
                    )
                  )}

                  <div className="p-6 flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>{p.titel}</h3>
                        {p.type && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                            {typeLabels[p.type] ?? p.type}
                          </span>
                        )}
                        {!isEigenaar && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                            Lid
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{p.beschrijving}</p>
                      {(p.leden ?? []).length > 0 && (
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                          Team: {(p.leden ?? []).map(l => l.naam).join(', ')}
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
                        <button onClick={() => openBewerkFormulier(p)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ color: '#1e40af', background: '#dbeafe' }}>
                          Bewerken
                        </button>
                        <button onClick={() => projectVerwijderen(p.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ color: '#991b1b', background: '#fee2e2' }}>
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
