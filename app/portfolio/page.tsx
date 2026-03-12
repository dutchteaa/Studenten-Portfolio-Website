'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Footer from '@/components/Footer';

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
  website: 'Website',
  game: 'Game',
  hardware: 'Hardware',
  overig: 'Overig',
};

const typeIcons: Record<string, string> = {
  website: '\u{1F310}',
  game: '\u{1F3AE}',
  hardware: '\u{1F527}',
  overig: '\u{1F4E6}',
};

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
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Portfolio laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      <div className="flex-1">
        {/* Header */}
        <div className="pt-12 pb-8 px-5" style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border)' }}>
          <div className="max-w-6xl mx-auto text-center">
            <span className="badge badge-accent mb-4 inline-flex">Studentenprojecten</span>
            <h1 className="animate-fade-up text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Studentenportfolio
            </h1>
            <p className="animate-fade-up animate-fade-up-2 mt-2 text-base" style={{ color: 'var(--text-muted)' }}>
              Bekijk de projecten die onze studenten hebben gemaakt
            </p>

            {/* Filter buttons */}
            <div className="mt-6 flex gap-1.5 flex-wrap justify-center">
              {filterOpties.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setActieveFilter(opt.value)}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={
                    actieveFilter === opt.value
                      ? { background: 'var(--accent)', color: '#fff' }
                      : { background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  }
                >
                  {opt.label}
                  {opt.value !== 'alles' && (
                    <span className="ml-1 opacity-60">
                      {projecten.filter(p => (p.type ?? 'overig') === opt.value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects grid */}
        <div className="max-w-6xl mx-auto px-5 py-10">
          {gefilterd.length === 0 ? (
            <div className="card p-14 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--accent-subtle)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent)' }}>
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {actieveFilter === 'alles'
                  ? 'Er zijn nog geen projecten gepubliceerd.'
                  : `Geen ${typeLabels[actieveFilter] ?? actieveFilter} projecten gevonden.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gefilterd.map((project, i) => (
                <div
                  key={project.id}
                  className={`animate-fade-up animate-fade-up-${Math.min(i + 1, 5)} card card-lift overflow-hidden`}
                >
                  {project.afbeeldingUrl ? (
                    project.mediaType === 'video' ? (
                      <video src={project.afbeeldingUrl} controls className="w-full h-48 object-contain bg-black" />
                    ) : (
                      <img src={project.afbeeldingUrl} alt={project.titel} className="w-full h-48 object-cover" />
                    )
                  ) : (
                    <div
                      className="w-full h-48 flex items-center justify-center text-3xl"
                      style={{ background: 'linear-gradient(135deg, var(--accent-subtle), var(--bg-secondary))' }}
                    >
                      {typeIcons[project.type ?? 'overig']}
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start gap-2 mb-1">
                      <h2 className="text-[0.9375rem] font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
                        {project.titel}
                      </h2>
                      {project.type && (
                        <span className="badge badge-accent text-[0.625rem] shrink-0">
                          {typeLabels[project.type] ?? project.type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                      {(project.leden && project.leden.length > 0)
                        ? project.leden.map(l => l.naam).join(', ')
                        : project.studentNaam}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>
                      {project.beschrijving}
                    </p>
                    {(project.githubLink || project.demoLink) && (
                      <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                        {project.githubLink && (
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
                            className="btn-secondary text-xs py-1.5 px-3">
                            GitHub
                          </a>
                        )}
                        {project.demoLink && (
                          <a href={project.demoLink} target="_blank" rel="noopener noreferrer"
                            className="btn-primary text-xs py-1.5 px-3">
                            Live demo
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-14 rounded-2xl p-10 text-center" style={{ background: 'var(--surface-dark)' }}>
            <span className="badge badge-accent mb-4 inline-flex">Voor bedrijven</span>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-on-dark)' }}>Bent u een bedrijf?</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-on-dark-muted)' }}>
              Vraag een project aan en laat onze studenten aan de slag gaan.
            </p>
            <a href="/aanvraag" className="btn-primary">Project aanvragen</a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
