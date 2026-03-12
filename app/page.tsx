'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Footer from '@/components/Footer';

const TERMINAL_LINES = [
  { text: '$ npm run portfolio', color: 'var(--text-on-dark-muted)' },
  { text: '> Student projects loaded', color: 'var(--accent-light)' },
  { text: '> Connecting bedrijven...', color: 'var(--accent-light)' },
  { text: '> Platform ready!', color: '#4ade80' },
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
      <section className="relative overflow-hidden py-20 lg:py-28 px-5">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 bg-dots" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% -5%, var(--accent-glow) 0%, transparent 60%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="animate-fade-up animate-fade-up-1 flex flex-wrap gap-2 mb-5">
              <span className="badge badge-accent">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
                Portfolio Platform
              </span>
              <span className="badge badge-warning">
                Nova College
              </span>
            </div>

            <h1
              className="animate-fade-up animate-fade-up-2 text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-tight mb-5"
              style={{ color: 'var(--text-primary)' }}
            >
              Studenten ontmoeten{' '}
              <span style={{ color: 'var(--accent)' }}>het bedrijfsleven</span>
            </h1>

            <p
              className="animate-fade-up animate-fade-up-3 text-base lg:text-lg mb-8 max-w-lg leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              Een platform van Nova College studenten. Bekijk onze projecten of
              vraag een project aan en laat onze studenten aan de slag gaan met jouw uitdaging.
            </p>

            <div className="animate-fade-up animate-fade-up-4 flex gap-3 flex-wrap">
              <a href="/portfolio" className="btn-primary text-[0.9375rem] py-2.5 px-5">
                Bekijk portfolio
              </a>
              <a href="/aanvraag" className="btn-outline-accent text-[0.9375rem] py-2.5 px-5">
                Project aanvragen
              </a>
            </div>

            {/* Stats */}
            <div className="animate-fade-up animate-fade-up-5 mt-10 flex gap-10 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
              {[
                { value: stats.studenten > 0 ? stats.studenten : '\u2014', label: 'Studenten' },
                { value: stats.projecten > 0 ? stats.projecten : '\u2014', label: 'Projecten' },
                { value: 'Nova', label: 'College' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stat.value}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Terminal */}
          <div className="animate-fade-up animate-fade-up-3 hidden lg:block animate-float">
            <div className="card overflow-hidden" style={{ boxShadow: 'var(--shadow-xl)' }}>
              {/* Dark terminal area */}
              <div style={{ background: 'var(--surface-dark)' }}>
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid var(--surface-dark-border)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
                  <span className="ml-auto text-[0.6875rem] font-mono" style={{ color: 'var(--text-on-dark-muted)' }}>
                    terminal
                  </span>
                </div>

                {/* Terminal output */}
                <div className="p-5 font-mono text-sm space-y-2.5" style={{ minHeight: '180px' }}>
                  {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                    <div key={i} className="flex items-center gap-2 animate-fade-in">
                      <span style={{ color: line.color }}>{line.text}</span>
                      {i === visibleLines - 1 && visibleLines < TERMINAL_LINES.length && (
                        <span className="terminal-cursor">|</span>
                      )}
                    </div>
                  ))}
                  {visibleLines >= TERMINAL_LINES.length && (
                    <div className="flex items-center gap-2 mt-1">
                      <span style={{ color: 'var(--accent-light)' }}>$</span>
                      <span className="terminal-cursor">|</span>
                    </div>
                  )}
                </div>

                {/* Code snippet */}
                <div className="px-5 pb-5 font-mono text-xs space-y-0.5" style={{ color: 'var(--text-on-dark-muted)' }}>
                  <div>
                    <span style={{ color: '#7dd3fc' }}>const</span>{' '}
                    <span style={{ color: '#e8ecf0' }}>school</span>{' '}
                    <span style={{ color: 'var(--text-on-dark-muted)' }}>=</span>{' '}
                    <span style={{ color: '#4ade80' }}>&apos;Nova College&apos;</span>;
                  </div>
                  <div>
                    <span style={{ color: '#7dd3fc' }}>export default</span>{' '}
                    <span style={{ color: '#e8ecf0' }}>school</span>;
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Nova College banner ── */}
      <section className="py-8 px-5 border-y" style={{ background: 'var(--bg-white)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-glow-strong)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--accent)' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Een project van Nova College
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Dit platform is gebouwd door studenten als schoolproject. Studenten publiceren hun werk en bedrijven kunnen projecten aanvragen.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="py-20 px-5" style={{ background: 'var(--bg-white)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-2">Hoe het werkt</p>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Voor iedereen een passende route
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--accent)' }}>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                ),
                title: 'Voor studenten',
                desc: 'Maak een account aan met je Nova College e-mail en publiceer je projecten op de publieke portfolio.',
                link: '/register',
                linkText: 'Account aanmaken',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--accent)' }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                ),
                title: 'Voor bedrijven',
                desc: 'Geen account nodig. Vul het formulier in en onze studenten gaan aan de slag.',
                link: '/aanvraag',
                linkText: 'Project aanvragen',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--accent)' }}>
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                ),
                title: 'Projecten bekijken',
                desc: 'Bekijk alle gepubliceerde projecten van onze Nova College studenten op de portfolio pagina.',
                link: '/portfolio',
                linkText: 'Naar portfolio',
              },
            ].map((card, i) => (
              <a
                key={i}
                href={card.link}
                className={`animate-fade-up animate-fade-up-${i + 1} card card-lift p-6 group block`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'var(--accent-subtle)' }}
                >
                  {card.icon}
                </div>
                <h3 className="text-[0.9375rem] font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                  {card.desc}
                </p>
                <span className="text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: 'var(--accent)' }}>
                  {card.linkText}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark CTA ── */}
      <section className="py-20 px-5" style={{ background: 'var(--surface-dark)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <span className="badge badge-accent mb-5 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
            Voor bedrijven
          </span>
          <h3 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text-on-dark)' }}>
            Bent u een bedrijf?
          </h3>
          <p className="text-base lg:text-lg mb-8 leading-relaxed" style={{ color: 'var(--text-on-dark-muted)' }}>
            Vraag gratis een project aan en laat onze Nova College studenten een oplossing bouwen voor uw uitdaging.
          </p>
          <a href="/aanvraag" className="btn-primary text-[0.9375rem] py-3 px-6">
            Project aanvragen
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
