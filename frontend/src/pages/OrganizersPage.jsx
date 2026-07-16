import { useState, useEffect } from 'react';
import { ClipboardList, TrendingUp, FileText, Globe, BarChart3, Bell, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { organizersApi } from '@/services/api';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge    from '@/components/ui/Badge';
import Button   from '@/components/ui/Button';
import Modal    from '@/components/ui/Modal';
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

const kpiTooltips = {
  'Overall Event Satisfaction': 'Aggregated feedback score from Fan Copilot, event surveys, and support queries.',
  'Operational Efficiency': 'Calculated ratio of completed tasks to total scheduled volunteer & staff actions.',
  'AI Adoption Rate': 'Percentage of active stadium visitors using Fan Copilot or AI translation features today.',
  'Incident Resolution Rate': 'Percentage of security incidents resolved within the target response time SLA.'
};

const statTrends = {
  'Total Matches': {
    title: 'Total Matches Scheduled',
    description: 'Matches played and scheduled for the tournament.',
    history: [
      { date: 'July 5', value: 12 },
      { date: 'July 6', value: 24 },
      { date: 'July 7', value: 36 },
      { date: 'July 8', value: 48 },
      { date: 'July 9', value: 60 },
      { date: 'July 10', value: 64 },
    ],
    maxVal: 70
  },
  'Active Venues': {
    title: 'Active Venues Under Operations',
    description: 'Number of venues concurrently running match operations.',
    history: [
      { date: 'July 5', value: 8 },
      { date: 'July 6', value: 16 },
      { date: 'July 7', value: 22 },
      { date: 'July 8', value: 24 },
      { date: 'July 9', value: 26 },
      { date: 'July 10', value: 26 },
    ],
    maxVal: 30
  },
  'AI Insights Generated': {
    title: 'AI Insights Generated Trend',
    description: 'Daily volume of AI recommendations and insights produced.',
    history: [
      { date: 'July 5', value: 320 },
      { date: 'July 6', value: 580 },
      { date: 'July 7', value: 890 },
      { date: 'July 8', value: 1040 },
      { date: 'July 9', value: 1180 },
      { date: 'July 10', value: 1247 },
    ],
    maxVal: 1500
  },
  'Open Action Items': {
    title: 'Open Action Items Count',
    description: 'Unresolved operational issues and security incidents.',
    history: [
      { date: 'July 5', value: 45 },
      { date: 'July 6', value: 38 },
      { date: 'July 7', value: 29 },
      { date: 'July 8', value: 22 },
      { date: 'July 9', value: 15 },
      { date: 'July 10', value: 18 },
    ],
    maxVal: 50
  }
};

const mockInsights = [
  {
    title: 'Transport Flow Optimization',
    category: 'Operations',
    analysis: 'Transit data indicates high congestion on Metro Line 3. Shuttle buses are currently under-utilized.',
    summary: 'Re-routing shuttle fleets to relieve Metro Line 3 pressure is recommended.',
    recommendations: 'Redirect 12 shuttle buses to Section 2 Transit Hub. Update transit alerts in Fan Copilot app.',
    confidenceScore: '92%'
  },
  {
    title: 'Concession Supply Alert',
    category: 'Analytics',
    analysis: 'Pre-order volume for section 104 concessions has surged by 45% over the past 30 minutes.',
    summary: 'Surge in Section 104 concession orders requires stock replenishment.',
    recommendations: 'Dispatch mobile beverage stock to Section 104 kiosks. Adjust staff allocation to counter queue times.',
    confidenceScore: '95%'
  },
  {
    title: 'Crowd Flow at Gate D',
    category: 'Security',
    analysis: 'Gate D density is approaching level-orange limit. Fan flow rate is 3,500/hour.',
    summary: 'Crowd build-up at Gate D requires queue division.',
    recommendations: 'Open secondary turnstiles D3 and D4. Direct arrival queue overflow to Gate E.',
    confidenceScore: '97%'
  }
];

export default function OrganizersPage() {
  const [reportList, setReportList] = useState(reports);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalMatches: '64',
    activeVenues: '26',
    aiInsights: '1,247',
    openActions: '18',
    aiChange: 23,
    actionsChange: -12
  });
  const [reportDetailsState, setReportDetailsState] = useState({
    1: {
      title: 'Match Day Operations Report',
      category: 'Operations',
      generatedTime: '2 hours ago',
      summary: 'All operations running smoothly with minor crowd density alerts resolved.',
      analysis: 'Spectator entry queues peaked between 17:30 and 18:15. Turnstiles at Gates A and B handled 4,200 fans/hour. Transition of volunteers between zones went smoothly, though minor transport delays occurred around Sector 4.',
      recommendations: 'Optimize volunteer allocation at Sector 4 during peak times. Increase shuttle frequency by 10% during post-match dispersion.',
      confidenceScore: '94%'
    },
    2: {
      title: 'Security Incident Summary',
      category: 'Security',
      generatedTime: '4 hours ago',
      summary: '3 incidents recorded; all resolved within target response SLA.',
      analysis: 'Incidents included a minor medical issue at Section 104, a brief ticket dispute at Gate G, and a lost child at Concourse B. Medical first responders arrived in 3.8 minutes. Ticket resolution took 5 minutes.',
      recommendations: 'Ensure all first aid station signage is highly visible. Update ticketing scanners firmware to resolve read errors.',
      confidenceScore: '98%'
    },
    3: {
      title: 'Fan Satisfaction Analysis',
      category: 'Analytics',
      generatedTime: '1 day ago',
      summary: 'Overall event satisfaction is stable at 92%. Digital twin navigation and AI Copilot have high ratings.',
      analysis: 'Wayfinding via Fan Copilot received an average rating of 4.9/5. Food and beverage wait times averaged 4.2 minutes, which is well below the target 6-minute threshold. Some feedback noted minor audio echoes in Section 202.',
      recommendations: 'Conduct acoustical checks in Section 202. Keep promoting the pre-order concession feature through push notifications.',
      confidenceScore: '91%'
    },
    4: {
      title: 'Volunteer Performance Review',
      category: 'HR',
      generatedTime: '1 day ago',
      summary: 'Volunteer check-in rate at 97%, with outstanding feedback on coordinator communication.',
      analysis: 'Shift attendance was excellent. Training materials on accessibility support were cited as highly useful. There was a minor coordination gap during the shift handover at 16:00.',
      recommendations: 'Implement a 15-minute overlap for shift handovers. Recognize top-performing sectors during the daily debrief.',
      confidenceScore: '89%'
    }
  });

  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [selectedReportDetails, setSelectedReportDetails] = useState(null);
  const [selectedStatTrend, setSelectedStatTrend] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const dashData = await organizersApi.getDashboard();
        setDashboardMetrics({
          totalMatches: String(dashData.total_matches),
          activeVenues: String(dashData.active_venues),
          aiInsights: dashData.ai_insights_generated.toLocaleString(),
          openActions: String(dashData.open_incidents),
          aiChange: 23,
          actionsChange: -12
        });
      } catch (err) {
        console.error('Dashboard API error', err);
      }

      try {
        const repsData = await organizersApi.getReports();
        if (repsData && repsData.length > 0) {
          const mappedReports = repsData.map((r, index) => ({
            id: r.report_id || index + 10,
            title: r.title,
            type: r.type || 'Operations',
            generated: 'Just now',
            status: r.status,
            summary: r.summary || 'Summary unavailable'
          }));
          
          const loadedDetails = {};
          mappedReports.forEach(r => {
            loadedDetails[r.id] = {
              title: r.title,
              category: r.type,
              generatedTime: 'Just now',
              summary: r.summary,
              analysis: r.summary + ' Complete details are available in the main document archive.',
              recommendations: 'Monitor operations standard checklist and follow normal queue protocols.',
              confidenceScore: '92%'
            };
          });
          
          setReportDetailsState(prev => ({ ...prev, ...loadedDetails }));
          setReportList(mappedReports);
        }
      } catch (err) {
        console.error('Reports API error', err);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleExport = () => {
    setExportLoading(true);
    try {
      const csvContent = [
        ['FIFA World Cup 2026 - Stadium Operating System - Organizer Dashboard Report'],
        ['Generated At', new Date().toLocaleString()],
        [],
        ['Stat Metric', 'Value'],
        ['Total Matches', dashboardMetrics.totalMatches],
        ['Active Venues', dashboardMetrics.activeVenues],
        ['AI Insights Generated', dashboardMetrics.aiInsights],
        ['Open Action Items', dashboardMetrics.openActions],
        [],
        ['KPI', 'Value'],
        ['Overall Event Satisfaction', '92%'],
        ['Operational Efficiency', '87%'],
        ['AI Adoption Rate', '78%'],
        ['Incident Resolution Rate', '96%'],
        [],
        ['AI-Generated Report Title', 'Category', 'Generated Time', 'Status'],
        ...reportList.map(r => [r.title, r.type, r.generated, r.status])
      ].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `organizer_dashboard_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Report exported successfully!');
    } catch (err) {
      toast.error('Failed to export report.');
    }
    setExportLoading(false);
  };

  const handleGenerateReport = async () => {
    setGenerateLoading(true);
    try {
      const statsData = {
        total_matches: 64,
        active_venues: 26,
        insights_generated: 1247,
        open_actions: 18
      };
      const response = await organizersApi.generateInsight(statsData);
      
      const newReportId = reportList.length + 100;
      const newReport = {
        id: newReportId,
        title: `AI Real-Time Insight #${newReportId}`,
        type: 'Operations',
        generated: 'Just now',
        status: 'ready',
        summary: response.insight.substring(0, 80) + '...'
      };
      
      setReportDetailsState(prev => ({
        ...prev,
        [newReportId]: {
          title: newReport.title,
          category: newReport.type,
          generatedTime: 'Just now',
          summary: newReport.summary,
          analysis: response.insight,
          recommendations: 'Optimize staffing based on AI recommendation and monitor density real-time.',
          confidenceScore: response.confidence === 'high' ? '93%' : '88%'
        }
      }));

      setReportList(prev => [newReport, ...prev]);
      toast.success('AI Insight generated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('AI Insight API unavailable. Using offline simulation.');
      
      setTimeout(() => {
        const mockIdx = Math.floor(Math.random() * mockInsights.length);
        const selectedMock = mockInsights[mockIdx];
        
        const newReportId = reportList.length + 100;
        const newReport = {
          id: newReportId,
          title: selectedMock.title,
          type: selectedMock.category,
          generated: 'Just now',
          status: 'ready',
          summary: selectedMock.summary
        };

        setReportDetailsState(prev => ({
          ...prev,
          [newReportId]: {
            title: selectedMock.title,
            category: selectedMock.category,
            generatedTime: 'Just now',
            summary: selectedMock.summary,
            analysis: selectedMock.analysis,
            recommendations: selectedMock.recommendations,
            confidenceScore: selectedMock.confidenceScore
          }
        }));

        setReportList(prev => [newReport, ...prev]);
        setGenerateLoading(false);
        toast.success('Simulated AI Report generated successfully!');
      }, 1000);
      return;
    }
    setGenerateLoading(false);
  };

  const handleReportClick = (id) => {
    const details = reportDetailsState[id];
    if (details) {
      setSelectedReportDetails(details);
    } else {
      toast.error('Report details currently generating.');
    }
  };

  const handleStatClick = (title) => {
    const trend = statTrends[title];
    if (trend) {
      setSelectedStatTrend(trend);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizer Dashboard"
        subtitle="Comprehensive event oversight and AI-powered analytics"
        icon={ClipboardList}
        actions={
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download size={14} />}
            onClick={handleExport}
            loading={exportLoading}
          >
            Export Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div onClick={() => handleStatClick('Total Matches')} className="cursor-pointer">
          <StatCard
            title="Total Matches"
            value={dashboardMetrics.totalMatches}
            icon={Globe}
            className="cursor-pointer hover:border-nexus-primary/50 hover:shadow-nexus transition-all duration-300"
          />
        </div>
        <div onClick={() => handleStatClick('Active Venues')} className="cursor-pointer">
          <StatCard
            title="Active Venues"
            value={dashboardMetrics.activeVenues}
            icon={BarChart3}
            className="cursor-pointer hover:border-nexus-primary/50 hover:shadow-nexus transition-all duration-300"
          />
        </div>
        <div onClick={() => handleStatClick('AI Insights Generated')} className="cursor-pointer">
          <StatCard
            title="AI Insights Generated"
            value={dashboardMetrics.aiInsights}
            change={dashboardMetrics.aiChange}
            icon={TrendingUp}
            className="cursor-pointer hover:border-nexus-primary/50 hover:shadow-nexus transition-all duration-300"
          />
        </div>
        <div onClick={() => handleStatClick('Open Action Items')} className="cursor-pointer">
          <StatCard
            title="Open Action Items"
            value={dashboardMetrics.openActions}
            change={dashboardMetrics.actionsChange}
            icon={Bell}
            className="cursor-pointer hover:border-nexus-primary/50 hover:shadow-nexus transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI-Generated Reports</CardTitle>
              <Button
                size="sm"
                variant="primary"
                onClick={handleGenerateReport}
                loading={generateLoading}
              >
                Generate New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <span className="text-sm text-nexus-muted">Loading reports...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {reportList.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleReportClick(r.id)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-nexus-surface2 border border-nexus-border/50 cursor-pointer hover:border-nexus-primary/50 hover:scale-[1.01] hover:shadow-nexus-lg transition-all duration-300"
                  >
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Key Performance Indicators</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} title={kpiTooltips[kpi.label]} className="cursor-help group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-nexus-muted group-hover:text-nexus-text transition-colors">{kpi.label}</span>
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

      {/* Report Detail Modal */}
      <Modal
        isOpen={!!selectedReportDetails}
        onClose={() => setSelectedReportDetails(null)}
        title="AI Report Analysis"
        size="lg"
      >
        {selectedReportDetails && (
          <div className="space-y-4 text-nexus-text">
            <div>
              <p className="text-xs text-nexus-muted font-semibold uppercase tracking-wider">Report Title</p>
              <h3 className="text-lg font-display font-bold text-nexus-text mt-0.5">{selectedReportDetails.title}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant={typeVariant[selectedReportDetails.category] || 'primary'} size="sm">
                  {selectedReportDetails.category}
                </Badge>
                <span className="text-xs text-nexus-muted">{selectedReportDetails.generatedTime}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-nexus-surface2 border border-nexus-border">
              <p className="text-xs text-nexus-accent font-semibold uppercase tracking-wider mb-1">AI Summary</p>
              <p className="text-sm leading-relaxed">{selectedReportDetails.summary}</p>
            </div>

            <div>
              <p className="text-xs text-nexus-muted font-semibold uppercase tracking-wider mb-1">Detailed Analysis</p>
              <p className="text-sm leading-relaxed bg-nexus-surface2/40 p-4 rounded-xl border border-nexus-border/60">
                {selectedReportDetails.analysis}
              </p>
            </div>

            <div>
              <p className="text-xs text-nexus-muted font-semibold uppercase tracking-wider mb-1">Recommendations</p>
              <p className="text-sm leading-relaxed bg-nexus-surface2/40 p-4 rounded-xl border border-nexus-border/60">
                {selectedReportDetails.recommendations}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-nexus-muted font-semibold uppercase tracking-wider">Confidence Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-nexus-surface2 overflow-hidden">
                    <div 
                      className="h-full bg-nexus-accent rounded-full" 
                      style={{ width: selectedReportDetails.confidenceScore }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-nexus-accent">{selectedReportDetails.confidenceScore}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-nexus-border">
              <Button onClick={() => setSelectedReportDetails(null)} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Stat Trend Modal */}
      <Modal
        isOpen={!!selectedStatTrend}
        onClose={() => setSelectedStatTrend(null)}
        title="Historical Operational Trend"
        size="md"
      >
        {selectedStatTrend && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-display font-bold text-nexus-text">
                {selectedStatTrend.title}
              </h3>
              <p className="text-sm text-nexus-muted mt-1">
                {selectedStatTrend.description}
              </p>
            </div>

            <div className="bg-nexus-surface2 p-6 rounded-xl border border-nexus-border flex flex-col gap-4">
              <p className="text-xs text-nexus-accent font-semibold uppercase tracking-wider">Trend Graph</p>
              
              <div className="flex items-end justify-between h-36 gap-2 pt-4 px-2">
                {selectedStatTrend.history.map((h, i) => {
                  const percentage = (h.value / selectedStatTrend.maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <span className="absolute bottom-full mb-1 bg-nexus-bg text-[10px] text-nexus-text px-1.5 py-0.5 rounded border border-nexus-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {h.value}
                      </span>
                      <div 
                        className="w-full bg-gradient-to-t from-nexus-primary/80 to-nexus-primary rounded-t transition-all duration-500 ease-out"
                        style={{ height: `${percentage}%` }}
                      />
                      <span className="text-[10px] text-nexus-muted whitespace-nowrap">{h.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-nexus-border">
              <Button onClick={() => setSelectedStatTrend(null)} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
