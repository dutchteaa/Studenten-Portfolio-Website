import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="py-12 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient)' }}>
                <span className="text-white text-xs font-bold" style={{ fontFamily: 'var(--font-mono)' }}>SP</span>
              </div>
              <span className="font-semibold text-sm gradient-text">StudentPortfolio</span>
            </div>
            <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Een platform van Nova College studenten voor het delen van projecten en samenwerken met bedrijven.
            </p>
          </div>

          <div className="flex gap-14">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Platform</p>
              <div className="space-y-2.5">
                {[
                  { href: '/portfolio', label: 'Portfolio' },
                  { href: '/aanvraag', label: 'Project aanvragen' },
                  { href: '/opdrachten', label: 'Opdrachten' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="block text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <span>&copy; {new Date().getFullYear()} Nova College &middot; Smart ICT</span>
          <span style={{ color: 'var(--text-muted)' }}>Gebouwd door studenten</span>
        </div>
      </div>
    </footer>
  );
}
