import { useState } from 'react';
import { HandHelping, CheckSquare, Calendar, MessageCircle, Award, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { volunteersApi } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge    from '@/components/ui/Badge';
import Button   from '@/components/ui/Button';
import Input    from '@/components/ui/Input';
import Modal    from '@/components/ui/Modal';
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

const taskAiRecommendations = {
  1: 'Deploy 4 additional volunteers to Gate B to assist with high-density crowd flow entering Section 14.',
  2: 'Inspect VIP seating tags and route path lighting before the 17:00 VIP reception.',
  3: 'All tasks completed successfully. Coordinate with the next shift Lead for post-match briefing.',
  4: 'Ensure golf carts are fully charged at Gate E and wheelchair ramps are clear of obstructions.',
};

export default function VolunteersPage() {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [relatedProcedures, setRelatedProcedures] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSuggestionClick = (qText) => {
    setQuestion(qText);
    askAi(qText);
  };

  const askAi = async (qText) => {
    if (!qText.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    setRelatedProcedures([]);
    setEmergencyContacts([]);

    try {
      const response = await volunteersApi.askGuidance({ question: qText });
      setAiResponse(response.answer);
      setRelatedProcedures(response.related_procedures || []);
      setEmergencyContacts(response.emergency_contacts || []);
      setAiLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('AI Guide API unavailable. Using offline simulation.');
      
      // Fallback simulated response
      setTimeout(() => {
        const simResponses = {
          'What are my duties for the next shift?': {
            answer: 'Your next shift is at Gate B from 14:00 to 20:00. Duties include guiding fans through ticketing checkpoints, distributing stadium maps, and helping fans navigate to their respective sections.',
            related_procedures: ['Gate B Crowding Plan', 'Ticketing Troubleshooting Guide'],
            emergency_contacts: ['Gate Supervisor: ext. 5120', 'Mission Control: ext. 5000']
          },
          'How do I handle a medical emergency?': {
            answer: 'If you encounter a medical emergency: 1. Do not move the patient unless they are in immediate danger. 2. Signal/radio the nearest medical responder or call medical dispatch immediately. 3. Clear the area around the patient so medical staff can access them. 4. Guide the medical team directly to the patient.',
            related_procedures: ['Emergency Response Protocol v2', 'First-Aid Coordination Plan'],
            emergency_contacts: ['Medical Dispatch: ext. 5001', 'First Aid Station 104: ext. 5014']
          },
          'Where are the nearest first aid stations?': {
            answer: 'First Aid Stations are situated at major hubs: Level 1 near Section 104, Level 2 near Section 224, and outside the main VIP entrance. Mobile first-aid teams with AEDs are circulating in all zones.',
            related_procedures: ['First Aid Locations Directory', 'AED Deployment Protocol'],
            emergency_contacts: ['Medical Station 104: ext. 5014', 'Stadium First-Aid Coordinator: ext. 5009']
          }
        };

        const result = simResponses[qText] || {
          answer: `Here is some guidance on "${qText}": Please follow standard operating protocols for World Cup volunteers. Check in with your zone leader for specific questions. If there is a safety hazard or queue block, report it immediately to Mission Control.`,
          related_procedures: ['General Volunteer Handbook 2026'],
          emergency_contacts: ['Mission Control: ext. 5000']
        };

        setAiResponse(result.answer);
        setRelatedProcedures(result.related_procedures);
        setEmergencyContacts(result.emergency_contacts);
        setAiLoading(false);
      }, 800);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Hub"
        subtitle="Smart task management and AI guidance for World Cup volunteers"
        icon={HandHelping}
        actions={
          <Button
            size="sm"
            leftIcon={<Calendar size={14} />}
            onClick={() => setIsScheduleModalOpen(true)}
          >
            View Schedule
          </Button>
        }
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
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-4 rounded-xl bg-nexus-surface2 border border-nexus-border/50 cursor-pointer hover:border-nexus-primary/50 hover:scale-[1.01] hover:shadow-nexus-lg transition-all duration-300"
                >
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
                  onClick={() => handleSuggestionClick(q)}
                  className="w-full text-left p-3 rounded-lg bg-nexus-surface2 hover:bg-nexus-border/30 transition-colors text-sm text-nexus-muted hover:text-nexus-text"
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>

            <div className="mb-4">
              <Input
                placeholder="Ask a custom question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') askAi(question);
                }}
              />
            </div>

            <Button
              className="w-full"
              leftIcon={<MessageCircle size={14} />}
              onClick={() => askAi(question)}
              loading={aiLoading}
            >
              Ask AI Guide
            </Button>

            {aiResponse && !aiLoading && (
              <div className="mt-4 p-4 rounded-xl bg-nexus-surface2 border border-nexus-border animate-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-display font-semibold text-nexus-accent uppercase tracking-wider">AI Answer</span>
                  <button 
                    onClick={() => { setAiResponse(null); setQuestion(''); }}
                    className="text-xs text-nexus-muted hover:text-nexus-text"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-sm text-nexus-text leading-relaxed mb-3">{aiResponse}</p>
                
                {relatedProcedures.length > 0 && (
                  <div className="mb-2 pt-2 border-t border-nexus-border/60">
                    <span className="text-xs font-semibold text-nexus-muted block mb-1">Related Procedures:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {relatedProcedures.map((proc, idx) => (
                        <Badge key={idx} variant="default" size="sm">{proc}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {emergencyContacts.length > 0 && (
                  <div className="pt-2 border-t border-nexus-border/60">
                    <span className="text-xs font-semibold text-nexus-muted block mb-1">Emergency Contacts:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {emergencyContacts.map((contact, idx) => (
                        <Badge key={idx} variant="danger" size="sm">{contact}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Today's Volunteer Schedule"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-nexus-muted">
            Overview of shift distributions and active volunteer zones for July 12, 2026.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-nexus-text border-collapse">
              <thead>
                <tr className="border-b border-nexus-border text-nexus-muted font-semibold">
                  <th className="py-2.5 px-3">Time Slot</th>
                  <th className="py-2.5 px-3">Zone / Sector</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-border/40">
                {[
                  { time: '08:00 - 14:00', zone: 'Gates B & C', role: 'Fan Entry Assistance', status: 'Completed', sVariant: 'success' },
                  { time: '12:00 - 18:00', zone: 'VIP Lounge', role: 'Guest Relations', status: 'Active', sVariant: 'primary' },
                  { time: '14:00 - 20:00', zone: 'Main Concourse', role: 'Wayfinding Guides', status: 'Active', sVariant: 'primary' },
                  { time: '18:00 - 00:00', zone: 'Media Sector', role: 'Press Room Coord', status: 'Upcoming', sVariant: 'warning' },
                ].map((shift, idx) => (
                  <tr key={idx} className="hover:bg-nexus-surface2/30 transition-colors">
                    <td className="py-3 px-3 font-medium">{shift.time}</td>
                    <td className="py-3 px-3">{shift.zone}</td>
                    <td className="py-3 px-3">{shift.role}</td>
                    <td className="py-3 px-3">
                      <Badge variant={shift.sVariant} size="sm" dot>{shift.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4 border-t border-nexus-border">
            <Button onClick={() => setIsScheduleModalOpen(false)} variant="secondary">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Task Detail Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Specifications"
        size="md"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-nexus-muted font-semibold uppercase tracking-wider">Task Title</p>
              <p className="text-lg font-display font-bold text-nexus-text mt-1">{selectedTask.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-nexus-muted font-semibold uppercase tracking-wider">Priority</p>
                <div className="mt-1">
                  <Badge variant={priorityVariant[selectedTask.priority]}>{selectedTask.priority}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-nexus-muted font-semibold uppercase tracking-wider">Status</p>
                <div className="mt-1">
                  <Badge variant={statusVariant[selectedTask.status]} dot>{selectedTask.status}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-nexus-muted font-semibold uppercase tracking-wider">Assigned Volunteers</p>
                <p className="text-sm font-semibold text-nexus-text mt-1">{selectedTask.volunteers} Volunteers</p>
              </div>
              <div>
                <p className="text-xs text-nexus-muted font-semibold uppercase tracking-wider">Due Time</p>
                <p className="text-sm font-semibold text-nexus-text mt-1">{selectedTask.dueIn}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-nexus-primary/10 border border-nexus-primary/20">
              <p className="text-xs text-nexus-accent font-semibold uppercase tracking-wider mb-1.5">AI Task Recommendation</p>
              <p className="text-sm text-nexus-text leading-relaxed">
                {taskAiRecommendations[selectedTask.id]}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-nexus-border">
              <Button onClick={() => setSelectedTask(null)} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
