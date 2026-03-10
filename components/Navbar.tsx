'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/lib/auth';

export default function Navbar() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  // Don't flash nav links while auth state is resolving
  const authReady = !loading;

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'var(--bg-white)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse-dot"
            style={{ background: 'var(--accent)' }}
          />
          <span
            className="font-bold text-lg tracking-tight"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}
          >
            SP<span style={{ color: 'var(--text-dark)' }}>.dev</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">

          {/* Always visible */}
          <NavLink href="/portfolio" current={pathname}>
            Portfolio
          </NavLink>
          <NavLink href="/aanvraag" current={pathname}>
            Project aanvragen
          </NavLink>

          {/* Auth-dependent */}
          {authReady && (
            <>
              {user ? (
                <>
                  {/* Dashboard — always shown when logged in */}
                  <NavLink href="/dashboard" current={pathname}>
                    Dashboard
                  </NavLink>

                  {/* Opdrachten — for students and admins */}
                  {(role === 'student' || role === 'admin') && (
                    <NavLink href="/opdrachten" current={pathname}>
                      Opdrachten
                    </NavLink>
                  )}

                  {/* Admin Dashboard — only for admins */}
                  {role === 'admin' && (
                    <NavLink href="/admin" current={pathname}>
                      Admin
                    </NavLink>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="ml-2 text-sm font-medium px-4 py-2 rounded-lg transition-all"
                    style={{
                      background: 'var(--bg)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Uitloggen
                  </button>
                </>
              ) : (
                /* Login button */
                <Link
                  href="/login"
                  className="btn-accent text-sm ml-2"
                >
                  Inloggen
                </Link>
              )}
            </>
          )}
        </div>
      </div>
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
      className="text-sm font-medium px-3 py-2 rounded-lg transition-all"
      style={{
        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
        background: isActive ? 'var(--accent-glow)' : 'transparent',
      }}
    >
      {children}
    </Link>
  );
}
