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
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    if (!form.bedrijfsnaam || !form.contactpersoon || !form.email || !form.projectomschrijving) {
      setError('Vul alle verplichte velden in.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'aanvragen'), {
        ...form,
        status: 'nieuw',
        ingediendOp: new Date().toISOString(),
      });
      setVerzonden(true);
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
      setLoading(false);
    }
  }

  if (verzonden) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--bg)' }}>
        <div className="animate-scale-in w-full max-w-sm">
          <div className="card p-8 text-center" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Aanvraag ontvangen!</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Bedankt voor uw aanvraag. We nemen zo snel mogelijk contact met u op.
            </p>
            <a href="/" className="btn-primary w-full mt-5 py-2.5">Terug naar home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-5" style={{ background: 'var(--bg)' }}>
      <div className="animate-fade-up max-w-2xl mx-auto">
        <div className="card p-7" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <span className="badge badge-accent mb-4 inline-flex">Voor bedrijven</span>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Project aanvragen</h1>
          <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>
            Vul het formulier in en onze studenten gaan aan de slag.
          </p>

          <p className="section-label mb-4">Bedrijfsgegevens</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label htmlFor="bedrijfsnaam" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Bedrijfsnaam <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input id="bedrijfsnaam" name="bedrijfsnaam" value={form.bedrijfsnaam} onChange={handleChange}
                className="input-themed" placeholder="Naam BV" />
            </div>
            <div>
              <label htmlFor="contactpersoon" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Contactpersoon <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input id="contactpersoon" name="contactpersoon" value={form.contactpersoon} onChange={handleChange}
                className="input-themed" placeholder="Jan de Vries" />
            </div>
          </div>
          <div className="mb-7">
            <label htmlFor="email" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              E-mailadres <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
              className="input-themed" placeholder="jan@bedrijf.nl" />
          </div>

          <p className="section-label mb-4">Projectdetails</p>
          <div className="mb-3">
            <label htmlFor="projectomschrijving" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Projectomschrijving <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <textarea id="projectomschrijving" name="projectomschrijving" value={form.projectomschrijving} onChange={handleChange}
              rows={5} className="input-themed" placeholder="Beschrijf wat het project inhoudt..." />
          </div>
          <div className="mb-3">
            <label htmlFor="technologieen" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Gewenste technologieen
            </label>
            <input id="technologieen" name="technologieen" value={form.technologieen} onChange={handleChange}
              className="input-themed" placeholder="bijv. React, Python, Firebase" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
            <div>
              <label htmlFor="deadline" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Deadline</label>
              <input id="deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange}
                className="input-themed" />
            </div>
            <div>
              <label htmlFor="tijdsduur" className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tijdsduur</label>
              <input id="tijdsduur" name="tijdsduur" value={form.tijdsduur} onChange={handleChange}
                className="input-themed" placeholder="bijv. 6 weken" />
            </div>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Bezig...' : 'Aanvraag indienen'}
          </button>
        </div>
      </div>
    </div>
  );
}
