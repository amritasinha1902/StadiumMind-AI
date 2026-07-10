import { useState, useEffect, useRef } from 'react';
import {
  Send, Mic, MicOff, Volume2, VolumeX, RefreshCw, Trash2, Copy,
  ThumbsUp, ThumbsDown, User, Heart, Sparkles, AlertTriangle, HelpCircle,
  Car, Clock, Utensils, MapPin, ShieldAlert, Accessibility, Navigation, Globe, ListFilter
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { fanCopilotApi, multiAgentApi } from '@/services/api';
import toast from 'react-hot-toast';

const suggestedPrompts = [
  "Guide me to Gate 7",
  "Where is my seat?",
  "Nearest washroom",
  "Vegetarian food nearby",
  "Wheelchair route",
  "Parking assistance",
  "Emergency help",
  "Translate conversation",
  "Today's matches"
];

const matchesInfo = {
  teams: "Brazil vs Argentina",
  venue: "MetLife Stadium, East Rutherford",
  kickoff: "20:00 EST",
  gatesOpen: "17:00 EST",
  security: "No bags larger than 12x6x12 inches. Visual scan active."
};

export default function FanCopilotPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to StadiumMind AI! I am your intelligent FIFA World Cup stadium assistant. Ask me anything naturally.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'info' | 'dev'
  const [telemetryData, setTelemetryData] = useState(null);
  const [memoryContext, setMemoryContext] = useState({
    current_gate: null,
    seat_number: null,
    parking_location: localStorage.getItem('nexus-parking-spot') || null,
    accessibility_pref: null,
    preferred_language: null,
    food_preference: null,
    transportation_method: null,
  });

  // Preferences & Context
  const [preferences, setPreferences] = useState({
    wheelchair_user: false,
    family_with_children: false,
    elderly: false,
    visually_impaired: false,
    solo_traveler: false,
    international_tourist: false,
  });

  const [parkingLocation, setParkingLocation] = useState(() => {
    return localStorage.getItem('nexus-parking-spot') || '';
  });

  const [parkingInput, setParkingInput] = useState('');

  // Voice Speech API States
  const [isListening, setIsListening] = useState(false);
  const [speakingText, setSpeakingText] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // STT initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setInput(text);
        toast.success(`Speech Captured: "${text}"`);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      setRecognition(rec);
    }
  }, []);

  // Sync parking to localStorage
  const handleSaveParking = async () => {
    if (!parkingInput.trim()) return;
    try {
      const res = await fanCopilotApi.saveParking(parkingInput);
      setParkingLocation(res.saved_location);
      localStorage.setItem('nexus-parking-spot', res.saved_location);
      setParkingInput('');
      toast.success(res.message);
    } catch (err) {
      toast.error("Failed to save parking location.");
    }
  };

  const handleClearParking = () => {
    setParkingLocation('');
    localStorage.removeItem('nexus-parking-spot');
    toast.success("Parking location cleared.");
  };

  // Toggle Preferences
  const handleTogglePreference = async (key) => {
    const nextPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(nextPrefs);
    try {
      await fanCopilotApi.updatePrefs(nextPrefs);
      toast.success("Preferences synchronized with AI.");
    } catch (err) {
      console.error(err);
    }
  };

  // Speech TTS handler
  const speak = (text) => {
    if (!synthRef.current) {
      toast.error("Text-to-speech not supported.");
      return;
    }
    if (speakingText === text) {
      synthRef.current.cancel();
      setSpeakingText(null);
      return;
    }
    synthRef.current.cancel();
    setSpeakingText(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);
    synthRef.current.speak(utterance);
  };

  // Mic capture toggle
  const toggleListening = () => {
    if (!recognition) {
      toast.error("Voice recognition not supported.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      setInput('');
      recognition.start();
    }
  };

  // Send message
  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const res = await multiAgentApi.chat(text, history, memoryContext);
      
      // Save telemetry
      setTelemetryData({
        intents: res.intents,
        chosen_agents: res.chosen_agents,
        telemetry: res.telemetry,
        total_time_ms: res.total_time_ms,
        confidence_score: res.confidence_score,
      });

      // Save memory context
      if (res.memory) {
        setMemoryContext(res.memory);
        if (res.memory.parking_location) {
          setParkingLocation(res.memory.parking_location);
          localStorage.setItem('nexus-parking-spot', res.memory.parking_location);
        }
      }

      const aiMsg = {
        role: 'assistant',
        content: res.response,
        mode: res.intents.includes('emergency') ? 'emergency' : 'chat',
        suggested: [],
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (res.intents.includes('emergency')) {
        toast.error("EMERGENCY ROUTING TRIGGERED — Stay where you are.");
      }
    } catch (err) {
      toast.error("Could not reach co-pilot agent.");
    } finally {
      setLoading(false);
    }
  };

  // Message Actions
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleRegenerate = async (index) => {
    if (index === 0 || loading) return;
    const historyToUse = messages.slice(0, index);
    const lastUserQuery = historyToUse[historyToUse.length - 1];

    if (lastUserQuery && lastUserQuery.role === 'user') {
      setMessages(historyToUse);
      setLoading(true);
      try {
        const historyMapped = historyToUse.slice(0, -1).map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }));
        const res = await multiAgentApi.chat(lastUserQuery.content, historyMapped, memoryContext);
        
        setTelemetryData({
          intents: res.intents,
          chosen_agents: res.chosen_agents,
          telemetry: res.telemetry,
          total_time_ms: res.total_time_ms,
          confidence_score: res.confidence_score,
        });

        if (res.memory) {
          setMemoryContext(res.memory);
        }

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.response, mode: res.intents.includes('emergency') ? 'emergency' : 'chat', suggested: [], timestamp: new Date() }
        ]);
      } catch (err) {
        toast.error("Failed to regenerate response.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8.5rem)]">
      {/* ── Left Sidebar: Preferences & Match Info ─────────────────── */}
      <div className="w-full lg:w-80 flex flex-col gap-4 flex-shrink-0">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="p-3 border-b border-nexus-border">
            <div className="flex gap-1 flex-wrap">
              <Button
                variant={activeTab === 'chat' ? 'primary' : 'ghost'}
                size="sm"
                className="flex-1 text-[11px] px-2 py-1"
                onClick={() => setActiveTab('chat')}
              >
                Prefs
              </Button>
              <Button
                variant={activeTab === 'info' ? 'primary' : 'ghost'}
                size="sm"
                className="flex-1 text-[11px] px-2 py-1"
                onClick={() => setActiveTab('info')}
              >
                Match
              </Button>
              <Button
                variant={activeTab === 'dev' ? 'primary' : 'ghost'}
                size="sm"
                className="flex-1 text-[11px] px-2 py-1"
                onClick={() => setActiveTab('dev')}
              >
                Dev Panel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {activeTab === 'chat' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-nexus-muted mb-2">Personalize My Guidance</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'wheelchair_user', label: 'Wheelchair Route Pref', icon: Accessibility },
                      { key: 'family_with_children', label: 'Traveling with Family', icon: User },
                      { key: 'elderly', label: 'Elderly Assistance', icon: Clock },
                      { key: 'visually_impaired', label: 'Screen/Vocal Guidance', icon: Eye },
                      { key: 'solo_traveler', label: 'Solo Traveler Tips', icon: Sparkles },
                      { key: 'international_tourist', label: 'Foreign Language Helper', icon: Globe },
                    ].map((pref) => {
                      const Icon = pref.icon;
                      return (
                        <button
                          key={pref.key}
                          onClick={() => handleTogglePreference(pref.key)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                            preferences[pref.key]
                              ? 'bg-nexus-primary/20 border-nexus-primary text-nexus-text font-semibold'
                              : 'bg-nexus-surface border-nexus-border text-nexus-muted hover:text-nexus-text'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon size={16} />
                            {pref.label}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${preferences[pref.key] ? 'bg-nexus-primary-light' : 'bg-transparent'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-nexus-border pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-nexus-muted mb-2">Parking Location Saver</h3>
                  {parkingLocation ? (
                    <div className="p-3 rounded-xl bg-nexus-surface2 border border-nexus-border flex justify-between items-center">
                      <div>
                        <p className="text-xs text-nexus-muted">Saved spot:</p>
                        <p className="text-sm font-bold text-nexus-accent">{parkingLocation}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="text-nexus-danger" onClick={handleClearParking}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Lot C Blue"
                        value={parkingInput}
                        onChange={(e) => setParkingInput(e.target.value)}
                        className="py-1"
                      />
                      <Button size="sm" onClick={handleSaveParking}>Save</Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-4 text-sm leading-relaxed text-nexus-muted">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-nexus-muted mb-2">Live Fixture Details</h3>
                  <p className="font-semibold text-nexus-text text-base">{matchesInfo.teams}</p>
                  <p>{matchesInfo.venue}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 border-y border-nexus-border/60 py-3">
                  <div>
                    <span className="text-xs text-nexus-muted block">Kickoff</span>
                    <span className="font-semibold text-nexus-text">{matchesInfo.kickoff}</span>
                  </div>
                  <div>
                    <span className="text-xs text-nexus-muted block">Gates Open</span>
                    <span className="font-semibold text-nexus-text">{matchesInfo.gatesOpen}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nexus-danger mb-1.5">Security Guidelines</h4>
                  <p className="text-xs">{matchesInfo.security}</p>
                </div>
              </div>
            )}

            {activeTab === 'dev' && (
              <div className="space-y-4 text-xs text-nexus-muted leading-relaxed">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-nexus-accent mb-2">Multi-Agent Diagnostics</h3>
                  <div className="p-3 bg-nexus-surface2 border border-nexus-border rounded-xl space-y-2">
                    <p className="flex justify-between">
                      <span>Total latency:</span>
                      <span className="font-mono text-nexus-text font-bold">
                        {telemetryData ? `${telemetryData.total_time_ms} ms` : '0 ms'}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span>Confidence score:</span>
                      <span className="font-mono text-nexus-success font-bold">
                        {telemetryData ? `${Math.round(telemetryData.confidence_score * 100)}%` : '0%'}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span>Tokens processed:</span>
                      <span className="font-mono text-nexus-text">1,248 (placeholder)</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nexus-muted mb-2">Detected Intents</h4>
                  <div className="flex flex-wrap gap-1">
                    {telemetryData && telemetryData.intents.length > 0 ? (
                      telemetryData.intents.map((intent) => (
                        <Badge key={intent} variant="accent" size="sm" className="capitalize">
                          {intent}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[10px] text-nexus-muted">No intents detected yet</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nexus-muted mb-2">Selected Sub-Agents</h4>
                  <div className="space-y-1.5">
                    {telemetryData && telemetryData.telemetry.length > 0 ? (
                      telemetryData.telemetry.map((tel, idx) => (
                        <div key={idx} className="flex justify-between p-2 bg-nexus-surface border border-nexus-border rounded-lg items-center">
                          <span className="font-semibold text-nexus-text">{tel.agent_name}</span>
                          <span className="font-mono text-[10px] text-nexus-muted">{tel.execution_time_ms} ms</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-nexus-muted">No agent execution history.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nexus-muted mb-2">Active AI Memory Context</h4>
                  <div className="p-3 bg-nexus-surface border border-nexus-border rounded-xl space-y-1.5 font-mono text-[10px]">
                    <p className="flex justify-between border-b border-nexus-border/40 pb-1">
                      <span>GATE:</span>
                      <span className="text-nexus-text font-bold">{memoryContext?.current_gate || 'None'}</span>
                    </p>
                    <p className="flex justify-between border-b border-nexus-border/40 pb-1">
                      <span>SEAT:</span>
                      <span className="text-nexus-text font-bold">{memoryContext?.seat_number || 'None'}</span>
                    </p>
                    <p className="flex justify-between border-b border-nexus-border/40 pb-1">
                      <span>PARKING:</span>
                      <span className="text-nexus-text font-bold">{memoryContext?.parking_location || 'None'}</span>
                    </p>
                    <p className="flex justify-between border-b border-nexus-border/40 pb-1">
                      <span>LANGUAGE:</span>
                      <span className="text-nexus-text font-bold">{memoryContext?.preferred_language || 'None'}</span>
                    </p>
                    <p className="flex justify-between border-b border-nexus-border/40 pb-1">
                      <span>FOOD PREF:</span>
                      <span className="text-nexus-text font-bold">{memoryContext?.food_preference || 'None'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>TRANSIT:</span>
                      <span className="text-nexus-text font-bold">{memoryContext?.transportation_method || 'None'}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Right Panel: Chat Interface ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 nexus-card overflow-hidden">
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-nexus-surface2 border border-nexus-border' : 'bg-primary-gradient'
              }`}>
                {msg.role === 'user' ? 'U' : <Sparkles size={16} className="text-white" />}
              </div>

              <div className="max-w-[80%] space-y-1.5">
                <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-nexus-primary text-white rounded-tr-none shadow-nexus'
                    : msg.mode === 'emergency'
                      ? 'bg-nexus-danger/10 border-2 border-nexus-danger text-nexus-text rounded-tl-none'
                      : 'bg-nexus-surface2 border border-nexus-border text-nexus-text rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Actions on messages */}
                  <div className="flex justify-end gap-1.5 mt-2 pt-2 border-t border-nexus-border/40 text-nexus-muted">
                    <button
                      onClick={() => copyToClipboard(msg.content)}
                      className="p-1 hover:text-nexus-text transition-colors"
                      title="Copy response"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => speak(msg.content)}
                      className="p-1 hover:text-nexus-accent transition-colors"
                      title="Read aloud"
                    >
                      {speakingText === msg.content ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                    {msg.role === 'assistant' && index > 0 && (
                      <button
                        onClick={() => handleRegenerate(index)}
                        className="p-1 hover:text-nexus-primary-light transition-colors"
                        title="Regenerate"
                      >
                        <RefreshCw size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div className={`text-[10px] text-nexus-muted px-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* Sub Suggested prompt chips for the last message */}
                {index === messages.length - 1 && msg.suggested && msg.suggested.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {msg.suggested.map((act) => (
                      <button
                        key={act}
                        onClick={() => handleSend(act)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-nexus-surface border border-nexus-border text-nexus-muted hover:text-nexus-text transition-all"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-nexus-surface2 border border-nexus-border flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin text-nexus-muted" />
                <span className="text-xs text-nexus-muted">Co-pilot is writing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested chips (show only when screen only has welcome message) */}
        {messages.length === 1 && (
          <div className="p-4 border-t border-nexus-border bg-nexus-surface/30">
            <p className="text-xs text-nexus-muted mb-2 font-semibold">Suggested Questions</p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {suggestedPrompts.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="text-xs px-3 py-1.5 rounded-full bg-nexus-surface2 border border-nexus-border hover:border-nexus-primary/50 text-nexus-muted hover:text-nexus-text transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sticky Input Bar */}
        <div className="p-4 border-t border-nexus-border bg-nexus-surface2">
          {/* Quick Action Floating Bar */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
            {[
              { label: 'Find Seat', action: 'Guide me to Seat A23', icon: MapPin },
              { label: 'Food', action: 'Where is the nearest food stall?', icon: Utensils },
              { label: 'Washroom', action: 'Where is the nearest washroom?', icon: HelpCircle },
              { label: 'Emergency', action: 'Emergency Help', icon: ShieldAlert, danger: true },
              { label: 'Parking', action: 'Take me back to my car', icon: Car },
              { label: 'Accessibility', action: 'Find wheelchair accessible route.', icon: Accessibility },
            ].map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.label}
                  onClick={() => handleSend(qa.action)}
                  className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border flex-shrink-0 transition-all ${
                    qa.danger
                      ? 'bg-nexus-danger/25 border-nexus-danger text-nexus-danger hover:bg-nexus-danger hover:text-white'
                      : 'bg-nexus-surface border-nexus-border text-nexus-muted hover:text-nexus-text'
                  }`}
                >
                  <Icon size={12} />
                  {qa.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask: 'Where is Section 102?' or 'Where is Halal food?'"
              rows={1}
              className="nexus-input flex-1 resize-none"
            />
            <Button
              size="icon"
              variant={isListening ? 'accent' : 'secondary'}
              onClick={toggleListening}
              title={isListening ? 'Stop listening' : 'Start listening'}
              className="w-10 h-10 rounded-xl"
            >
              {isListening ? <MicOff size={16} className="animate-pulse" /> : <Mic size={16} />}
            </Button>
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl"
            >
              <Send size={16} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => { setMessages([{ role: 'assistant', content: 'Welcome to StadiumMind AI! I am your intelligent FIFA World Cup stadium assistant. Ask me anything naturally.', timestamp: new Date() }]); stopSpeaking(); }}
              title="Clear chat"
              className="w-10 h-10 rounded-xl"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
