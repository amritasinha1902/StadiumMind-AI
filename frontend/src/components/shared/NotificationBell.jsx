import { useState } from 'react';
import { Bell } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '@/contexts/AppContext';

export default function NotificationBell({ count = 0 }) {
  const [open, setOpen] = useState(false);
  const { notifications, markAllRead, clearNotifications } = useApp();

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && count > 0) markAllRead();
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-nexus-muted hover:text-nexus-text hover:bg-nexus-surface2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-primary"
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-nexus-danger text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Click-outside closer */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="absolute right-0 top-full mt-2 w-80 nexus-card shadow-nexus-lg z-50 animate-slide-up overflow-hidden"
            role="menu"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-nexus-border">
              <h3 className="font-semibold text-nexus-text text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-xs text-nexus-muted hover:text-nexus-danger transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nexus-danger rounded"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 flex flex-col items-center text-nexus-muted">
                  <Bell size={24} className="mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={clsx(
                      'px-4 py-3 border-b border-nexus-border/50 last:border-0 transition-colors',
                      !n.read && 'bg-nexus-primary/5'
                    )}
                    role="menuitem"
                  >
                    <p className="text-sm text-nexus-text font-medium">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-nexus-muted mt-0.5 leading-snug">{n.message}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
