import { Outlet, Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nexus-primary/20 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-nexus-accent/10  rounded-full filter blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-nexus-lg">
              <Trophy size={28} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-nexus-text leading-none">StadiumMind AI</p>
              <p className="text-xs text-nexus-accent font-semibold uppercase tracking-widest mt-1">
                World Cup 2026
              </p>
            </div>
          </Link>
        </div>

        {/* Auth card */}
        <div className="nexus-card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
