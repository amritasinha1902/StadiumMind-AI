import { useState, useEffect } from 'react';
import {
  Shield, ShieldAlert, Users, Heart, Clock, AlertTriangle, Sparkles, HelpCircle,
  TrendingUp, Activity, Clipboard, RefreshCw, BarChart2, Radio, CheckCircle,
  FileText, Download, UserCheck, Flame, Compass, HelpCircle as HelpIcon
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { commandCenterApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function CommandCenterPage() {
  const [role, setRole] = useState('organizer'); // organizer | security | medical | volunteer | transport | sustainability
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // AI report generation states
  const [reportType, setReportType] = useState('daily_summary');
  const [reportResult, setReportResult] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  // Active incidents list local state
  const [incidents, setIncidents] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);

  const fetchStatus = async (userRole = role, quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await commandCenterApi.getStatus(userRole);
      setStatus(res);
      setIncidents(res.incidents);
    } catch (err) {
      toast.error("Failed to load Command Center operations state.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(role);

    // Auto-update stats every 6 seconds to simulate a live command deck
    const timer = setInterval(() => {
      fetchStatus(role, true);
    }, 6000);

    return () => clearInterval(timer);
  }, [role]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    toast.success(`Switched Command Center view: ${newRole.toUpperCase()}`);
  };

  const handleResolveIncident = async (incidentId) => {
    setResolvingId(incidentId);
    try {
      await commandCenterApi.resolveIncident(incidentId);
      toast.success(`Incident ${incidentId} marked as RESOLVED.`);
      fetchStatus(role, true);
    } catch (err) {
      toast.error("Failed to resolve incident.");
    } finally {
      setResolvingId(null);
    }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportResult('');
    try {
      const res = await commandCenterApi.generateReport(reportType);
      setReportResult(res.report_md);
      toast.success("AI Operations Report generated!");
    } catch (err) {
      toast.error("Failed to generate report.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Operations Command Center"
        subtitle="Real-time predictive dashboard for FIFA World Cup 2026 stadium managers"
        icon={Shield}
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-nexus-muted">Current Role Dashboard:</span>
            <select
              value={role}
              onChange={handleRoleChange}
              className="bg-nexus-surface border border-nexus-border text-xs rounded-xl p-2.5 text-nexus-text font-bold"
            >
              <option value="organizer">Organizer (General)</option>
              <option value="security">Security Ops</option>
              <option value="medical">Medical Triage</option>
              <option value="volunteer">Volunteer Coordinator</option>
              <option value="transport">Transit Manager</option>
              <option value="sustainability">Sustainability Analyst</option>
            </select>
          </div>
        }
      />

      {/* ── 1. Live KPI metrics panel ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Attendance', val: '64,820', sub: 'Capacity: 82,500 (78%)', color: 'primary' },
          { label: 'Avg Emergency Response', val: '4.2 min', sub: 'Target: < 6.0 min', color: 'danger' },
          { label: 'Volunteer Availability', val: '92%', sub: '24 Available / 4 on break', color: 'accent' },
          { label: 'Sustainability Score', val: '86%', sub: 'Energy compliance: Optimal', color: 'success' }
        ].map((kpi, idx) => (
          <Card key={idx} className="relative overflow-hidden border-l-4 border-l-nexus-primary">
            <CardContent className="p-5 flex flex-col justify-between">
              <span className="text-xs font-semibold text-nexus-muted mb-1 block uppercase tracking-wider">{kpi.label}</span>
              <span className="text-3xl font-extrabold text-nexus-text mb-2 block">{kpi.val}</span>
              <span className="text-[11px] text-nexus-muted font-medium">{kpi.sub}</span>
              <span className="absolute right-4 bottom-4 text-nexus-border text-5xl opacity-15">⚽</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 2. Summary & Risk Analysis row ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* AI Executive Summary Card */}
        <Card className="xl:col-span-2">
          <CardHeader className="border-b border-nexus-border pb-3 flex flex-row items-center gap-2">
            <Sparkles size={16} className="text-nexus-accent" />
            <CardTitle>AI Operations Executive Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {loading ? (
              <div className="py-8 text-center text-xs text-nexus-muted">Loading executive analytics...</div>
            ) : status ? (
              <div className="space-y-4">
                <p className="text-sm text-nexus-text leading-relaxed bg-nexus-surface/40 p-4 rounded-xl border border-nexus-border/60">
                  {status.exec_summary}
                </p>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nexus-muted mb-2">Live AI Alerts Feed</h4>
                  <div className="space-y-2">
                    {status.alerts_feed.map((al, idx) => (
                      <div key={idx} className="flex gap-2 p-3 rounded-lg bg-nexus-danger/10 border border-nexus-danger/20 text-xs text-nexus-text leading-snug">
                        <AlertTriangle size={14} className="text-nexus-danger flex-shrink-0" />
                        {al}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Live Risk Analysis Card */}
        <Card>
          <CardHeader className="border-b border-nexus-border pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-nexus-danger" />
              <CardTitle>AI Risk Assessment Matrix</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {status ? (
              status.risks.map((risk, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-nexus-surface2 border border-nexus-border/60 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-nexus-text capitalize">{risk.name} Risk</span>
                    <Badge variant={risk.level === 'high' || risk.level === 'critical' ? 'danger' : 'default'} size="sm">
                      {risk.level}
                    </Badge>
                  </div>
                  <p className="text-nexus-muted leading-relaxed">{risk.prediction}</p>
                  <p className="text-[10px] text-nexus-accent italic">Action: {risk.action}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-nexus-muted text-xs">No active risk assessments loaded.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Role-based Conditional Dashboards ─────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Double Card: Role Panel and Operations grids */}
        <Card className="xl:col-span-2">
          <CardHeader className="border-b border-nexus-border pb-3 flex flex-row items-center gap-2">
            <Radio className="text-nexus-primary-light animate-pulse" size={16} />
            <CardTitle className="capitalize">{role} Dashboard Panel</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* SECURITY DASHBOARD */}
            {role === 'security' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-nexus-surface border border-nexus-border rounded-xl space-y-2 text-xs text-nexus-muted">
                    <p className="font-bold text-nexus-text mb-1">Restricted Zone Clearance</p>
                    <div className="flex justify-between items-center">
                      <span>West Vault Security Clearance:</span>
                      <Badge variant="success">CLEARED</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>East Lock Restricted Area:</span>
                      <Badge variant="success">SECURED</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-nexus-surface border border-nexus-border rounded-xl space-y-2 text-xs text-nexus-muted">
                    <p className="font-bold text-nexus-text mb-1">Bag Check Status</p>
                    <div className="flex justify-between items-center">
                      <span>Gate 1 check queues:</span>
                      <span>Nominal flow</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Threat Index Level:</span>
                      <span className="font-bold text-nexus-danger">LOW</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-nexus-surface2 border border-nexus-border text-xs leading-relaxed text-nexus-text">
                  <span className="text-nexus-accent font-bold block mb-1">AI Security Patrol Guidelines</span>
                  <p>Increase active patrols in Sector 108 outer corridor. Security cameras show minor crowd congregation buildup at concession stand A queue pathing. Maintain visual scanning checks.</p>
                </div>
              </div>
            )}

            {/* MEDICAL CENTRAL DASHBOARD */}
            {role === 'medical' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-nexus-surface border border-nexus-border rounded-xl space-y-2 text-xs text-nexus-muted">
                    <p className="font-bold text-nexus-text mb-1">Ambulances Status</p>
                    <div className="flex justify-between items-center">
                      <span>Central Ambulance Unit:</span>
                      <span className="text-nexus-text font-bold">READY</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Ambulances Available:</span>
                      <span className="text-nexus-text font-bold">2 units</span>
                    </div>
                  </div>
                  <div className="p-4 bg-nexus-surface border border-nexus-border rounded-xl space-y-2 text-xs text-nexus-muted">
                    <p className="font-bold text-nexus-text mb-1">Treatment Room Statistics</p>
                    <div className="flex justify-between items-center">
                      <span>Occupied Beds:</span>
                      <span>1 out of 6</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Flow:</span>
                      <span>Nominal</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-nexus-surface2 border border-nexus-border text-xs leading-relaxed text-nexus-text">
                  <span className="text-nexus-accent font-bold block mb-1">AI Medical Dispatch Advice</span>
                  <p>For Section 104 case: Dispatch Medical Team 1 with AED kit from Central first aid station. Expected route travel time: 1.4 minutes. Pathing corridor is cleared of crowd density.</p>
                </div>
              </div>
            )}

            {/* VOLUNTEER COORDINATOR */}
            {role === 'volunteer' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-nexus-muted mb-2">Volunteer Roster Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {status ? (
                    status.volunteers.map((vol) => (
                      <div key={vol.volunteer_id} className="p-3 bg-nexus-surface border border-nexus-border rounded-xl flex justify-between items-center text-xs text-nexus-muted">
                        <div>
                          <p className="font-semibold text-nexus-text leading-tight">{vol.name}</p>
                          <p className="text-[10px] mt-0.5">Location: {vol.location}</p>
                        </div>
                        <Badge variant={vol.status === 'responding' ? 'danger' : vol.status === 'available' ? 'success' : 'default'} size="sm">
                          {vol.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-nexus-muted text-xs col-span-2">No volunteers logged.</div>
                  )}
                </div>
              </div>
            )}

            {/* TRANSIT MANAGER */}
            {role === 'transport' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-nexus-surface border border-nexus-border rounded-xl space-y-2 text-xs text-nexus-muted">
                    <p className="font-bold text-nexus-text mb-1">Metro & Shuttles</p>
                    <div className="flex justify-between items-center">
                      <span>Metro status:</span>
                      <Badge variant="success">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Shuttle bus queue size:</span>
                      <span className="font-bold text-nexus-text">120 fans</span>
                    </div>
                  </div>
                  <div className="p-4 bg-nexus-surface border border-nexus-border rounded-xl space-y-2 text-xs text-nexus-muted">
                    <p className="font-bold text-nexus-text mb-1">Taxi Delays</p>
                    <div className="flex justify-between items-center">
                      <span>Taxi queue wait time:</span>
                      <span className="font-mono text-nexus-danger">15 mins</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Walking exits clear:</span>
                      <Badge variant="success">YES</Badge>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-nexus-surface2 border border-nexus-border text-xs leading-relaxed text-nexus-text">
                  <span className="text-nexus-accent font-bold block mb-1">AI Transportation Strategy</span>
                  <p>Increase shuttle frequency by dispatching two standby buses to the outer parking loop route to absorb the 120-fan queue before match exit rush peaks.</p>
                </div>
              </div>
            )}

            {/* SUSTAINABILITY DASHBOARD */}
            {role === 'sustainability' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-nexus-surface border border-nexus-border rounded-xl text-center text-xs text-nexus-muted">
                    <span className="block mb-1 font-bold text-nexus-text">Water usage</span>
                    <span className="text-lg font-bold text-nexus-accent">
                      {status ? `${Math.round(status.sustainability.water_usage_liters)} L` : '0 L'}
                    </span>
                  </div>
                  <div className="p-4 bg-nexus-surface border border-nexus-border rounded-xl text-center text-xs text-nexus-muted">
                    <span className="block mb-1 font-bold text-nexus-text">Energy consumed</span>
                    <span className="text-lg font-bold text-nexus-accent">
                      {status ? `${Math.round(status.sustainability.energy_usage_kwh)} kWh` : '0 kWh'}
                    </span>
                  </div>
                  <div className="p-4 bg-nexus-surface border border-nexus-border rounded-xl text-center text-xs text-nexus-muted">
                    <span className="block mb-1 font-bold text-nexus-text">Waste recycled</span>
                    <span className="text-lg font-bold text-nexus-success">
                      {status ? `${Math.round(status.sustainability.waste_recycled_kg)} kg` : '0 kg'}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-nexus-surface2 border border-nexus-border text-xs leading-relaxed text-nexus-text">
                  <span className="text-nexus-accent font-bold block mb-1">AI Eco Insights</span>
                  <p>Plastic bottles saved: 1,420 units. Recommend scheduling garbage sorting checks at Concourse Sector D before match conclusion to maintain clean waste separation workflows.</p>
                </div>
              </div>
            )}

            {/* ORGANIZER (GENERAL DEFAULT OVERVIEW) */}
            {role === 'organizer' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-nexus-muted mb-2">Concession & Food Monitoring</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {status ? (
                    status.food.map((stall) => (
                      <div key={stall.stall_id} className="p-3 bg-nexus-surface border border-nexus-border rounded-xl text-xs text-nexus-muted">
                        <p className="font-bold text-nexus-text leading-tight">{stall.name}</p>
                        <p className="text-[10px] mt-1">Queue: {stall.queue_length} fans</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px]">Stock level:</span>
                          <Badge variant={stall.status === 'low' ? 'danger' : 'default'} size="sm">
                            {Math.round(stall.inventory_percentage)}%
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-nexus-muted text-xs col-span-3">No concession data logged.</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Single Card: Live Incident Console */}
        <Card>
          <CardHeader className="border-b border-nexus-border pb-3 flex flex-row items-center gap-2">
            <ShieldAlert size={16} className="text-nexus-danger" />
            <CardTitle>Active Incidents Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {incidents.length > 0 ? (
              incidents.map((inc) => (
                <div key={inc.incident_id} className="p-3.5 rounded-xl bg-nexus-surface2 border border-nexus-border/60 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-nexus-text capitalize leading-tight">
                      {inc.type.replace('_', ' ')}
                    </span>
                    <Badge variant={inc.status === 'resolved' ? 'success' : inc.severity === 'high' || inc.severity === 'critical' ? 'danger' : 'default'} size="sm">
                      {inc.status}
                    </Badge>
                  </div>
                  <p className="text-nexus-muted">Location: {inc.location}</p>
                  <p className="text-[10px] text-nexus-accent">AI Guide: {inc.ai_recommendation}</p>
                  
                  {inc.status !== 'resolved' && (
                    <Button
                      size="sm"
                      className="w-full text-[11px] py-1"
                      onClick={() => handleResolveIncident(inc.incident_id)}
                      disabled={resolvingId === inc.incident_id}
                    >
                      Resolve Incident
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-nexus-muted text-xs">No active operational incidents.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Lower Dashboard row: Report generator & Command logs ──── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Executive Report Generator (Double Card) */}
        <Card className="xl:col-span-2">
          <CardHeader className="border-b border-nexus-border pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-nexus-primary-light" />
              <CardTitle>AI Operations Report Generator</CardTitle>
            </div>
            {/* Selector */}
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-nexus-surface border border-nexus-border text-xs rounded-lg p-1.5 text-nexus-text font-bold"
            >
              <option value="daily_summary">Daily Summary Report</option>
              <option value="safety">Safety Audit</option>
              <option value="accessibility">Accessibility Report</option>
              <option value="volunteer">Volunteer Shift Coverage</option>
              <option value="transportation">Transit Analysis</option>
              <option value="food_operations">Concessions Inventory</option>
              <option value="sustainability">Sustainability Report</option>
            </select>
          </CardHeader>
          <CardContent className="pt-4">
            <Button
              className="w-full mb-4"
              onClick={handleGenerateReport}
              loading={reportLoading}
              leftIcon={<Download size={14} />}
            >
              Generate AI Report
            </Button>

            {reportResult ? (
              <div className="p-4 rounded-xl bg-nexus-surface2 border border-nexus-border text-xs leading-relaxed text-nexus-text max-h-[300px] overflow-y-auto font-mono whitespace-pre-wrap">
                {reportResult}
              </div>
            ) : (
              <div className="text-center py-8 text-nexus-muted text-xs border border-dashed border-nexus-border rounded-xl">
                Click generate to run Google Gemini report operations analysis.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Command Activity Logs Timeline */}
        <Card>
          <CardHeader className="border-b border-nexus-border pb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-nexus-muted" />
              <CardTitle>Activity Timeline Log</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 max-h-[400px] overflow-y-auto">
            {status ? (
              status.command_logs.map((log, index) => (
                <div key={index} className="flex gap-2.5 text-[11px] leading-snug">
                  <span className="font-mono text-nexus-accent flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <div className="text-nexus-muted">
                    <span className="capitalize font-bold text-nexus-text mr-1">[{log.category}]</span>
                    {log.message}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-nexus-muted text-xs">Timeline logs empty.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
