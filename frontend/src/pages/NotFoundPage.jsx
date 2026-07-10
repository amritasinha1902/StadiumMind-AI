import { Link } from 'react-router-dom';
import { Trophy, Home, LayoutDashboard } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-nexus-primary/10 rounded-full filter blur-[120px]" />
      </div>

      <div className="relative text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-primary-gradient flex items-center justify-center mx-auto mb-6 shadow-nexus-lg">
          <Trophy size={36} className="text-white" />
        </div>

        <p className="text-8xl font-display font-black text-nexus-text mb-2 leading-none">404</p>
        <h1 className="text-2xl font-display font-bold text-nexus-text mb-3">Page Not Found</h1>
        <p className="text-nexus-muted mb-8 leading-relaxed">
          This page doesn&apos;t exist in our stadium. Let&apos;s get you back to the action.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button leftIcon={<Home size={16} />}>Back to Home</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" leftIcon={<LayoutDashboard size={16} />}>Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
