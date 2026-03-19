'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Footer from '@/components/Footer';

const TERMINAL_LINES = [
  { text: '$ npm run portfolio', dim: true },
  { text: '> Student projects loaded', accent: true },
  { text: '> Connecting bedrijven...', accent: true },
  { text: '> Platform ready!', green: true },
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
      const [projectenCount, studentenCount] = await Promise.all([
        getCountFromServer(collection(db, 'projecten')),
        getCountFromServer(query(collection(db, 'users'), where('role', '==', 'student'), where('approved', '==', true))),
      ]);
      setStats({ studenten: studentenCount.data().count, projecten: projectenCount.data().count });
    }
    laadStats();
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center px-5">
        {/* Glow orbs */}
        <div className="hero-glow" style={{ width: '600px', height: '600px', background: 'rgba(99, 102, 241, 0.12)', top: '-200px', left: '-100px' }} />
        <div className="hero-glow" style={{ width: '500px', height: '500px', background: 'rgba(139, 92, 246, 0.1)', bottom: '-200px', right: '-100px', animationDelay: '2s' }} />
        <div className="hero-glow" style={{ width: '300px', height: '300px', background: 'rgba(168, 85, 247, 0.08)', top: '40%', left: '60%', animationDelay: '1s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-40" />

        <div className="relative max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">

          {/* Left */}
          <div>
            <div className="animate-fade-up animate-fade-up-1 flex flex-wrap gap-2 mb-6">
              <span className="badge badge-accent">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent-1)' }} />
                Portfolio Platform
              </span>
              <span className="badge badge-warning">
                Nova College
              </span>
            </div>

            <h1 className="animate-fade-up animate-fade-up-2 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-5">
              <span style={{ color: 'var(--text-primary)' }}>Studenten</span><br />
              <span style={{ color: 'var(--text-primary)' }}>ontmoeten </span>
              <span className="gradient-text">het bedrijfsleven</span>
            </h1>

            <p className="animate-fade-up animate-fade-up-3 text-base lg:text-lg mb-8 max-w-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Een platform van Nova College studenten. Bekijk onze projecten of
              vraag een project aan en laat onze studenten aan de slag gaan met jouw uitdaging.
            </p>

            <div className="animate-fade-up animate-fade-up-4 flex gap-3 flex-wrap">
              <a href="/portfolio" className="btn-primary text-[0.9375rem] py-3 px-6">
                Bekijk portfolio
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="/aanvraag" className="btn-outline-accent text-[0.9375rem] py-3 px-6">
                Project aanvragen
              </a>
            </div>

            {/* Stats */}
            <div className="animate-fade-up animate-fade-up-5 mt-12 flex gap-10 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
              {[
                { value: stats.studenten > 0 ? stats.studenten : '\u2014', label: 'Studenten' },
                { value: stats.projecten > 0 ? stats.projecten : '\u2014', label: 'Projecten' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Terminal */}
          <div className="animate-fade-up animate-fade-up-3 hidden lg:block animate-float">
            <div className="card overflow-hidden" style={{ boxShadow: 'var(--glow)' }}>
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
                <span className="ml-auto text-[0.6875rem] font-mono" style={{ color: 'var(--text-muted)' }}>terminal</span>
              </div>

              {/* Terminal output */}
              <div className="p-5 font-mono text-sm space-y-2.5" style={{ minHeight: '180px' }}>
                {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                  <div key={i} className="flex items-center gap-2 animate-fade-in">
                    <span style={{ color: line.dim ? 'var(--text-muted)' : line.green ? '#4ade80' : 'var(--accent-3)' }}>
                      {line.text}
                    </span>
                    {i === visibleLines - 1 && visibleLines < TERMINAL_LINES.length && (
                      <span className="terminal-cursor">|</span>
                    )}
                  </div>
                ))}
                {visibleLines >= TERMINAL_LINES.length && (
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ color: 'var(--accent-3)' }}>$</span>
                    <span className="terminal-cursor">|</span>
                  </div>
                )}
              </div>

              {/* Code snippet */}
              <div className="px-5 pb-5 font-mono text-xs space-y-0.5">
                <div>
                  <span style={{ color: '#818cf8' }}>const</span>{' '}
                  <span style={{ color: 'var(--text-primary)' }}>school</span>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>=</span>{' '}
                  <span style={{ color: '#4ade80' }}>&apos;Nova College&apos;</span>;
                </div>
                <div>
                  <span style={{ color: '#818cf8' }}>export default</span>{' '}
                  <span style={{ color: 'var(--text-primary)' }}>school</span>;
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Nova College banner ── */}
      <section className="py-8 px-5" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--gradient-subtle)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--accent-3)' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Een project van Nova College</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Gebouwd door studenten als schoolproject. Studenten publiceren hun werk en bedrijven kunnen projecten aanvragen.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="py-24 px-5 relative">
        <div className="hero-glow" style={{ width: '400px', height: '400px', background: 'rgba(99,102,241,0.06)', top: '20%', right: '-100px' }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Hoe het werkt</p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Voor iedereen een <span className="gradient-text">passende route</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--accent-3)' }}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
                title: 'Voor studenten',
                desc: 'Maak een account aan met je Nova College e-mail en publiceer je projecten op de publieke portfolio.',
                link: '/register',
                linkText: 'Account aanmaken',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--accent-3)' }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
                title: 'Voor bedrijven',
                desc: 'Geen account nodig. Vul het formulier in en onze studenten gaan aan de slag.',
                link: '/aanvraag',
                linkText: 'Project aanvragen',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--accent-3)' }}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
                title: 'Projecten bekijken',
                desc: 'Bekijk alle gepubliceerde projecten van onze Nova College studenten.',
                link: '/portfolio',
                linkText: 'Naar portfolio',
              },
            ].map((card, i) => (
              <a key={i} href={card.link} className={`animate-fade-up animate-fade-up-${i + 1} card card-glow p-6 group block`}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--gradient-subtle)' }}>
                  {card.icon}
                </div>
                <h3 className="text-[0.9375rem] font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>{card.desc}</p>
                <span className="text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: 'var(--accent-3)' }}>
                  {card.linkText}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-5 relative">
        <div className="max-w-3xl mx-auto relative">
          {/* Gradient border card */}
          <div className="rounded-2xl p-[1px]" style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2), transparent)' }}>
            <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--bg-secondary)' }}>
              <span className="badge badge-accent mb-5 inline-flex">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--accent-1)' }} />
                Voor bedrijven
              </span>
              <h3 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Bent u een <span className="gradient-text">bedrijf</span>?
              </h3>
              <p className="text-base lg:text-lg mb-8 leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Vraag gratis een project aan en laat onze Nova College studenten een oplossing bouwen voor uw uitdaging.
              </p>
              <a href="/aanvraag" className="btn-primary text-[0.9375rem] py-3 px-7">
                Project aanvragen
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
