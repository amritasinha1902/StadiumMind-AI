import { ClipboardList, TrendingUp, FileText, Globe, BarChart3, Bell, Download } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge    from '@/components/ui/Badge';
import Button   from '@/components/ui/Button';
import StatCard from '@/components/shared/StatCard';

const reports = [
  { id: 1, title: 'Match Day Operations Report', generated: '2h ago',  status: 'ready',      type: 'Operations' },
  { id: 2, title: 'Security Incident Summary',   generated: '4h ago',  status: 'ready',      type: 'Security'   },
  { id: 3, title: 'Fan Satisfaction Analysis',   generated: '1d ago',  status: 'ready',      type: 'Analytics'  },
  { id: 4, title: 'Volunteer Performance Review', generated: '1d ago', status: 'generating', type: 'HR'         },
];

const typeVariant = { Operations: 'primary', Security: 'danger', Analytics: 'accent', HR: 'success' };

const kpis = [
  { label: 'Overall Event Satisfaction', value: 92 },
  { label: 'Operational Efficiency',     value: 87 },
  { label: 'AI Adoption Rate',           value: 78 },
  { label: 'Incident Resolution Rate',   value: 96 },
];

export default function OrganizersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizer Dashboard"
        subtitle="Comprehensive event oversight and AI-powered analytics"
        icon={ClipboardList}
        actions={<Button size="sm" variant="secondary" leftIcon={<Download size={14} />}>Export Report</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Matches"          value="64"    icon={Globe}     />
        <StatCard title="Active Venues"          value="26"    icon={BarChart3} />
        <StatCard title="AI Insights Generated"  value="1,247" change={23} icon={TrendingUp} />
        <StatCard title="Open Action Items"      value="18"    change={-12} icon={Bell}       />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI-Generated Reports</CardTitle>
              <Button size="sm" variant="primary">Generate New</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl bg-nexus-surface2 border border-nexus-border/50">
                  <div className="w-8 h-8 rounded-lg bg-nexus-primary/20 flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-nexus-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-nexus-text truncate">{r.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={typeVariant[r.type]} size="sm">{r.type}</Badge>
                      <span className="text-xs text-nexus-muted">{r.generated}</span>
                    </div>
                  </div>
                  <Badge variant={r.status === 'ready' ? 'success' : 'warning'} size="sm" dot>
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Key Performance Indicators</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.map((kpi) => (
                <div key={kpi.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-nexus-muted">{kpi.label}</span>
                    <span className="font-semibold text-nexus-text">{kpi.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-nexus-surface2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-nexus-primary to-nexus-primary-light rounded-full transition-all duration-700"
                      style={{ width: `${kpi.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
