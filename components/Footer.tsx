import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0f1419] border-t border-[#2a3540]">
      <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <p className="text-[#8b99a8] text-sm font-mono">
          © 2025 <span className="text-[#1a9e9d]">StudentenPortfolio</span> — Smart ICT Nova College
        </p>
        <div className="flex gap-6">
          <Link href="/portfolio" className="text-[#8b99a8] text-sm hover:text-[#1a9e9d] transition-colors">Portfolio</Link>
          <Link href="/aanvraag" className="text-[#8b99a8] text-sm hover:text-[#1a9e9d] transition-colors">Aanvragen</Link>
          <Link href="/login" className="text-[#8b99a8] text-sm hover:text-[#1a9e9d] transition-colors">Inloggen</Link>
        </div>
      </div>
    </footer>
  );
}