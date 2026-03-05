import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/authcontext';

export const metadata: Metadata = {
  title: 'Studenten Portfolio',
  description: 'Portfolio platform voor studenten en bedrijven',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}