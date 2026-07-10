import { HandHelping, CheckSquare, Calendar, MessageCircle, Award, Clock } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge    from '@/components/ui/Badge';
import Button   from '@/components/ui/Button';
import StatCard from '@/components/shared/StatCard';

const tasks = [
  { id: 1, title: 'Gate B Fan Assistance',      priority: 'high',   status: 'in-progress', volunteers: 8,  dueIn: '30m'    },
  { id: 2, title: 'VIP Area Setup Inspection',  priority: 'medium', status: 'pending',     volunteers: 3,  dueIn: '1h'     },
  { id: 3, title: 'Media Zone Coordination',    priority: 'medium', status: 'completed',   volunteers: 5,  dueIn: 'Done'   },
  { id: 4, title: 'Accessibility Services',     priority: 'high',   status: 'in-progress', volunteers: 12, dueIn: 'Ongoing' },
];

const statusVariant   = { 'in-progress': 'primary', pending: 'warning', completed: 'success' };
const priorityVariant = { high: 'danger', medium: 'warning', low: 'success' };

const suggestions = [
  'What are my duties for the next shift?',
  'How do I handle a medical emergency?',
  'Where are the nearest first aid stations?',
];

export default function VolunteersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Hub"
        subtitle="Smart task management and AI guidance for World Cup volunteers"
        icon={HandHelping}
        actions={<Button size="sm" leftIcon={<Calendar size={14} />}>View Schedule</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="On Duty Now"        value="1,204" change={5}  changeLabel="vs scheduled" icon={HandHelping} />
        <StatCard title="Active Tasks"        value="47"    change={12}                              icon={CheckSquare} />
        <StatCard title="Avg. Shift Length"   value="6.5h"                                           icon={Clock}       />
        <StatCard title="Volunteer Satisfaction" value="96%" change={3}                             icon={Award}       />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Tasks</CardTitle>
              <Button size="sm" variant="secondary">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 rounded-xl bg-nexus-surface2 border border-nexus-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={priorityVariant[task.priority]} size="sm">{task.priority}</Badge>
                    <Badge variant={statusVariant[task.status]}   size="sm" dot>{task.status}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-nexus-text">{task.title}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-nexus-muted">
                    <span>{task.volunteers} volunteers</span>
                    <span>·</span>
                    <span>Due: {task.dueIn}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>AI Volunteer Guide</CardTitle></CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-nexus-primary/10 border border-nexus-primary/20 mb-4">
              <p className="text-sm text-nexus-text font-medium mb-1">Gemini-Powered Assistance</p>
              <p className="text-xs text-nexus-muted leading-snug">
                Ask the AI assistant any question about duties, protocols, or stadium procedures.
              </p>
            </div>
            <div className="space-y-2 mb-4">
              {suggestions.map((q) => (
                <button
                  key={q}
                  className="w-full text-left p-3 rounded-lg bg-nexus-surface2 hover:bg-nexus-border/30 transition-colors text-sm text-nexus-muted hover:text-nexus-text"
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
            <Button className="w-full" leftIcon={<MessageCircle size={14} />}>
              Ask AI Guide
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
