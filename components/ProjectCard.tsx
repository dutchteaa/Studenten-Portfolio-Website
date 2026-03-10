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
    <div className="bg-[#0f1419] rounded-xl overflow-hidden border border-[#2a3540] hover:border-[#117e7d] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all duration-300">
      {afbeeldingUrl ? (
        <img src={afbeeldingUrl} alt={titel} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-[#1a2027] to-[#0f1419] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(17,126,125,0.15)] to-transparent" />
          <span className="text-4xl relative z-10">📁</span>
        </div>
      )}
      <div className="p-5">
        <h3 className="text-[#e8ecf0] text-lg font-bold">{titel}</h3>
        {studentNaam && (
          <span className="text-[#8b99a8] text-xs font-mono">door {studentNaam}</span>
        )}
        <p className="text-[#8b99a8] text-sm mt-3 line-clamp-3 leading-relaxed">{beschrijving}</p>
        {(githubLink || demoLink) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-[#2a3540]">
            {githubLink && (
              <a href={githubLink} target="_blank" rel="noopener noreferrer"
                className="text-sm bg-[#1a2027] text-[#e8ecf0] px-3 py-1.5 rounded-lg hover:bg-[#2a3540] transition-colors border border-[#2a3540]">
                GitHub
              </a>
            )}
            {demoLink && (
              <a href={demoLink} target="_blank" rel="noopener noreferrer"
                className="text-sm bg-[#117e7d] text-white px-3 py-1.5 rounded-lg hover:bg-[#1a9e9d] transition-colors">
                Live demo
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}