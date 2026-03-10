'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
  mediaType?: 'image' | 'video';
  studentNaam: string;
  type?: ProjectType;
  leden?: Lid[];
}

const typeLabels: Record<string, string> = {
  website: '🌐 Website',
  game: '🎮 Game',
  hardware: '🔧 Hardware',
  overig: '📦 Overig',
};

const filterOpties = [
  { value: 'alles', label: 'Alles' },
  { value: 'website', label: '🌐 Website' },
  { value: 'game', label: '🎮 Game' },
  { value: 'hardware', label: '🔧 Hardware' },
  { value: 'overig', label: '📦 Overig' },
];

export default function PortfolioPage() {
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actieveFilter, setActieveFilter] = useState('alles');

  useEffect(() => {
    async function laadProjecten() {
      const snapshot = await getDocs(collection(db, 'projecten'));
      setProjecten(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
      setLoading(false);
    }
    laadProjecten();
  }, []);

  const gefilterd = actieveFilter === 'alles'
    ? projecten
    : projecten.filter(p => (p.type ?? 'overig') === actieveFilter);

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

      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <div className="badge-accent justify-center mb-5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
          Studentenprojecten
        </div>
        <h1 className="animate-fade-up text-4xl font-bold" style={{ color: 'var(--text-dark)' }}>
          Studentenportfolio
        </h1>
        <p className="animate-fade-up animate-fade-up-2 mt-3 text-lg" style={{ color: 'var(--text-muted)' }}>
          Bekijk de projecten die onze studenten hebben gemaakt
        </p>
      </div>

      {/* Filter buttons */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex gap-2 flex-wrap justify-center">
          {filterOpties.map(opt => (
            <button
              key={opt.value}
              onClick={() => setActieveFilter(opt.value)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                actieveFilter === opt.value
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--bg-white)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {opt.label}
              {opt.value !== 'alles' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({projecten.filter(p => (p.type ?? 'overig') === opt.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {gefilterd.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ background: 'var(--bg-white)', border: '1px dashed var(--border)' }}
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl"
              style={{ background: 'var(--accent-glow)' }}>
              📁
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              {actieveFilter === 'alles'
                ? 'Er zijn nog geen projecten gepubliceerd.'
                : `Geen ${typeLabels[actieveFilter] ?? actieveFilter} projecten gevonden.`}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gefilterd.map((project, i) => (
            <div
              key={project.id}
              className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card-hover rounded-xl overflow-hidden`}
              style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
            >
              {project.afbeeldingUrl ? (
                project.mediaType === 'video' ? (
                  <video
                    src={project.afbeeldingUrl}
                    controls
                    className="w-full h-48 object-contain bg-black"
                  />
                ) : (
                  <img src={project.afbeeldingUrl} alt={project.titel} className="w-full h-48 object-cover" />
                )
              ) : (
                <div className="w-full h-48 flex items-center justify-center text-4xl"
                  style={{ background: 'var(--accent-glow)' }}>
                  {project.type === 'game' ? '🎮' : project.type === 'hardware' ? '🔧' : '🌐'}
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>{project.titel}</h2>
                  {project.type && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
                    >
                      {typeLabels[project.type] ?? project.type}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1 font-mono" style={{ color: 'var(--accent)' }}>
                  {(project.leden && project.leden.length > 0)
                    ? project.leden.map(l => l.naam).join(', ')
                    : project.studentNaam}
                </p>
                <p className="mt-3 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>
                  {project.beschrijving}
                </p>
                <div className="flex gap-3 mt-4">
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80"
                      style={{ background: 'var(--surface-dark)', color: 'var(--text-on-dark)' }}>
                      GitHub
                    </a>
                  )}
                  {project.demoLink && (
                    <a href={project.demoLink} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80"
                      style={{ background: 'var(--accent)', color: '#fff' }}>
                      Live demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-16 rounded-2xl p-10 text-center"
          style={{ background: 'var(--surface-dark)', border: '1px solid var(--surface-dark-border)' }}
        >
          <div className="badge-accent justify-center mb-4">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
            Voor bedrijven
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-on-dark)' }}>Bent u een bedrijf?</h2>
          <p className="mb-6" style={{ color: 'var(--text-on-dark-muted)' }}>
            Vraag een project aan en laat onze studenten aan de slag gaan.
          </p>
          <a href="/aanvraag" className="btn-accent">Project aanvragen</a>
        </div>
      </div>
    </div>
  );
}
