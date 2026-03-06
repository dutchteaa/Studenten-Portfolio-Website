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
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--bg)' }}
      >
        <div
          className="animate-scale-in rounded-2xl p-10 text-center max-w-md shadow-lg"
          style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl"
            style={{ background: 'var(--accent-glow)', border: '2px solid var(--accent-glow-strong)' }}
          >
            ✓
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--accent)' }}>
            Aanvraag ontvangen!
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Bedankt voor uw aanvraag. We nemen zo snel mogelijk contact met u op.
          </p>
          <a href="/" className="btn-accent inline-block mt-6">
            Terug naar home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--bg)' }}>

      {/* Nav hint */}
      <div className="max-w-2xl mx-auto mb-6">
        <a
          href="/"
          className="text-sm transition-colors hover:text-[#117e7d]"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Terug naar home
        </a>
      </div>

      <div
        className="animate-fade-up max-w-2xl mx-auto rounded-2xl shadow-lg p-8"
        style={{ background: 'var(--bg-white)', border: '1px solid var(--border)' }}
      >
        <div className="badge-accent mb-5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
          Voor bedrijven
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
          Project aanvragen
        </h1>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Vul het formulier in en onze studenten gaan aan de slag.
        </p>

        {/* Bedrijfsgegevens */}
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}
        >
          Bedrijfsgegevens
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="bedrijfsnaam" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-dark)' }}>
              Bedrijfsnaam <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input id="bedrijfsnaam" name="bedrijfsnaam" value={form.bedrijfsnaam} onChange={handleChange}
              className="input-themed" placeholder="Naam BV" />
          </div>
          <div>
            <label htmlFor="contactpersoon" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-dark)' }}>
              Contactpersoon <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input id="contactpersoon" name="contactpersoon" value={form.contactpersoon} onChange={handleChange}
              className="input-themed" placeholder="Jan de Vries" />
          </div>
        </div>
        <div className="mb-8">
          <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-dark)' }}>
            E-mailadres <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
            className="input-themed" placeholder="jan@bedrijf.nl" />
        </div>

        {/* Projectdetails */}
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}
        >
          Projectdetails
        </h2>
        <div className="mb-4">
          <label htmlFor="projectomschrijving" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-dark)' }}>
            Projectomschrijving <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <textarea id="projectomschrijving" name="projectomschrijving" value={form.projectomschrijving} onChange={handleChange}
            rows={5} className="input-themed"
            placeholder="Beschrijf wat het project inhoudt..." />
        </div>
        <div className="mb-4">
          <label htmlFor="technologieen" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-dark)' }}>
            Gewenste technologieën
          </label>
          <input id="technologieen" name="technologieen" value={form.technologieen} onChange={handleChange}
            className="input-themed" placeholder="bijv. React, Python, Firebase" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-dark)' }}>
              Deadline
            </label>
            <input id="deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange}
              className="input-themed" />
          </div>
          <div>
            <label htmlFor="tijdsduur" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-dark)' }}>
              Tijdsduur
            </label>
            <input id="tijdsduur" name="tijdsduur" value={form.tijdsduur} onChange={handleChange}
              className="input-themed" placeholder="bijv. 6 weken" />
          </div>
        </div>

        {error && (
          <p
            className="text-sm mb-4 px-3 py-2 rounded-lg"
            style={{ background: '#fee2e2', color: '#991b1b' }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          className="btn-accent w-full text-center"
          style={{ padding: '0.8rem' }}
        >
          Aanvraag indienen
        </button>
      </div>
    </div>
  );
}
