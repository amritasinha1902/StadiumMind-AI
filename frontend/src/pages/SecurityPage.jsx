import { Shield, AlertCircle, Camera, Users, MapPin } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge    from '@/components/ui/Badge';
import Button   from '@/components/ui/Button';
import StatCard from '@/components/shared/StatCard';

const incidents = [
  { id: 'INC-001', type: 'Crowd Surge',  zone: 'North Gate',  severity: 'high',   status: 'active',     time: '5m ago'  },
  { id: 'INC-002', type: 'Medical Event', zone: 'Section 22',  severity: 'medium', status: 'responding', time: '12m ago' },
  { id: 'INC-003', type: 'Lost Item',    zone: 'Fan Zone',    severity: 'low',    status: 'resolved',   time: '28m ago' },
];

const severityVariant = { high: 'danger', medium: 'warning', low: 'success' };
const statusVariant   = { active: 'danger', responding: 'warning', resolved: 'success' };

const zones = ['North Gate','South Gate','East Gate','West Gate','Fan Zone','VIP Area','Media Zone','Parking A','Parking B'];
const zoneStatus = (z) => z === 'North Gate' ? 'danger' : z === 'East Gate' ? 'warning' : 'success';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Operations"
        subtitle="Real-time incident management and crowd monitoring"
        icon={Shield}
        actions={
          <Button size="sm" variant="danger" leftIcon={<AlertCircle size={14} />}>
            Report Incident
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Active Incidents"  value="3"    change={-25} changeLabel="vs avg" icon={AlertCircle} />
        <StatCard title="Officers On Duty"  value="248"  change={0}                         icon={Shield}      />
        <StatCard title="CCTV Feeds Active" value="312"                                      icon={Camera}      />
        <StatCard title="Crowd Capacity"    value="87%"  change={-5}  changeLabel="density"  icon={Users}       />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Incidents</CardTitle>
              <Badge variant="danger" dot>3 Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-4 rounded-xl bg-nexus-surface2 border border-nexus-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={severityVariant[inc.severity]} size="sm">{inc.severity.toUpperCase()}</Badge>
                      <span className="text-xs text-nexus-muted font-mono">{inc.id}</span>
                    </div>
                    <Badge variant={statusVariant[inc.status]} size="sm" dot>{inc.status}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-nexus-text">{inc.type}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={11} className="text-nexus-muted flex-shrink-0" />
                    <span className="text-xs text-nexus-muted">{inc.zone}</span>
                    <span className="text-nexus-border mx-1">·</span>
                    <span className="text-xs text-nexus-muted">{inc.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Zone Status Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {zones.map((zone) => {
                const s = zoneStatus(zone);
                return (
                  <div key={zone} className="p-3 rounded-lg bg-nexus-surface2 text-center">
                    <div className={`w-2 h-2 rounded-full mx-auto mb-1.5 ${s === 'danger' ? 'bg-nexus-danger animate-pulse' : s === 'warning' ? 'bg-nexus-warning animate-pulse' : 'bg-nexus-success'}`} />
                    <p className="text-[10px] text-nexus-muted leading-tight">{zone}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
