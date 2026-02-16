import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="flex items-center justify-between px-8 h-16 bg-slate-900 text-white">
        <Link to="/" className="text-xl font-bold text-white hover:no-underline">
          Sweatworks Fitness
        </Link>
        <nav className="flex gap-6">
          <Link to="/members" className="text-white/80 hover:text-white font-medium">
            Members
          </Link>
        </nav>
      </header>
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
}
