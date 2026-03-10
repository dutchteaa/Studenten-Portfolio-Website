'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TERMINAL_LINES = [
  { text: '$ npm run portfolio', color: 'var(--text-on-dark-muted)' },
  { text: '✓ Student projects loaded', color: 'var(--accent)' },
  { text: '✓ Connecting bedrijven...', color: 'var(--accent)' },
  { text: '✓ Platform ready!', color: '#4ade80' },
];

export default function HomePage() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [stats, setStats] = useState({ studenten: 0, projecten: 0 });

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    TERMINAL_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), i * 700 + 400));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    async function laadStats() {
      const snapshot = await getDocs(collection(db, 'projecten'));
      const projecten = snapshot.docs.map(d => d.data());
      const uniqueStudenten = new Set(projecten.map(p => p.studentId)).size;
      setStats({ studenten: uniqueStudenten, projecten: projecten.length });
    }
    laadStats();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 px-6 bg-grid">
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(17,126,125,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left */}
          <div>
            <div className="animate-fade-up animate-fade-up-1 flex flex-wrap gap-2 mb-6">
              <span className="badge-accent">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
                School Portfolio Platform
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}
              >
                🎓 Nova College
              </span>
            </div>

            <h1
              className="animate-fade-up animate-fade-up-2 text-5xl font-bold leading-tight mb-6"
              style={{ color: 'var(--text-dark)' }}
            >
              Studenten ontmoeten<br />
              <span style={{ color: 'var(--accent)' }}>het bedrijfsleven</span>
            </h1>

            <p
              className="animate-fade-up animate-fade-up-3 text-lg mb-10 max-w-lg"
              style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}
            >
              Een platform van Nova College studenten. Bekijk onze projecten of
              vraag een project aan en laat onze studenten aan de slag gaan met jouw uitdaging.
            </p>

            <div className="animate-fade-up animate-fade-up-4 flex gap-4 flex-wrap">
              <a href="/portfolio" className="btn-accent">
                Bekijk portfolio
              </a>
              <a href="/aanvraag" className="btn-outline">
                Project aanvragen
              </a>
            </div>

            {/* Stats strip */}
            <div
              className="animate-fade-up animate-fade-up-5 mt-12 flex gap-8 pt-8"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  {stats.studenten > 0 ? stats.studenten : '—'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Studenten</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  {stats.projecten > 0 ? stats.projecten : '—'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Projecten</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>Nova</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>College</p>
              </div>
            </div>
          </div>

          {/* Right — Terminal */}
          <div className="animate-fade-up animate-fade-up-3 hidden lg:block animate-float">
            <div
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: 'var(--surface-dark)',
                border: '1px solid var(--surface-dark-border)',
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center gap-2 px-5 py-3.5"
                style={{ borderBottom: '1px solid var(--surface-dark-border)' }}
              >
                <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
                <span
                  className="ml-auto text-xs font-mono"
                  style={{ color: 'var(--text-on-dark-muted)' }}
                >
                  bash — sp-portfolio
                </span>
              </div>

              {/* Terminal output */}
              <div className="p-6 font-mono text-sm space-y-3" style={{ minHeight: '200px' }}>
                {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                  <div key={i} className="flex items-center gap-2 animate-fade-in">
                    <span style={{ color: line.color }}>{line.text}</span>
                    {i === visibleLines - 1 && visibleLines < TERMINAL_LINES.length && (
                      <span className="terminal-cursor">▌</span>
                    )}
                  </div>
                ))}
                {visibleLines >= TERMINAL_LINES.length && (
                  <div className="flex items-center gap-2 mt-2">
                    <span style={{ color: 'var(--accent)' }}>$</span>
                    <span className="terminal-cursor">▌</span>
                  </div>
                )}
              </div>

              {/* Code snippet */}
              <div
                className="px-6 pb-6 font-mono text-xs space-y-1"
                style={{ color: 'var(--text-on-dark-muted)' }}
              >
                <div>
                  <span style={{ color: '#7dd3fc' }}>const</span>{' '}
                  <span style={{ color: '#e8ecf0' }}>school</span>{' '}
                  <span style={{ color: 'var(--text-on-dark-muted)' }}>=</span>{' '}
                  <span style={{ color: '#4ade80' }}>'Nova College'</span>;
                </div>
                <div>
                  <span style={{ color: '#7dd3fc' }}>export default</span>{' '}
                  <span style={{ color: '#e8ecf0' }}>school</span>;
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Nova College banner ── */}
      <section
        className="py-10 px-6"
        style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-5">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}
          >
            🎓
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-dark)' }}>
              Een project van Nova College
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Dit platform is gebouwd door studenten van Nova College als schoolproject.
              Studenten publiceren hier hun werk en bedrijven kunnen projecten aanvragen.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="py-20 px-6" style={{ background: 'var(--bg-white)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>Hoe werkt het?</h2>
            <p className="mt-3 text-base" style={{ color: 'var(--text-muted)' }}>
              Voor iedereen een passende route
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🎓',
                title: 'Voor studenten',
                desc: 'Maak een account aan met je Nova College e-mail en publiceer je projecten op de publieke portfolio.',
                link: '/register',
                linkText: 'Account aanmaken →',
              },
              {
                icon: '🏢',
                title: 'Voor bedrijven',
                desc: 'Geen account nodig. Vul het formulier in en onze studenten gaan aan de slag.',
                link: '/aanvraag',
                linkText: 'Project aanvragen →',
              },
              {
                icon: '💼',
                title: 'Projecten bekijken',
                desc: 'Bekijk alle gepubliceerde projecten van onze Nova College studenten op de portfolio pagina.',
                link: '/portfolio',
                linkText: 'Naar portfolio →',
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`animate-fade-up animate-fade-up-${i + 1} card-hover p-7 rounded-xl`}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl"
                  style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent-glow-strong)' }}
                >
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
                  {card.desc}
                </p>
                <a href={card.link} className="text-sm font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
                  {card.linkText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark CTA ── */}
      <section className="py-24 px-6 bg-grid-dark" style={{ background: 'var(--surface-dark)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="badge-accent mb-6 justify-center">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
            Voor bedrijven
          </div>
          <h3 className="text-4xl font-bold mb-5" style={{ color: 'var(--text-on-dark)' }}>
            Bent u een bedrijf?
          </h3>
          <p className="text-lg mb-10" style={{ color: 'var(--text-on-dark-muted)', lineHeight: '1.7' }}>
            Vraag gratis een project aan en laat onze Nova College studenten een oplossing bouwen voor uw uitdaging.
          </p>
          <a href="/aanvraag" className="btn-accent text-base">
            Project aanvragen
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--surface-dark)', borderTop: '1px solid var(--surface-dark-border)' }}>
        <div
          className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm"
          style={{ color: 'var(--text-on-dark-muted)' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold font-mono" style={{ color: 'var(--accent)' }}>SP.dev</span>
            <span>© 2025 Nova College · Studenten Portfolio</span>
          </div>
          <div className="flex gap-6">
            {[
              { label: 'Portfolio', href: '/portfolio' },
              { label: 'Project aanvragen', href: '/aanvraag' },
              { label: 'Inloggen', href: '/login' },
            ].map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-white" style={{ color: 'var(--text-on-dark-muted)' }}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
