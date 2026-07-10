import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import Sidebar from '@/components/layout/Sidebar';
import Navbar  from '@/components/layout/Navbar';
import Footer  from '@/components/layout/Footer';
import AIAssistantButton from '@/components/shared/AIAssistantButton';
import { useApp } from '@/contexts/AppContext';

export default function DashboardLayout() {
  const { sidebarOpen } = useApp();

  return (
    <div className="min-h-screen bg-nexus-bg flex">
      <Sidebar />

      {/* Main content area – shifts right on desktop when sidebar is open */}
      <div
        className={clsx(
          'flex-1 flex flex-col min-h-screen min-w-0',
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        <Navbar />

        <main className="flex-1 overflow-auto p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>

        <Footer />
      </div>

      {/* Floating AI assistant shortcut (hidden on AI page itself) */}
      <AIAssistantButton />
    </div>
  );
}
