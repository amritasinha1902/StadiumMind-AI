import { Link } from 'react-router-dom';
import { Search, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp }   from '@/contexts/AppContext';
import Avatar from '@/components/ui/Avatar';
import NotificationBell from '@/components/shared/NotificationBell';

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme();
  const { toggleSidebar, notifications } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 nexus-glass border-b border-nexus-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">

        {/* Left – sidebar toggle + search */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-nexus-muted hover:text-nexus-text hover:bg-nexus-surface2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-primary"
            aria-label="Toggle navigation"
          >
            <Menu size={20} />
          </button>

          <div className="hidden md:flex items-center relative">
            <Search size={15} className="absolute left-3 text-nexus-muted pointer-events-none" />
            <input
              type="search"
              placeholder="Search stadium, match, zone…"
              className="nexus-input pl-9 py-2 text-sm w-60 focus:ring-2 focus:ring-nexus-primary"
            />
          </div>
        </div>

        {/* Right – actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-nexus-muted hover:text-nexus-text hover:bg-nexus-surface2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-primary"
            aria-label="Toggle colour theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <NotificationBell count={unreadCount} />

          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-nexus-border">
            <Avatar name="Stadium Admin" size="sm" status="online" />
            <div className="hidden sm:block leading-none">
              <p className="text-sm font-semibold text-nexus-text">Admin</p>
              <p className="text-[11px] text-nexus-muted mt-0.5">Stadium Operator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
