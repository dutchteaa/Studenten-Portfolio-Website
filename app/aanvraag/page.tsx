'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AanvraagPage() {
  const [form, setForm] = useState({
    bedrijfsnaam: '',
    contactpersoon: '',
    email: '',
    projectomschrijving: '',
    technologieen: '',
    deadline: '',
    tijdsduur: '',
  });
  const [verzonden, setVerzonden] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    if (!form.bedrijfsnaam || !form.contactpersoon || !form.email || !form.projectomschrijving) {
      setError('Vul alle verplichte velden in.');
      return;
    }
    try {
      await addDoc(collection(db, 'aanvragen'), {
        ...form,
        status: 'nieuw',
        ingediendOp: new Date().toISOString(),
      });
      setVerzonden(true);
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    }
  }

  if (verzonden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Aanvraag ontvangen!</h2>
          <p className="text-gray-600">Bedankt voor uw aanvraag. We nemen zo snel mogelijk contact met u op.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-2">Project aanvragen</h1>
        <p className="text-gray-500 mb-8">Vul het formulier in en onze studenten gaan aan de slag.</p>

        <h2 className="text-lg font-semibold mb-4 text-gray-700">Bedrijfsgegevens</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bedrijfsnaam *</label>
            <input name="bedrijfsnaam" value={form.bedrijfsnaam} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2" placeholder="Naam BV" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contactpersoon *</label>
            <input name="contactpersoon" value={form.contactpersoon} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2" placeholder="Jan de Vries" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">E-mailadres *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2" placeholder="jan@bedrijf.nl" />
        </div>

        <h2 className="text-lg font-semibold mb-4 text-gray-700">Projectdetails</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Projectomschrijving *</label>
          <textarea name="projectomschrijving" value={form.projectomschrijving} onChange={handleChange}
            rows={5} className="w-full border rounded-lg px-4 py-2"
            placeholder="Beschrijf wat het project inhoudt..." />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Gewenste technologieën</label>
          <input name="technologieen" value={form.technologieen} onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2" placeholder="bijv. React, Python, Firebase" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <input name="deadline" type="date" value={form.deadline} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tijdsduur</label>
            <input name="tijdsduur" value={form.tijdsduur} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2" placeholder="bijv. 6 weken" />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
          Aanvraag indienen
        </button>
      </div>
    </div>
  );
}