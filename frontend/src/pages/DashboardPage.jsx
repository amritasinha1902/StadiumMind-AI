import { Trophy, Users, AlertCircle, Zap, Activity, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import StatCard   from '@/components/shared/StatCard';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const stats = [
  { title: 'Active Fans',       value: '78,432', change: 12,  changeLabel: 'vs yesterday', icon: Users        },
  { title: 'Open Incidents',    value: '3',      change: -25, changeLabel: 'vs avg',        icon: AlertCircle  },
  { title: 'Volunteers On Duty',value: '1,204',  change: 5,   changeLabel: 'vs planned',    icon: Zap          },
  { title: 'System Uptime',     value: '99.98%', icon: Activity },
];

const feed = [
  { type: 'success', message: 'Gate B crowd flow normalised',         time: '2m ago',  zone: 'Gate B'     },
  { type: 'warning', message: 'Medical team dispatched to Section 14', time: '8m ago',  zone: 'Section 14' },
  { type: 'success', message: 'Volunteer check-in complete: Sector 3', time: '15m ago', zone: 'Sector 3'   },
  { type: 'danger',  message: 'Crowd density alert: North Stand',      time: '22m ago', zone: 'North Stand' },
  { type: 'success', message: 'Match broadcast systems verified',       time: '35m ago', zone: 'Broadcast'  },
];

const feedIcon = {
  success: <CheckCircle size={15} className="text-nexus-success mt-0.5 flex-shrink-0" />,
  warning: <AlertCircle size={15} className="text-nexus-warning mt-0.5 flex-shrink-0" />,
  danger:  <AlertCircle size={15} className="text-nexus-danger  mt-0.5 flex-shrink-0" />,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mission Control"
        subtitle="FIFA World Cup 2026 · Stadium Operating System"
        icon={Trophy}
        actions={<Badge variant="success" dot>All Systems Operational</Badge>}
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const navigationPaths = {
            'Active Fans': '/fan-experience',
            'Open Incidents': '/security',
            'Volunteers On Duty': '/volunteers',
          };
          const path = navigationPaths[s.title];
          
          if (path) {
            return (
              <div
                key={s.title}
                onClick={() => navigate(path)}
                className="cursor-pointer"
              >
                <StatCard
                  {...s}
                  className="hover:border-nexus-primary/50 hover:shadow-[0_8px_32px_rgba(26,115,232,0.15)] cursor-pointer"
                />
              </div>
            );
          }
          
          return <StatCard key={s.title} {...s} />;
        })}
      </div>

      {/* Activity + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Activity Feed</CardTitle>
                <Badge variant="success" dot size="sm">Real-Time</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {feed.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-nexus-surface2 hover:bg-nexus-border/30 transition-colors"
                  >
                    {feedIcon[item.type]}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-nexus-text font-medium leading-snug">{item.message}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-nexus-muted">{item.time}</span>
                        <Badge variant="default" size="sm">{item.zone}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card
            onClick={() => navigate('/command-center')}
            className="cursor-pointer hover:border-nexus-primary/50 hover:shadow-[0_8px_32px_rgba(26,115,232,0.15)] transition-all duration-300"
          >
            <CardHeader><CardTitle>Live Match</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-2">
                <Badge variant="danger" dot className="mb-4">LIVE</Badge>
                <p className="text-base font-display font-bold text-nexus-text">Brazil vs Argentina</p>
                <p className="text-4xl font-display font-black text-nexus-accent mt-2">2 – 1</p>
                <p className="text-sm text-nexus-muted mt-1">67&apos;</p>
                <p className="text-xs text-nexus-muted mt-2">MetLife Stadium · New Jersey</p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate('/command-center')}
            className="cursor-pointer hover:border-nexus-primary/50 hover:shadow-[0_8px_32px_rgba(26,115,232,0.15)] transition-all duration-300"
          >
            <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: 'Security Alerts',  count: 3,  variant: 'danger'  },
                  { label: 'Pending Tasks',     count: 42, variant: 'warning' },
                  { label: 'AI Queries Today',  count: 1247, variant: 'primary' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-lg bg-nexus-surface2"
                  >
                    <span className="text-sm text-nexus-text">{item.label}</span>
                    <Badge variant={item.variant}>{item.count.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
