'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authcontext';
import { logout } from '@/lib/auth';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Project {
  id: string;
  titel: string;
  beschrijving: string;
  githubLink: string;
  demoLink: string;
  afbeeldingUrl: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projecten, setProjecten] = useState<Project[]>([]);
  const [form, setForm] = useState({ titel: '', beschrijving: '', githubLink: '', demoLink: '', afbeeldingUrl: '' });
  const [toonFormulier, setToonFormulier] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) laadProjecten();
  }, [user]);

  async function laadProjecten() {
    const q = query(collection(db, 'projecten'), where('studentId', '==', user!.uid));
    const snapshot = await getDocs(q);
    setProjecten(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
  }

  async function projectToevoegen() {
    if (!form.titel || !form.beschrijving) return;
    await addDoc(collection(db, 'projecten'), {
      ...form,
      studentId: user!.uid,
      studentNaam: user!.displayName ?? user!.email,
      gepubliceerdOp: new Date().toISOString(),
    });
    setForm({ titel: '', beschrijving: '', githubLink: '', demoLink: '', afbeeldingUrl: '' });
    setToonFormulier(false);
    laadProjecten();
  }

  async function projectVerwijderen(id: string) {
    await deleteDoc(doc(db, 'projecten', id));
    laadProjecten();
  }

  if (loading) return <p className="p-8">Laden...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mijn Portfolio</h1>
            <p className="text-gray-500 mt-1">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setToonFormulier(!toonFormulier)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + Project toevoegen
            </button>
            <button onClick={() => { logout(); router.push('/login'); }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
              Uitloggen
            </button>
          </div>
        </div>

        {toonFormulier && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Nieuw project</h2>
            <input placeholder="Projecttitel *" value={form.titel} onChange={e => setForm({ ...form, titel: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 mb-3" />
            <textarea placeholder="Beschrijving *" value={form.beschrijving} onChange={e => setForm({ ...form, beschrijving: e.target.value })}
              rows={4} className="w-full border rounded-lg px-4 py-2 mb-3" />
            <input placeholder="GitHub link (optioneel)" value={form.githubLink} onChange={e => setForm({ ...form, githubLink: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 mb-3" />
            <input placeholder="Live demo link (optioneel)" value={form.demoLink} onChange={e => setForm({ ...form, demoLink: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 mb-3" />
            <input placeholder="Afbeelding URL (optioneel)" value={form.afbeeldingUrl} onChange={e => setForm({ ...form, afbeeldingUrl: e.target.value })}
              className="w-full border rounded-lg px-4 py-2 mb-4" />
            <div className="flex gap-3">
              <button onClick={projectToevoegen} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Publiceren</button>
              <button onClick={() => setToonFormulier(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg">Annuleren</button>
            </div>
          </div>
        )}

        {projecten.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Je hebt nog geen projecten. Voeg je eerste project toe!</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {projecten.map(p => (
              <div key={p.id} className="bg-white rounded-lg shadow-md p-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{p.titel}</h3>
                  <p className="text-gray-600 mt-1">{p.beschrijving}</p>
                  <div className="flex gap-4 mt-3">
                    {p.githubLink && <a href={p.githubLink} target="_blank" className="text-blue-600 hover:underline text-sm">GitHub</a>}
                    {p.demoLink && <a href={p.demoLink} target="_blank" className="text-blue-600 hover:underline text-sm">Live demo</a>}
                  </div>
                </div>
                <button onClick={() => projectVerwijderen(p.id)} className="text-red-500 hover:text-red-700 text-sm">Verwijderen</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}