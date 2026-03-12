'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/lib/auth';
import { useState } from 'react';

export default function Navbar() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push('/');
    setMobileOpen(false);
  }

  const authReady = !loading;

  const navLinks = [
    { href: '/portfolio', label: 'Portfolio', show: true },
    { href: '/aanvraag', label: 'Project aanvragen', show: true },
    { href: '/dashboard', label: 'Dashboard', show: authReady && !!user },
    { href: '/opdrachten', label: 'Opdrachten', show: authReady && !!user && (role === 'student' || role === 'admin') },
    { href: '/admin', label: 'Admin', show: authReady && role === 'admin' },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-5 h-[3.75rem] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <span className="text-white text-xs font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>SP</span>
          </div>
          <span className="font-semibold text-[0.9375rem] tracking-tight" style={{ color: 'var(--text-primary)' }}>
            StudentPortfolio
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.filter(l => l.show).map(link => (
            <NavLink key={link.href} href={link.href} current={pathname}>
              {link.label}
            </NavLink>
          ))}

          {authReady && (
            <div className="ml-2 pl-2 border-l" style={{ borderColor: 'var(--border)' }}>
              {user ? (
                <button onClick={handleLogout} className="btn-ghost text-[0.8125rem]">
                  Uitloggen
                </button>
              ) : (
                <Link href="/login" className="btn-primary text-[0.8125rem] py-2 px-3.5">
                  Inloggen
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-[5px] p-2"
          aria-label="Menu"
        >
          <span
            className="block w-5 h-[1.5px] rounded-full transition-transform duration-200"
            style={{
              background: 'var(--text-primary)',
              transform: mobileOpen ? 'rotate(45deg) translate(2px, 2px)' : 'none',
            }}
          />
          <span
            className="block w-5 h-[1.5px] rounded-full transition-opacity duration-200"
            style={{
              background: 'var(--text-primary)',
              opacity: mobileOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-[1.5px] rounded-full transition-transform duration-200"
            style={{
              background: 'var(--text-primary)',
              transform: mobileOpen ? 'rotate(-45deg) translate(3px, -3px)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden animate-slide-down border-t px-5 py-4 space-y-1" style={{ borderColor: 'var(--border)', background: 'var(--bg-white)' }}>
          {navLinks.filter(l => l.show).map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: pathname === link.href ? 'var(--accent)' : 'var(--text-secondary)',
                background: pathname === link.href ? 'var(--accent-subtle)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}

          {authReady && (
            <div className="pt-2 mt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Uitloggen
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full text-center text-sm mt-1"
                >
                  Inloggen
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  current,
  children,
}: {
  href: string;
  current: string;
  children: React.ReactNode;
}) {
  const isActive = current === href;
  return (
    <Link
      href={href}
      className="text-[0.8125rem] font-medium px-3 py-1.5 rounded-lg transition-colors"
      style={{
        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
        background: isActive ? 'var(--accent-subtle)' : 'transparent',
      }}
    >
      {children}
    </Link>
  );
}
