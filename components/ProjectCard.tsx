interface ProjectCardProps {
  titel: string;
  beschrijving: string;
  studentNaam?: string;
  githubLink?: string;
  demoLink?: string;
  afbeeldingUrl?: string;
}

export default function ProjectCard({ titel, beschrijving, studentNaam, githubLink, demoLink, afbeeldingUrl }: ProjectCardProps) {
  return (
    <div className="card card-lift overflow-hidden">
      {afbeeldingUrl ? (
        <img src={afbeeldingUrl} alt={titel} className="w-full h-44 object-cover" />
      ) : (
        <div
          className="w-full h-44 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--accent-subtle), var(--bg-secondary))' }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-glow)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
          </div>
        </div>
      )}
      <div className="p-5">
        <h3 className="font-semibold text-[0.9375rem]" style={{ color: 'var(--text-primary)' }}>{titel}</h3>
        {studentNaam && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>door {studentNaam}</p>
        )}
        <p className="text-sm mt-2.5 line-clamp-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{beschrijving}</p>
        {(githubLink || demoLink) && (
          <div className="flex gap-2 mt-4 pt-3.5 border-t" style={{ borderColor: 'var(--border)' }}>
            {githubLink && (
              <a href={githubLink} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 px-3">
                GitHub
              </a>
            )}
            {demoLink && (
              <a href={demoLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs py-1.5 px-3">
                Live demo
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
