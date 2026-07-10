import { Building2, Thermometer, Wifi, Zap, Droplets, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge    from '@/components/ui/Badge';
import Button   from '@/components/ui/Button';
import StatCard from '@/components/shared/StatCard';

const systems = [
  { name: 'HVAC System',           status: 'operational', value: '22°C',   icon: Thermometer, metric: 'Temperature' },
  { name: 'Network Infrastructure', status: 'operational', value: '99.9%',  icon: Wifi,        metric: 'Uptime'      },
  { name: 'Power Systems',          status: 'warning',     value: '87%',    icon: Zap,         metric: 'Load'        },
  { name: 'Water Supply',           status: 'operational', value: 'Normal', icon: Droplets,    metric: 'Flow Rate'   },
];

const statusConfig = {
  operational: { badge: 'success', icon: CheckCircle, label: 'Operational' },
  warning:     { badge: 'warning', icon: AlertCircle,  label: 'Warning'     },
  critical:    { badge: 'danger',  icon: AlertCircle,  label: 'Critical'    },
};

const facilities = [
  { label: 'Restroom Facilities',  health: 95 },
  { label: 'Concession Areas',     health: 88 },
  { label: 'Emergency Exits',      health: 100 },
  { label: 'Broadcast Equipment',  health: 97 },
  { label: 'Pitch Conditions',     health: 92 },
];

const healthColor = (h) => h >= 95 ? 'bg-nexus-success' : h >= 85 ? 'bg-nexus-warning' : 'bg-nexus-danger';

export default function VenuePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Venue Operations"
        subtitle="Real-time facility management and operational monitoring"
        icon={Building2}
        actions={<Button size="sm" variant="secondary" leftIcon={<Settings size={14} />}>Configure</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="System Uptime"     value="99.98%" change={0.02}                   icon={Zap}        />
        <StatCard title="Open Issues"       value="2"      change={-60} changeLabel="vs avg" icon={AlertCircle} />
        <StatCard title="Capacity Used"     value="91%"    change={8}                         icon={Building2}   />
        <StatCard title="Maintenance Tasks" value="5"                                         icon={Settings}    />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systems.map((sys) => {
          const cfg = statusConfig[sys.status];
          return (
            <Card key={sys.name} hover>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-nexus-surface2 border border-nexus-border flex items-center justify-center">
                    <sys.icon size={18} className="text-nexus-muted" />
                  </div>
                  <div>
                    <p className="font-semibold text-nexus-text">{sys.name}</p>
                    <p className="text-xs text-nexus-muted">{sys.metric}</p>
                  </div>
                </div>
                <Badge variant={cfg.badge} dot>{cfg.label}</Badge>
              </div>
              <div className="mt-4 pt-4 border-t border-nexus-border">
                <p className="text-2xl font-display font-bold text-nexus-text">{sys.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Facility Health Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facilities.map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-nexus-muted">{f.label}</span>
                  <span className="font-semibold text-nexus-text">{f.health}%</span>
                </div>
                <div className="h-2 rounded-full bg-nexus-surface2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${healthColor(f.health)}`}
                    style={{ width: `${f.health}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
