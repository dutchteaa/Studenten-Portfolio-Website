'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logout } from '@/lib/auth';

export default function AdminPage() {
  const { role, loading } = useAuth();
  const router = useRouter();
  const [aanvragen, setAanvragen] = useState<any[]>([]);
  const [projecten, setProjecten] = useState<any[]>([]);
  const [actieveTab, setActieveTab] = useState<'aanvragen' | 'projecten'>('aanvragen');

  useEffect(() => {
    if (!loading && role !== 'admin') router.push('/login');
  }, [role, loading]);

  useEffect(() => {
    if (role === 'admin') {
      laadAanvragen();
      laadProjecten();
    }
  }, [role]);

  async function laadAanvragen() {
    const snapshot = await getDocs(collection(db, 'aanvragen'));
    setAanvragen(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  async function laadProjecten() {
    const snapshot = await getDocs(collection(db, 'projecten'));
    setProjecten(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  async function statusWijzigen(id: string, nieuweStatus: string) {
    await updateDoc(doc(db, 'aanvragen', id), { status: nieuweStatus });
    laadAanvragen();
  }

  if (loading) return <p className="p-8">Laden...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={() => { logout(); router.push('/login'); }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">Uitloggen</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-4xl font-bold text-blue-600">{aanvragen.length}</p>
            <p className="text-gray-500 mt-1">Aanvragen van bedrijven</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-4xl font-bold text-green-600">{projecten.length}</p>
            <p className="text-gray-500 mt-1">Gepubliceerde projecten</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActieveTab('aanvragen')}
            className={`px-4 py-2 rounded-lg font-medium ${actieveTab === 'aanvragen' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>
            Bedrijfsaanvragen ({aanvragen.length})
          </button>
          <button onClick={() => setActieveTab('projecten')}
            className={`px-4 py-2 rounded-lg font-medium ${actieveTab === 'projecten' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>
            Studentprojecten ({projecten.length})
          </button>
        </div>

        {actieveTab === 'aanvragen' && aanvragen.map(a => (
          <div key={a.id} className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{a.bedrijfsnaam}</h3>
                <p className="text-gray-500 text-sm">{a.contactpersoon} · {a.email}</p>
                <p className="mt-2 text-gray-700">{a.projectomschrijving}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  {a.technologieen && <span>Tech: {a.technologieen}</span>}
                  {a.deadline && <span>Deadline: {a.deadline}</span>}
                  {a.tijdsduur && <span>Duur: {a.tijdsduur}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${a.status === 'nieuw' ? 'bg-yellow-100 text-yellow-800' : a.status === 'goedgekeurd' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {a.status}
                </span>
                {a.status === 'nieuw' && (
                  <div className="flex gap-2">
                    <button onClick={() => statusWijzigen(a.id, 'goedgekeurd')} className="bg-green-500 text-white px-3 py-1 rounded text-xs">Goedkeuren</button>
                    <button onClick={() => statusWijzigen(a.id, 'afgewezen')} className="bg-red-500 text-white px-3 py-1 rounded text-xs">Afwijzen</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {actieveTab === 'projecten' && projecten.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow p-6 mb-4">
            <h3 className="text-lg font-semibold">{p.titel}</h3>
            <p className="text-gray-500 text-sm">Door: {p.studentNaam}</p>
            <p className="mt-2 text-gray-700">{p.beschrijving}</p>
            <div className="flex gap-4 mt-2">
              {p.githubLink && <a href={p.githubLink} target="_blank" className="text-blue-600 hover:underline text-sm">GitHub</a>}
              {p.demoLink && <a href={p.demoLink} target="_blank" className="text-blue-600 hover:underline text-sm">Live demo</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}