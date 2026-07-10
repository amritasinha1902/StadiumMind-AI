import { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RefreshCw, AlertTriangle, ShieldAlert,
  Thermometer, Sun, CloudRain, Navigation, MapPin, Eye,
  Building, UserCheck, Flame, Loader2, PlusCircle, CheckCircle, Radio
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { digitalTwinApi } from '@/services/api';
import toast from 'react-hot-toast';

// Static coordinates for stadium landmarks (Canvas size 500x500 normalized)
const landmarks = {
  gates: [
    { id: 'G1', label: 'Gate 1 (West)', x: 60, y: 250, color: '#10B981' },
    { id: 'G2', label: 'Gate 2 (South)', x: 250, y: 440, color: '#F59E0B' },
    { id: 'G3', label: 'Gate 3 (North)', x: 250, y: 60, color: '#EF4444' },
    { id: 'G4', label: 'Gate 4 (East)', x: 440, y: 250, color: '#F59E0B' }
  ],
  facilities: [
    { id: 'F1', label: 'Stadium Grill A', type: 'food', x: 120, y: 120, icon: '🍔' },
    { id: 'F2', label: 'Taco Corner B', type: 'food', x: 380, y: 120, icon: '🌮' },
    { id: 'toilet-1', label: 'Restroom Block 1', type: 'toilet', x: 120, y: 380, icon: '🚻' },
    { id: 'toilet-2', label: 'Restroom Block 2', type: 'toilet', x: 380, y: 380, icon: '🚻' },
    { id: 'MED-1', label: 'First Aid Station 1', type: 'medical', x: 250, y: 360, icon: '🏥' },
    { id: 'V-101', label: 'Volunteer Info A', type: 'volunteer', x: 250, y: 140, icon: '🙋' }
  ]
};

// Simulated crowd particle points walking on concentric concourse tracks
const concourseTrackRadius = [130, 180, 220];

export default function AIDigitalTwinPage() {
  const canvasRef = useRef(null);

  // Simulation controls state
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 5x
  const [timeOfDay, setTimeOfDay] = useState('18:45');

  // API Live data states
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [weather, setWeather] = useState({ temperature_c: 24.0, humidity_pct: 65.0, status: 'sunny' });

  // Map Filter/Toggle overlays
  const [showCrowd, setShowCrowd] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showResponders, setShowResponders] = useState(true);
  const [selectedLandmark, setSelectedLandmark] = useState(null);

  // Incident & Assignment state
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [assigningResponder, setAssigningResponder] = useState(false);

  // Smart Navigation Widget
  const [navFrom, setNavFrom] = useState('Gate 3 (North)');
  const [navTo, setNavTo] = useState('First Aid Station 1');
  const [navProfile, setNavProfile] = useState('fastest'); // 'fastest' | 'least_crowded' | 'wheelchair' | 'evacuation'
  const [navigationResult, setNavigationResult] = useState(null);
  const [navLoading, setNavLoading] = useState(false);

  // Local state for crowd particle animation
  const particlesRef = useRef([]);

  // Initialize animated crowd particles
  useEffect(() => {
    const particles = [];
    // Generate 120 crowd dots on concentric tracks with randomized angles and speeds
    for (let i = 0; i < 120; i++) {
      const trackIndex = i % concourseTrackRadius.length;
      const radius = concourseTrackRadius[trackIndex];
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius,
        speed: (0.002 + Math.random() * 0.003) * (trackIndex === 0 ? 0.8 : 1.2),
        color: i % 4 === 0 ? '#EF4444' : i % 3 === 0 ? '#F59E0B' : '#10B981' // color-coded density
      });
    }
    particlesRef.current = particles;
  }, []);

  // Fetch status data from backend
  const fetchStatus = async () => {
    try {
      const res = await digitalTwinApi.getStatus();
      setStatus(res);
      setIncidents(res.incidents);
      setWeather(res.weather);
      setAlerts(res.smart_alerts);
    } catch (err) {
      console.error("Failed to load digital twin status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Auto-update loop simulating real-time operations
    const interval = setInterval(() => {
      if (isPlaying) {
        fetchStatus();
        // Shift time slightly
        setTimeOfDay((prev) => {
          const [h, m] = prev.split(':').map(Number);
          const nextMin = (m + simSpeed) % 60;
          const nextHour = (h + Math.floor((m + simSpeed) / 60)) % 24;
          return `${String(nextHour).padStart(2, '0')}:${String(nextMin).padStart(2, '0')}`;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#050A18';
      ctx.fillRect(0, 0, 500, 500);

      // ── 1. Draw Football Field Center ────────────────────────────────
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.fillRect(175, 200, 150, 100);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(175, 200, 150, 100);

      // Pitch lines
      ctx.beginPath();
      ctx.moveTo(250, 200);
      ctx.lineTo(250, 300);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(250, 250, 20, 0, Math.PI * 2);
      ctx.stroke();

      // ── 2. Draw Concentric Seating Stands ────────────────────────────
      ctx.strokeStyle = 'rgba(30, 58, 95, 0.5)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(250, 250, 95, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(30, 58, 95, 0.3)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(250, 250, 140, 0, Math.PI * 2);
      ctx.stroke();

      // ── 3. Draw Heatmap overlay if enabled ───────────────────────────
      if (showHeatmap) {
        // Red Hot spot around Gate 3 (North)
        const g3Rad = ctx.createRadialGradient(250, 60, 10, 250, 60, 80);
        g3Rad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
        g3Rad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = g3Rad;
        ctx.beginPath();
        ctx.arc(250, 60, 80, 0, Math.PI * 2);
        ctx.fill();

        // Orange Hot spot around Gate 2 (South)
        const g2Rad = ctx.createRadialGradient(250, 440, 5, 250, 440, 60);
        g2Rad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
        g2Rad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = g2Rad;
        ctx.beginPath();
        ctx.arc(250, 440, 60, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 4. Draw Navigation path overlay ──────────────────────────────
      if (navigationResult) {
        ctx.beginPath();
        ctx.strokeStyle = '#F59E0B'; // neon gold route
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -Date.now() / 150; // scrolling line dash

        // Draw line Gates/Landmarks based on nav configuration
        if (navFrom.includes("Gate 3")) {
          ctx.moveTo(250, 60);
          ctx.lineTo(250, 140);
          ctx.lineTo(250, 360);
        } else {
          ctx.moveTo(250, 440);
          ctx.lineTo(250, 360);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
      }

      // ── 5. Draw Crowd particles (Simulated movement) ─────────────────
      if (showCrowd) {
        const particles = particlesRef.current;
        particles.forEach((p) => {
          if (isPlaying) {
            p.angle = (p.angle + p.speed * simSpeed) % (Math.PI * 2);
          }
          const px = 250 + Math.cos(p.angle) * p.radius;
          const py = 250 + Math.sin(p.angle) * p.radius;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // ── 6. Draw Gates & Facilities ───────────────────────────────────
      landmarks.gates.forEach((gate) => {
        ctx.fillStyle = gate.color;
        ctx.beginPath();
        ctx.arc(gate.x, gate.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(gate.id, gate.x - 5, gate.y - 12);
      });

      // Facilities icons
      landmarks.facilities.forEach((f) => {
        ctx.fillStyle = 'rgba(13, 27, 46, 0.9)';
        ctx.strokeStyle = 'rgba(0, 136, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Inter';
        ctx.fillText(f.icon, f.x - 7, f.y + 4);
      });

      // ── 7. Draw Active Incident markers ──────────────────────────────
      incidents.forEach((inc) => {
        let ix = 250, iy = 250;
        if (inc.location.includes("North")) { ix = 250; iy = 100; }
        else if (inc.location.includes("Kids")) { ix = 120; iy = 160; }
        else if (inc.location.includes("Section 108")) { ix = 380; iy = 280; }

        // Pulsing alert ring
        const scale = 1 + Math.sin(Date.now() / 200) * 0.15;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ix, iy, 16 * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Solid alert triangle
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.moveTo(ix, iy - 8);
        ctx.lineTo(ix - 8, iy + 8);
        ctx.lineTo(ix + 8, iy + 8);
        ctx.closePath();
        ctx.fill();
      });

      // ── 8. Draw Volunteer/Medical markers if toggled ─────────────────
      if (showResponders && status) {
        status.volunteers.forEach((v) => {
          let vx = 210, vy = 140;
          if (v.status === "responding") {
            vx = 230; vy = 120; // Simulated responder moving towards North Gate
          }
          ctx.fillStyle = v.status === "responding" ? '#F59E0B' : '#0066CC';
          ctx.fillRect(vx - 4, vy - 4, 8, 8);
        });

        status.medical_teams.forEach((m) => {
          let mx = 270, my = 360;
          if (m.status === "treating_patient") {
            mx = 360; my = 280; // Located near Section 108
          }
          ctx.fillStyle = '#10B981';
          // Draw cross
          ctx.fillRect(mx - 2, my - 6, 4, 12);
          ctx.fillRect(mx - 6, my - 2, 12, 4);
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [showCrowd, showHeatmap, showResponders, incidents, navigationResult, isPlaying, simSpeed, status]);

  // Click on Canvas coordinate handler (approximate match to landmarks)
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // Search facilities
    const clickedFac = landmarks.facilities.find(
      (f) => Math.hypot(f.x - cx, f.y - cy) < 15
    );
    if (clickedFac) {
      setSelectedLandmark(clickedFac);
      return;
    }

    // Search gates
    const clickedGate = landmarks.gates.find(
      (g) => Math.hypot(g.x - cx, g.y - cy) < 15
    );
    if (clickedGate) {
      setSelectedLandmark({ label: clickedGate.label, type: 'gate', id: clickedGate.id, icon: '🅿️' });
      return;
    }

    setSelectedLandmark(null);
  };

  // Inject Incident Trigger
  const handleInjectIncident = async () => {
    try {
      const res = await digitalTwinApi.injectIncident();
      setIncidents((prev) => [...prev, res]);
      toast.error(`ALERT INJECTED: ${res.type} at ${res.location}`);
      fetchStatus();
    } catch (err) {
      toast.error("Failed to inject incident.");
    }
  };

  // Assign Responder Trigger
  const handleAssignResponder = async (incidentId, responderId, type) => {
    setAssigningResponder(true);
    try {
      const res = await digitalTwinApi.assignResponder(incidentId, responderId, type);
      toast.success(res.message);
      setSelectedIncident(null);
      fetchStatus();
    } catch (err) {
      toast.error("Failed to dispatch responder.");
    } finally {
      setAssigningResponder(false);
    }
  };

  // Weather update trigger
  const handleWeatherChange = async (wStatus) => {
    try {
      const res = await digitalTwinApi.updateWeather(wStatus);
      setWeather(res);
      toast.success(`Stadium weather updated to: ${wStatus}`);
      fetchStatus();
    } catch (err) {
      toast.error("Failed to update weather.");
    }
  };

  // Navigation route trigger
  const handleNavigationSubmit = async () => {
    setNavLoading(true);
    setNavigationResult(null);
    try {
      const res = await digitalTwinApi.getNavigation(navFrom, navTo, navProfile);
      setNavigationResult(res);
      toast.success("Navigation profile calculated!");
    } catch (err) {
      toast.error("Failed to retrieve routing options.");
    } finally {
      setNavLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stadium Operations Digital Twin"
        subtitle="Futuristic real-time operational simulation with AI-powered forecasting"
        icon={Building}
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={showHeatmap ? 'accent' : 'secondary'}
              leftIcon={<Eye size={14} />}
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              Heatmap
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<PlusCircle size={14} />}
              onClick={handleInjectIncident}
            >
              Inject Incident
            </Button>
          </div>
        }
      />

      {/* ── Main Simulation Hub Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Map Simulator Canvas */}
        <Card className="xl:col-span-2 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between border-b border-nexus-border pb-4">
            <div className="flex items-center gap-2">
              <Radio className="text-nexus-danger animate-pulse" size={16} />
              <CardTitle>Interactive Concourse Simulation</CardTitle>
            </div>
            {/* Simulation controls */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-nexus-accent bg-nexus-surface2 px-2 py-1 rounded">
                SIM TIME: {timeOfDay}
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-nexus-surface border border-nexus-border hover:bg-nexus-surface2 rounded-lg text-nexus-text"
                title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <select
                value={simSpeed}
                onChange={(e) => setSimSpeed(Number(e.target.value))}
                className="bg-nexus-surface border border-nexus-border text-xs rounded-lg p-2 text-nexus-text"
              >
                <option value="1">1x Speed</option>
                <option value="2">2x Speed</option>
                <option value="5">5x Speed</option>
              </select>
            </div>
          </CardHeader>

          {/* Canvas Wrapper */}
          <div className="flex-1 flex items-center justify-center p-4 bg-nexus-surface/20 min-h-[450px] relative">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              onClick={handleCanvasClick}
              className="max-w-full rounded-2xl border border-nexus-border cursor-pointer shadow-nexus"
            />

            {/* Float Overlay Filters */}
            <div className="absolute bottom-6 left-6 flex flex-wrap gap-1.5 max-w-[80%] bg-nexus-surface/90 backdrop-blur-md p-2 rounded-xl border border-nexus-border">
              <button
                onClick={() => setShowCrowd(!showCrowd)}
                className={`text-[10px] px-2.5 py-1 rounded-md transition-all ${
                  showCrowd ? 'bg-nexus-primary text-white' : 'text-nexus-muted hover:text-nexus-text'
                }`}
              >
                Crowd Dots
              </button>
              <button
                onClick={() => setShowResponders(!showResponders)}
                className={`text-[10px] px-2.5 py-1 rounded-md transition-all ${
                  showResponders ? 'bg-nexus-primary text-white' : 'text-nexus-muted hover:text-nexus-text'
                }`}
              >
                Responders
              </button>
            </div>

            {/* Landmark details popover card */}
            {selectedLandmark && (
              <div className="absolute top-6 right-6 w-60 bg-nexus-surface2/95 backdrop-blur border border-nexus-border p-4 rounded-xl shadow-2xl animate-fade-in text-sm text-nexus-muted">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{selectedLandmark.icon}</span>
                  <p className="font-bold text-nexus-text leading-tight">{selectedLandmark.label}</p>
                </div>
                <p className="text-xs mb-1">Type: <span className="capitalize text-nexus-text">{selectedLandmark.type}</span></p>
                <p className="text-xs">Location coordinates: <span className="font-mono text-nexus-accent">({selectedLandmark.x}, {selectedLandmark.y})</span></p>
                <button
                  onClick={() => setSelectedLandmark(null)}
                  className="w-full mt-3 text-xs bg-nexus-surface py-1 rounded hover:bg-nexus-border text-nexus-text border border-nexus-border"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: AI Operations & Recommendations */}
        <div className="space-y-6">
          {/* Operations Summary Card */}
          <Card>
            <CardHeader className="border-b border-nexus-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-nexus-accent" />
                <CardTitle>AI Operations Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="py-6 flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-nexus-accent" />
                  <span className="text-xs text-nexus-muted">Generating operational summary...</span>
                </div>
              ) : status ? (
                <div className="space-y-4">
                  <p className="text-sm text-nexus-text leading-relaxed bg-nexus-surface/50 p-3 rounded-xl border border-nexus-border/60">
                    {status.operations_summary}
                  </p>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-nexus-muted mb-2">Operational Alerts</h4>
                    <div className="space-y-2">
                      {status.smart_alerts.length > 0 ? (
                        status.smart_alerts.map((al, idx) => (
                          <div key={idx} className="flex gap-2 p-2.5 rounded-lg bg-nexus-danger/10 border border-nexus-danger/20 text-xs text-nexus-text leading-snug">
                            <AlertTriangle size={14} className="text-nexus-danger flex-shrink-0" />
                            {al}
                          </div>
                        ))
                      ) : (
                        <div className="p-2.5 rounded-lg bg-nexus-surface2 border border-nexus-border/50 text-xs text-nexus-muted flex gap-2">
                          <CheckCircle size={14} className="text-nexus-success flex-shrink-0" />
                          All facilities reporting nominal operational status.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* AI Crowd Predictions */}
          <Card>
            <CardHeader className="border-b border-nexus-border pb-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-nexus-primary-light" />
                <CardTitle>AI Crowd Forecasts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {status ? (
                status.crowd_predictions.map((pred, i) => (
                  <div key={i} className="p-3 rounded-xl bg-nexus-surface2/60 border border-nexus-border/40 text-xs text-nexus-text leading-relaxed">
                    ⏱️ {pred}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-nexus-muted text-xs">No active crowd predictions available.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Lower Dashboard row: Navigation & Operations Management ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 1: Smart Route Planner */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-nexus-border pb-3">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-nexus-primary-light" />
              <CardTitle>Smart Path Planner</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-nexus-muted mb-1 block">Start Location</label>
                <select
                  value={navFrom}
                  onChange={(e) => setNavFrom(e.target.value)}
                  className="nexus-input w-full bg-nexus-surface border border-nexus-border"
                >
                  <option value="Gate 3 (North)">Gate 3 (North Entrance)</option>
                  <option value="Gate 2 (South)">Gate 2 (South Entrance)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-nexus-muted mb-1 block">Destination</label>
                <select
                  value={navTo}
                  onChange={(e) => setNavTo(e.target.value)}
                  className="nexus-input w-full bg-nexus-surface border border-nexus-border"
                >
                  <option value="First Aid Station 1">First Aid Station 1</option>
                  <option value="Taco Corner B">Taco Corner B (Section 112)</option>
                  <option value="Restroom Block 2">Restroom Block 2 (Section 118)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-nexus-muted mb-1 block">Routing Profile</label>
                <select
                  value={navProfile}
                  onChange={(e) => setNavProfile(e.target.value)}
                  className="nexus-input w-full bg-nexus-surface border border-nexus-border"
                >
                  <option value="fastest">Fastest Route</option>
                  <option value="least_crowded">Least Crowded Route</option>
                  <option value="wheelchair">Wheelchair Accessible</option>
                  <option value="evacuation">Emergency Evacuation</option>
                </select>
              </div>
            </div>

            <Button
              className="w-full mb-4"
              onClick={handleNavigationSubmit}
              loading={navLoading}
            >
              Calculate Route Path
            </Button>

            {navigationResult && (
              <div className="p-4 rounded-xl bg-nexus-surface2 border border-nexus-border text-sm leading-relaxed text-nexus-text">
                <span className="text-xs font-bold text-nexus-accent block mb-2 uppercase tracking-wide">AI Route Guidance</span>
                <p className="mb-3 font-medium">{navigationResult.ai_explanation}</p>
                <div className="space-y-1 text-xs text-nexus-muted border-t border-nexus-border/50 pt-2">
                  <p className="font-bold">Step-by-step Wayfinding Directions:</p>
                  {navigationResult.directions.map((step, idx) => (
                    <p key={idx}>{idx + 1}. {step}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Widget 2: Weather & Transit */}
        <div className="space-y-6">
          {/* Weather Controls Card */}
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-nexus-surface border border-nexus-border flex items-center justify-center text-xl">
                  {weather.status === 'sunny' ? '☀️' : weather.status === 'cloudy' ? '☁️' : '🌧️'}
                </div>
                <div>
                  <p className="text-xs text-nexus-muted">Stadium Weather</p>
                  <p className="text-sm font-bold text-nexus-text capitalize">{weather.status} · {weather.temperature_c}°C</p>
                </div>
              </div>
              <div className="flex gap-1">
                {['sunny', 'rain', 'storm'].map((w) => (
                  <button
                    key={w}
                    onClick={() => handleWeatherChange(w)}
                    className={`p-1.5 rounded border text-xs capitalize ${
                      weather.status === w
                        ? 'bg-nexus-primary text-white border-nexus-primary'
                        : 'bg-nexus-surface border-nexus-border text-nexus-muted hover:text-nexus-text'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Incidents Responder dispatcher list */}
          <Card>
            <CardHeader className="border-b border-nexus-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-nexus-danger" />
                <CardTitle>Active Incidents Panel</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {incidents.length > 0 ? (
                incidents.map((inc) => (
                  <div
                    key={inc.incident_id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedIncident?.incident_id === inc.incident_id
                        ? 'bg-nexus-danger/20 border-nexus-danger'
                        : 'bg-nexus-surface2/60 border-nexus-border/50 hover:bg-nexus-border/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold text-nexus-text capitalize">{inc.type.replace('_', ' ')}</span>
                      <Badge variant={inc.severity === 'critical' || inc.severity === 'high' ? 'danger' : 'default'} size="sm">
                        {inc.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-nexus-muted">Location: {inc.location}</p>
                    <p className="text-[10px] text-nexus-accent mt-1.5 capitalize">Status: {inc.status}</p>

                    {/* Dispatcher Actions */}
                    {selectedIncident?.incident_id === inc.incident_id && inc.status === 'active' && (
                      <div className="mt-3 pt-3 border-t border-nexus-border/50 space-y-2">
                        <span className="text-[10px] font-bold text-nexus-text block uppercase">Dispatch Available Responder</span>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            className="flex-1 text-[11px]"
                            onClick={() => handleAssignResponder(inc.incident_id, 'V-101', 'volunteer')}
                            disabled={assigningResponder}
                          >
                            Send David V-101
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1 text-[11px]"
                            onClick={() => handleAssignResponder(inc.incident_id, 'MED-1', 'medical')}
                            disabled={assigningResponder}
                          >
                            Send Med Team 1
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-nexus-muted text-xs">No active operational incidents.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
