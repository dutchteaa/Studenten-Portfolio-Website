'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, role } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0f1419] border-b border-[#2a3540]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#117e7d] rounded-lg flex items-center justify-center font-mono font-bold text-white text-sm">
            SP
          </div>
          <span className="font-semibold text-[#e8ecf0]">
            Studenten<span className="text-[#1a9e9d]">Portfolio</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/portfolio" className="text-[#8b99a8] hover:text-[#e8ecf0] hover:bg-[#1a2027] px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Portfolio
          </Link>
          <Link href="/aanvraag" className="text-[#8b99a8] hover:text-[#e8ecf0] hover:bg-[#1a2027] px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Aanvragen
          </Link>

          {user ? (
            <>
              <Link
                href={role === 'admin' ? '/admin' : '/dashboard'}
                className="text-[#8b99a8] hover:text-[#e8ecf0] hover:bg-[#1a2027] px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 bg-[#1a2027] text-[#e8ecf0] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a3540] transition-all border border-[#2a3540]"
              >
                Uitloggen
              </button>
            </>
          ) : (
            <Link href="/login" className="ml-2 bg-[#117e7d] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a9e9d] transition-all">
              Inloggen
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}