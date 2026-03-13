'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Footer from '@/components/Footer';

type ProjectType = 'website' | 'game' | 'hardware' | 'overig';

interface Lid { uid: string; naam: string; email: string; }

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

const typeLabels: Record<string, string> = { website: 'Website', game: 'Game', hardware: 'Hardware', overig: 'Overig' };
const typeIcons: Record<string, string> = { website: '\u{1F310}', game: '\u{1F3AE}', hardware: '\u{1F527}', overig: '\u{1F4E6}' };

const filterOpties = [
  { value: 'alles', label: 'Alles' },
  { value: 'website', label: 'Website' },
  { value: 'game', label: 'Game' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'overig', label: 'Overig' },
];

export default function PortfolioPage() {
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actieveFilter, setActieveFilter] = useState('alles');
  const [zoekterm, setZoekterm] = useState('');

  useEffect(() => {
    async function laadProjecten() {
      const snapshot = await getDocs(collection(db, 'projecten'));
      setProjecten(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
      setLoading(false);
    }
    laadProjecten();
  }, []);

  const gefilterd = projecten.filter(p => {
    if (actieveFilter !== 'alles' && (p.type ?? 'overig') !== actieveFilter) return false;
    if (!zoekterm.trim()) return true;
    const term = zoekterm.toLowerCase();
    return p.titel.toLowerCase().includes(term)
      || p.beschrijving.toLowerCase().includes(term)
      || p.studentNaam.toLowerCase().includes(term)
      || (p.leden ?? []).some(l => l.naam.toLowerCase().includes(term));
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-1)' }} />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Portfolio laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="pt-12 pb-8 px-5 relative">
          <div className="hero-glow" style={{ width: '400px', height: '400px', background: 'rgba(99,102,241,0.06)', top: '-100px', left: '50%', transform: 'translateX(-50%)' }} />
          <div className="max-w-6xl mx-auto text-center relative">
            <span className="badge badge-accent mb-4 inline-flex">Studentenprojecten</span>
            <h1 className="animate-fade-up text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="gradient-text">Studentenportfolio</span>
            </h1>
            <p className="animate-fade-up animate-fade-up-2 mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
              Bekijk de projecten die onze studenten hebben gemaakt
            </p>

            {/* Search */}
            <div className="animate-fade-up animate-fade-up-3 mt-6 max-w-md mx-auto relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--text-muted)' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Zoek op titel, student of beschrijving..."
                value={zoekterm}
                onChange={e => setZoekterm(e.target.value)}
                className="input-themed pl-10"
              />
            </div>

            {/* Filters */}
            <div className="mt-4 flex gap-1.5 flex-wrap justify-center">
              {filterOpties.map(opt => (
                <button key={opt.value} onClick={() => setActieveFilter(opt.value)}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={actieveFilter === opt.value
                    ? { background: 'var(--gradient)', color: '#fff' }
                    : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  }>
                  {opt.label}
                  {opt.value !== 'alles' && <span className="ml-1 opacity-60">{projecten.filter(p => (p.type ?? 'overig') === opt.value).length}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-5 py-10">
          {gefilterd.length === 0 ? (
            <div className="card p-14 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--gradient-subtle)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent-3)' }}>
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {zoekterm.trim() ? 'Geen projecten gevonden voor je zoekopdracht.' : actieveFilter === 'alles' ? 'Er zijn nog geen projecten gepubliceerd.' : `Geen ${typeLabels[actieveFilter]} projecten gevonden.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gefilterd.map((project, i) => (
                <div key={project.id} className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card card-lift overflow-hidden`}>
                  {project.afbeeldingUrl ? (
                    project.mediaType === 'video' ? (
                      <video src={project.afbeeldingUrl} controls className="w-full h-48 object-contain bg-black" />
                    ) : (
                      <img src={project.afbeeldingUrl} alt={project.titel} className="w-full h-48 object-cover" />
                    )
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-3xl" style={{ background: 'var(--gradient-subtle)' }}>
                      {typeIcons[project.type ?? 'overig']}
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start gap-2 mb-1">
                      <h2 className="text-[0.9375rem] font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>{project.titel}</h2>
                      {project.type && <span className="badge badge-accent text-[0.625rem] shrink-0">{typeLabels[project.type]}</span>}
                    </div>
                    <p className="text-xs font-medium" style={{ color: 'var(--accent-3)' }}>
                      {(project.leden && project.leden.length > 0) ? project.leden.map(l => l.naam).join(', ') : project.studentNaam}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>{project.beschrijving}</p>
                    {(project.githubLink || project.demoLink) && (
                      <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                        {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 px-3">GitHub</a>}
                        {project.demoLink && <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-1.5 px-3">Live demo</a>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-14 rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2), transparent)' }}>
            <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--bg-secondary)' }}>
              <span className="badge badge-accent mb-4 inline-flex">Voor bedrijven</span>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Bent u een bedrijf?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Vraag een project aan en laat onze studenten aan de slag gaan.</p>
              <a href="/aanvraag" className="btn-primary">Project aanvragen</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
