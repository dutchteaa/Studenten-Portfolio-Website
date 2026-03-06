'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Project {
  id: string;
  titel: string;
  beschrijving: string;
  githubLink: string;
  demoLink: string;
  afbeeldingUrl: string;
  studentNaam: string;
}

export default function PortfolioPage() {
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function laadProjecten() {
      const snapshot = await getDocs(collection(db, 'projecten'));
      setProjecten(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
      setLoading(false);
    }
    laadProjecten();
  }, []);

  if (loading) return <p className="p-8 text-center">Laden...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Studentenportfolio</h1>
          <p className="text-gray-500 mt-3 text-lg">Bekijk de projecten die onze studenten hebben gemaakt</p>
        </div>

        {projecten.length === 0 && (
          <p className="text-center text-gray-400 py-12">Er zijn nog geen projecten gepubliceerd.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projecten.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {project.afbeeldingUrl ? (
                <img src={project.afbeeldingUrl} alt={project.titel} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-blue-400 text-4xl">📁</span>
                </div>
              )}
              <div className="p-5">
                <h2 className="text-xl font-semibold">{project.titel}</h2>
                <p className="text-sm text-gray-500 mt-1">Door {project.studentNaam}</p>
                <p className="text-gray-600 mt-3 text-sm line-clamp-3">{project.beschrijving}</p>
                <div className="flex gap-3 mt-4">
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
                      className="text-sm bg-gray-900 text-white px-3 py-1 rounded-lg hover:bg-gray-700">GitHub</a>
                  )}
                  {project.demoLink && (
                    <a href={project.demoLink} target="_blank" rel="noopener noreferrer"
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">Live demo</a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold">Bent u een bedrijf?</h2>
          <p className="text-gray-500 mt-2">Vraag een project aan en laat onze studenten aan de slag gaan.</p>
          <a href="/aanvraag" className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
            Project aanvragen
          </a>
        </div>

      </div>
    </div>
  );
}