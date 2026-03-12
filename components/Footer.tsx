import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface-dark)' }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="py-10 flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <span className="text-white text-xs font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>SP</span>
              </div>
              <span className="font-semibold text-sm" style={{ color: 'var(--text-on-dark)' }}>
                StudentPortfolio
              </span>
            </div>
            <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--text-on-dark-muted)' }}>
              Een platform van Nova College studenten voor het delen van projecten en samenwerken met bedrijven.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-on-dark-muted)' }}>
                Platform
              </p>
              <div className="space-y-2">
                <Link href="/portfolio" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--text-on-dark-muted)' }}>
                  Portfolio
                </Link>
                <Link href="/aanvraag" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--text-on-dark-muted)' }}>
                  Project aanvragen
                </Link>
                <Link href="/opdrachten" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--text-on-dark-muted)' }}>
                  Opdrachten
                </Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-on-dark-muted)' }}>
                Account
              </p>
              <div className="space-y-2">
                <Link href="/login" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--text-on-dark-muted)' }}>
                  Inloggen
                </Link>
                <Link href="/register" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--text-on-dark-muted)' }}>
                  Registreren
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs border-t"
          style={{ borderColor: 'var(--surface-dark-border)', color: 'var(--text-on-dark-muted)' }}
        >
          <span>&copy; {new Date().getFullYear()} Nova College &middot; Smart ICT</span>
          <span>Gebouwd door studenten</span>
        </div>
      </div>
    </footer>
  );
}
