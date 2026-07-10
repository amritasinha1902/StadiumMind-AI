import { NavLink, Link } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Users,
  Shield,
  HandHelping,
  Building2,
  ClipboardList,
  Bot,
  Trophy,
  ChevronLeft,
  Accessibility,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Badge from '@/components/ui/Badge';

const navItems = [
  { label: 'Dashboard',       to: '/dashboard',     icon: LayoutDashboard },
  { label: 'Fan Experience',  to: '/fans',          icon: Users },
  { label: 'Security Ops',    to: '/security',      icon: Shield,        badge: { text: '3', variant: 'danger'  } },
  { label: 'Volunteers',      to: '/volunteers',    icon: HandHelping },
  { label: 'Venue Ops',       to: '/venue',         icon: Building2 },
  { label: 'Organizers',      to: '/organizers',    icon: ClipboardList },
  { label: 'AI Assistant',    to: '/ai-assistant',  icon: Bot,           badge: { text: 'AI', variant: 'primary' } },
  { label: 'Accessibility',   to: '/accessibility', icon: Accessibility },
  { label: 'Fan Copilot',     to: '/fan-copilot',   icon: MessageSquare, badge: { text: 'New', variant: 'accent' } },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useApp();

  return (
    <>
      {/* Mobile dimmed overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-nexus-bg/70 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 z-30 h-full flex flex-col',
          'bg-nexus-surface border-r border-nexus-border',
          'transition-all duration-300 ease-in-out overflow-hidden',
          sidebarOpen ? 'w-64' : 'w-0 lg:w-16'
        )}
      >
        {/* Branding */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-nexus-border flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center flex-shrink-0 shadow-nexus">
              <Trophy size={16} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0 overflow-hidden">
                <p className="text-sm font-display font-bold text-nexus-text leading-none truncate">
                  FIFA Nexus AI
                </p>
                <p className="text-[9px] text-nexus-accent font-semibold uppercase tracking-widest mt-0.5">
                  World Cup 2026
                </p>
              </div>
            )}
          </Link>

          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-1.5 rounded-lg text-nexus-muted hover:text-nexus-text hover:bg-nexus-surface2 transition-colors flex-shrink-0"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2" aria-label="Main navigation">
          {sidebarOpen && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-nexus-muted px-3 mb-3">
              Navigation
            </p>
          )}

          <ul className="space-y-0.5" role="list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-nexus-primary/20 text-nexus-primary-light border border-nexus-primary/30'
                        : 'text-nexus-muted hover:text-nexus-text hover:bg-nexus-surface2 border border-transparent'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={18}
                        className={clsx(
                          'flex-shrink-0 transition-colors',
                          isActive ? 'text-nexus-primary-light' : 'text-nexus-muted group-hover:text-nexus-text'
                        )}
                      />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <Badge variant={item.badge.variant} size="sm">
                              {item.badge.text}
                            </Badge>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Status footer */}
        {sidebarOpen && (
          <div className="p-3 border-t border-nexus-border flex-shrink-0">
            <div className="nexus-card p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-nexus-success animate-pulse" />
                <p className="text-xs font-semibold text-nexus-success">All Systems Operational</p>
              </div>
              <p className="text-[10px] text-nexus-muted leading-snug">
                FIFA World Cup 2026 · Powered by Gemini
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
