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
    { href: '/aanvraag', label: 'Aanvragen', show: true },
    { href: '/dashboard', label: 'Dashboard', show: authReady && !!user },
    { href: '/opdrachten', label: 'Opdrachten', show: authReady && !!user && (role === 'student' || role === 'admin') },
    { href: '/admin', label: 'Admin', show: authReady && role === 'admin' },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient)' }}>
            <span className="text-white text-xs font-bold tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>SP</span>
          </div>
          <span className="font-semibold text-sm tracking-tight gradient-text">
            StudentPortfolio
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.filter(l => l.show).map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.8125rem] font-medium px-3 py-1.5 rounded-lg transition-all"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {authReady && (
            <div className="ml-3 pl-3" style={{ borderLeft: '1px solid var(--border)' }}>
              {user ? (
                <button onClick={handleLogout} className="btn-ghost text-[0.8125rem]">
                  Uitloggen
                </button>
              ) : (
                <Link href="/login" className="btn-primary text-[0.8125rem] py-1.5 px-4">
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
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="block w-5 h-[1.5px] rounded-full transition-all duration-200"
              style={{
                background: 'var(--text-secondary)',
                ...(mobileOpen && i === 0 ? { transform: 'rotate(45deg) translate(2px, 2px)' } : {}),
                ...(mobileOpen && i === 1 ? { opacity: 0 } : {}),
                ...(mobileOpen && i === 2 ? { transform: 'rotate(-45deg) translate(3px, -3px)' } : {}),
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden animate-slide-down px-5 py-4 space-y-1" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
          {navLinks.filter(l => l.show).map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: pathname === link.href ? 'var(--text-primary)' : 'var(--text-muted)',
                background: pathname === link.href ? 'rgba(255,255,255,0.06)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
          {authReady && (
            <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
              {user ? (
                <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  Uitloggen
                </button>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center text-sm mt-1">
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
