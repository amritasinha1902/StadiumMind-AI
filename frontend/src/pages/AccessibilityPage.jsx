import { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Eye, ShieldAlert,
  Navigation, ZoomIn, Accessibility, Upload, Copy, Play, Square, Settings as SettingsIcon, MapPin, Loader2, Sparkles, Building, CornerDownRight
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAccessibilitySettings } from '@/hooks/useAccessibilitySettings';
import { accessibilityApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function AccessibilityPage() {
  const { settings, updateSetting, toggleSetting } = useAccessibilitySettings();

  // Modal open states
  const [activeModal, setActiveModal] = useState(null); // 'voice' | 'ocr' | 'scene' | 'objects' | 'sos' | 'guidance' | 'settings'

  // Text-To-Speech (TTS) State
  const [speakingText, setSpeakingText] = useState(null);
  const synthRef = useRef(window.speechSynthesis);

  // Speech-To-Text (STT) State
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // ── Voice Assistant State ──────────────────────────────────────────
  const [voiceMessages, setVoiceMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your accessibility co-pilot. You can speak or type your question below. How can I help you today?', timestamp: new Date() }
  ]);
  const [voiceInput, setVoiceInput] = useState('');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ── OCR Sign Reader State ─────────────────────────────────────────
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // ── Scene Description State ────────────────────────────────────────
  const [sceneImage, setSceneImage] = useState(null);
  const [sceneLoading, setSceneLoading] = useState(false);
  const [sceneResult, setSceneResult] = useState(null);

  // ── Object Detection State ─────────────────────────────────────────
  const [objImage, setObjImage] = useState(null);
  const [objLoading, setObjLoading] = useState(false);
  const [objResult, setObjResult] = useState(null);

  // ── SOS State ──────────────────────────────────────────────────────
  const [sosLoading, setSosLoading] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [sosLocation, setSosLocation] = useState('MetLife Stadium, Concourse Sector 102');
  const [sosType, setSosType] = useState('medical'); // 'medical' | 'security' | 'assistance'
  const [sosNotes, setSosNotes] = useState('');

  // ── Audio Guidance State ───────────────────────────────────────────
  const [audioStep, setAudioStep] = useState(0);
  const [isPlayingGuidance, setIsPlayingGuidance] = useState(false);

  const guidanceSteps = [
    { text: "Elevator 2 is ahead in 10 meters on your left side. Turn left there.", location: "Concourse South" },
    { text: "Enter elevator and press Level 2 button. Floor announcements are active.", location: "Elevator Lobby" },
    { text: "Exit elevator and turn right. Accessible toilets are located 15 meters ahead.", location: "Level 2 Corridor" },
    { text: "Proceed to Seat 14 in Section 102. There are 3 tactile steps down with handrails.", location: "Section 102 Gate" }
  ];

  // ── Browser Web Speech Initialisation ──────────────────────────────
  useEffect(() => {
    // Initialise Web Speech STT
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setVoiceInput(text);
        toast.success(`Heard: "${text}"`);
      };

      rec.onerror = (err) => {
        console.error('Speech recognition error', err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [voiceMessages, voiceLoading]);

  // Clean speaking state on unmount or modal close
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [activeModal]);

  // ── TTS helper functions ────────────────────────────────────────────
  const speakText = (text) => {
    if (!synthRef.current) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingText === text) {
      // Toggle stop if speaking same text
      synthRef.current.cancel();
      setSpeakingText(null);
      return;
    }

    synthRef.current.cancel();
    setSpeakingText(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingText(null);
    };

    utterance.onerror = () => {
      setSpeakingText(null);
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setSpeakingText(null);
    }
  };

  // ── STT trigger ────────────────────────────────────────────────────
  const toggleListening = () => {
    if (!recognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setVoiceInput('');
      recognition.start();
    }
  };

  // ── Voice Assistant API interaction ─────────────────────────────────
  const handleVoiceSend = async () => {
    const text = voiceInput.trim();
    if (!text || voiceLoading) return;

    setVoiceInput('');
    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setVoiceMessages((prev) => [...prev, userMsg]);
    setVoiceLoading(true);

    try {
      // Map history to backend expected structure
      const history = voiceMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const res = await accessibilityApi.chat(text, history, 'Section 102 Concourse');
      const aiMsg = { role: 'assistant', content: res.answer, timestamp: new Date() };
      setVoiceMessages((prev) => [...prev, aiMsg]);

      // Auto read response if option enabled
      if (settings.autoReadResponses || settings.voiceResponses) {
        speakText(res.answer);
      }
    } catch (err) {
      toast.error("Could not communicate with AI assistant.");
      console.error(err);
    } finally {
      setVoiceLoading(false);
    }
  };

  // ── OCR Sign Analysis ──────────────────────────────────────────────
  const handleOcrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrImage(URL.createObjectURL(file));
    setOcrLoading(true);
    setOcrResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await accessibilityApi.analyzeOcr(formData);
      setOcrResult(res);
      toast.success("Sign analyzed successfully!");
      if (settings.autoReadResponses) {
        speakText(`Sign text detected: ${res.extracted_text}`);
      }
    } catch (err) {
      toast.error("Failed to run OCR sign analysis.");
      console.error(err);
    } finally {
      setOcrLoading(false);
    }
  };

  // ── Scene Description Analysis ─────────────────────────────────────
  const handleSceneUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSceneImage(URL.createObjectURL(file));
    setSceneLoading(true);
    setSceneResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await accessibilityApi.analyzeScene(formData);
      setSceneResult(res);
      toast.success("Scene analyzed successfully!");
      if (settings.autoReadResponses) {
        speakText(res.description);
      }
    } catch (err) {
      toast.error("Failed to run scene description.");
      console.error(err);
    } finally {
      setSceneLoading(false);
    }
  };

  // ── Object Detection Analysis ──────────────────────────────────────
  const handleObjUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setObjImage(URL.createObjectURL(file));
    setObjLoading(true);
    setObjResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await accessibilityApi.detect_objects ? await accessibilityApi.detectObjects(formData) : await accessibilityApi.detectObjects(formData);
      setObjResult(res);
      toast.success("Accessibility objects identified.");
    } catch (err) {
      toast.error("Failed to run object detection.");
      console.error(err);
    } finally {
      setObjLoading(false);
    }
  };

  // ── Trigger SOS Alert ──────────────────────────────────────────────
  const handleTriggerSos = async () => {
    setSosLoading(true);
    setSosResult(null);
    try {
      const res = await accessibilityApi.triggerSos(sosLocation, sosType, sosNotes);
      setSosResult(res);
      speakText(`Emergency alert dispatched. ${res.calming_instructions}`);
      toast.error("SOS Alert Dispatched to Mission Control!");
    } catch (err) {
      toast.error("Failed to dispatch SOS alert.");
      console.error(err);
    } finally {
      setSosLoading(false);
    }
  };

  // ── Audio Guidance control ─────────────────────────────────────────
  const startGuidance = () => {
    setIsPlayingGuidance(true);
    setAudioStep(0);
    speakText(guidanceSteps[0].text);
  };

  const nextGuidanceStep = () => {
    if (audioStep < guidanceSteps.length - 1) {
      const nextStep = audioStep + 1;
      setAudioStep(nextStep);
      speakText(guidanceSteps[nextStep].text);
    } else {
      setIsPlayingGuidance(false);
      speakText("You have reached your destination. Guidance complete.");
      toast.success("Destination reached!");
    }
  };

  const stopGuidance = () => {
    setIsPlayingGuidance(false);
    stopSpeaking();
  };

  // Dashboard configuration list
  const dashboardCards = [
    {
      id: 'voice',
      icon: Mic,
      title: 'Voice Assistant',
      desc: 'Ask questions verbally or read AI answers using local Speech-To-Text.',
      actionLabel: 'Open Assistant',
      action: () => setActiveModal('voice'),
    },
    {
      id: 'ocr',
      icon: Eye,
      title: 'Read Stadium Signs',
      desc: 'Upload or capture an image of stadium signage to read and speak text aloud.',
      actionLabel: 'Scan Signs',
      action: () => setActiveModal('ocr'),
    },
    {
      id: 'scene',
      icon: Building,
      title: 'Scene Description',
      desc: 'Upload a picture of your surroundings to get a detailed layout description.',
      actionLabel: 'Describe Area',
      action: () => setActiveModal('scene'),
    },
    {
      id: 'objects',
      icon: Accessibility,
      title: 'Object Detection',
      desc: 'Identify ramps, elevators, and stairs visually in real-time.',
      actionLabel: 'Detect Features',
      action: () => setActiveModal('objects'),
    },
    {
      id: 'sos',
      icon: ShieldAlert,
      title: 'Emergency SOS',
      desc: 'Trigger calming instructions and dispatch urgent staff support.',
      actionLabel: 'SOS Panel',
      action: () => setActiveModal('sos'),
    },
    {
      id: 'guidance',
      icon: Navigation,
      title: 'Audio Guidance',
      desc: 'Follow simulated voice navigational cues section by section.',
      actionLabel: 'Start Audio Tour',
      action: () => setActiveModal('guidance'),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accessibility Co-Pilot"
        subtitle="Generative AI services optimized for differently-abled and elderly fans"
        icon={Accessibility}
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={settings.highContrast ? 'accent' : 'secondary'}
              leftIcon={<Eye size={14} />}
              onClick={() => toggleSetting('highContrast')}
            >
              High Contrast
            </Button>
            <Button
              size="sm"
              variant={settings.wheelchairMode ? 'accent' : 'secondary'}
              leftIcon={<Accessibility size={14} />}
              onClick={() => toggleSetting('wheelchairMode')}
            >
              Wheelchair Pref
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<SettingsIcon size={14} />}
              onClick={() => setActiveModal('settings')}
            >
              Settings
            </Button>
          </div>
        }
      />

      {/* Quick Text Size control row */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ZoomIn size={18} className="text-nexus-primary-light" />
            <p className="text-sm font-semibold text-nexus-text">Quick Text Size adjustment:</p>
          </div>
          <div className="flex gap-1.5 w-full sm:w-auto">
            {['small', 'medium', 'large', 'extra-large'].map((size) => (
              <Button
                key={size}
                size="sm"
                variant={settings.textSize === size ? 'primary' : 'secondary'}
                className="flex-1 sm:flex-none capitalize"
                onClick={() => updateSetting('textSize', size)}
              >
                {size.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card key={card.id} hover className="flex flex-col justify-between h-64">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-nexus-primary/20 border border-nexus-primary/30 flex items-center justify-center">
                    <IconComponent size={24} className="text-nexus-primary-light" />
                  </div>
                  {card.id === 'sos' && <Badge variant="danger" dot>Emergency</Badge>}
                  {card.id === 'voice' && <Badge variant="accent">AI Voice</Badge>}
                </div>
                <CardTitle className="mb-2">{card.title}</CardTitle>
                <p className="text-sm text-nexus-muted leading-relaxed">{card.desc}</p>
              </div>
              <Button
                className="w-full mt-4"
                variant={card.id === 'sos' ? 'danger' : 'primary'}
                onClick={card.action}
              >
                {card.actionLabel}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* ── 1. Voice Assistant Modal ────────────────────────────────────── */}
      <Modal
        isOpen={activeModal === 'voice'}
        onClose={() => setActiveModal(null)}
        title="AI Voice Assistant"
        size="lg"
      >
        <div className="flex flex-col h-[500px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
            {voiceMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-nexus-surface2 border border-nexus-border' : 'bg-primary-gradient'}`}>
                  {msg.role === 'user' ? 'U' : <Mic size={16} className="text-white" />}
                </div>
                <div className={`relative max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-nexus-primary text-white rounded-tr-none' : 'nexus-card text-nexus-text rounded-tl-none'}`}>
                  {msg.content}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => speakText(msg.content)}
                      className="absolute bottom-1 right-2 p-1 text-nexus-muted hover:text-nexus-accent transition-colors"
                      title="Read aloud"
                    >
                      {speakingText === msg.content ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {voiceLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center flex-shrink-0">
                  <Mic size={16} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none nexus-card flex items-center gap-1.5">
                  <Loader2 size={16} className="animate-spin text-nexus-muted" />
                  <span className="text-xs text-nexus-muted">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <div className="flex items-end gap-2 p-2 border-t border-nexus-border pt-4">
            <textarea
              value={voiceInput}
              onChange={(e) => setVoiceInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleVoiceSend(); } }}
              placeholder="Ask directions, washroom locations..."
              rows={1}
              className="nexus-input flex-1 resize-none"
            />
            <Button
              size="icon"
              variant={isListening ? 'accent' : 'secondary'}
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Start speaking"}
            >
              {isListening ? <MicOff size={16} className="animate-pulse" /> : <Mic size={16} />}
            </Button>
            <Button onClick={handleVoiceSend} disabled={!voiceInput.trim() || voiceLoading}>
              Send
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── 2. Read Signs OCR Modal ────────────────────────────────────── */}
      <Modal
        isOpen={activeModal === 'ocr'}
        onClose={() => setActiveModal(null)}
        title="Read Stadium Signs"
        size="md"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-nexus-border rounded-xl p-6 text-center hover:border-nexus-primary transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleOcrUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload size={32} className="mx-auto mb-2 text-nexus-muted" />
            <p className="text-sm text-nexus-text font-medium">Click to upload or capture sign image</p>
            <p className="text-xs text-nexus-muted mt-1">Supports JPEG, PNG up to 5MB</p>
          </div>

          {ocrImage && (
            <div className="relative rounded-xl overflow-hidden max-h-48 border border-nexus-border">
              <img src={ocrImage} alt="Uploaded sign" className="w-full h-full object-cover" />
            </div>
          )}

          {ocrLoading && (
            <div className="py-6 text-center flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-nexus-primary" />
              <span className="text-sm text-nexus-muted">Processing OCR...</span>
            </div>
          )}

          {ocrResult && (
            <Card className="bg-nexus-surface2/50 border border-nexus-border">
              <div className="flex items-center justify-between mb-3 border-b border-nexus-border pb-2">
                <span className="text-xs font-semibold text-nexus-accent">Extracted Signage Text</span>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Copy size={12} />}
                    onClick={() => {
                      navigator.clipboard.writeText(ocrResult.extracted_text);
                      toast.success("Copied to clipboard!");
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={speakingText === ocrResult.extracted_text ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    onClick={() => speakText(ocrResult.extracted_text)}
                  >
                    Speak
                  </Button>
                </div>
              </div>
              <p className="text-base text-nexus-text font-mono whitespace-pre-line leading-relaxed">
                {ocrResult.extracted_text}
              </p>
            </Card>
          )}
        </div>
      </Modal>

      {/* ── 3. Scene Description Modal ─────────────────────────────────── */}
      <Modal
        isOpen={activeModal === 'scene'}
        onClose={() => setActiveModal(null)}
        title="Scene Description AI"
        size="md"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-nexus-border rounded-xl p-6 text-center hover:border-nexus-primary transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleSceneUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload size={32} className="mx-auto mb-2 text-nexus-muted" />
            <p className="text-sm text-nexus-text font-medium">Click to upload or capture surrounding image</p>
          </div>

          {sceneImage && (
            <div className="relative rounded-xl overflow-hidden max-h-48 border border-nexus-border">
              <img src={sceneImage} alt="Uploaded scene" className="w-full h-full object-cover" />
            </div>
          )}

          {sceneLoading && (
            <div className="py-6 text-center flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-nexus-primary" />
              <span className="text-sm text-nexus-muted">Generating description...</span>
            </div>
          )}

          {sceneResult && (
            <div className="space-y-3">
              <Card className="bg-nexus-surface2/50 border border-nexus-border">
                <div className="flex items-center justify-between mb-3 border-b border-nexus-border pb-2">
                  <span className="text-xs font-semibold text-nexus-accent">AI Visual Scene Description</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={speakingText === sceneResult.description ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    onClick={() => speakText(sceneResult.description)}
                  >
                    Speak Description
                  </Button>
                </div>
                <p className="text-sm text-nexus-text leading-relaxed">
                  {sceneResult.description}
                </p>
              </Card>

              {sceneResult.barriers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nexus-danger mb-1.5">Obstacles Detected</h4>
                  <ul className="space-y-1">
                    {sceneResult.barriers.map((b, i) => (
                      <li key={i} className="text-xs text-nexus-text flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-nexus-danger" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ── 4. Object Detection Modal ──────────────────────────────────── */}
      <Modal
        isOpen={activeModal === 'objects'}
        onClose={() => setActiveModal(null)}
        title="Object Detection AI"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-nexus-border rounded-xl p-6 text-center hover:border-nexus-primary transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleObjUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload size={32} className="mx-auto mb-2 text-nexus-muted" />
              <p className="text-sm text-nexus-text font-medium">Click to upload image of walkway</p>
            </div>

            {objImage && (
              <div className="relative rounded-xl overflow-hidden border border-nexus-border">
                <img src={objImage} alt="Uploaded source" className="w-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-display font-semibold text-nexus-text">Detected Accessibility Features</h3>

            {objLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-nexus-primary" />
                <span className="text-sm text-nexus-muted">Locating physical landmarks...</span>
              </div>
            ) : objResult ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  {objResult.objects.map((obj, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-nexus-surface2 border border-nexus-border/50">
                      <div>
                        <p className="text-sm font-semibold text-nexus-text">{obj.label}</p>
                        <p className="text-xs text-nexus-muted">Confidence: {Math.round(obj.confidence * 100)}%</p>
                      </div>
                      <Badge variant={obj.label.includes("Ramp") || obj.label.includes("Elevator") ? "success" : "default"}>
                        Detected
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-nexus-muted leading-relaxed mt-2 italic">
                  Note: Standard detection runs local boundary coordinates.
                </p>
              </div>
            ) : (
              <div className="py-16 text-center text-nexus-muted border border-nexus-border/40 rounded-xl">
                Upload a walkway or lobby view to detect elevators, ramps, doors, or stairs.
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* ── 5. Emergency SOS Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={activeModal === 'sos'}
        onClose={() => { setActiveModal(null); setSosResult(null); }}
        title="Emergency SOS Center"
        size="md"
      >
        <div className="space-y-4">
          {!sosResult ? (
            <div className="space-y-4 text-center py-6">
              <div className="w-20 h-20 rounded-full bg-nexus-danger/20 border-2 border-nexus-danger flex items-center justify-center mx-auto mb-4 animate-pulse">
                <ShieldAlert size={40} className="text-nexus-danger" />
              </div>
              <h3 className="text-xl font-bold text-nexus-text">Trigger Emergency Dispatch?</h3>
              <p className="text-sm text-nexus-muted max-w-sm mx-auto">
                This will alert stadium security, dispatch the nearest volunteer and medical team, and open calming audio guidelines.
              </p>

              <div className="space-y-3 text-left max-w-md mx-auto pt-4 border-t border-nexus-border">
                <Input
                  label="Confirm Location"
                  value={sosLocation}
                  onChange={(e) => setSosLocation(e.target.value)}
                />
                <div>
                  <label className="text-sm font-medium text-nexus-text mb-1 block">Emergency Type</label>
                  <select
                    value={sosType}
                    onChange={(e) => setSosType(e.target.value)}
                    className="nexus-input w-full bg-nexus-surface border border-nexus-border"
                  >
                    <option value="medical">Medical Event</option>
                    <option value="security">Security Threat / Harassment</option>
                    <option value="assistance">Mobility / Technical Breakdown</option>
                  </select>
                </div>
                <Input
                  label="Additional Notes (Optional)"
                  placeholder="e.g. wheelchair battery failure, chest pain..."
                  value={sosNotes}
                  onChange={(e) => setSosNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-center pt-6">
                <Button variant="ghost" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button variant="danger" size="lg" onClick={handleTriggerSos} loading={sosLoading}>
                  CONFIRM DISPATCH
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-nexus-danger/10 border border-nexus-danger/30 text-center">
                <p className="text-lg font-bold text-nexus-danger animate-pulse">HELP IS DISPATCHED</p>
                <p className="text-xs text-nexus-muted mt-1">ID: {sosResult.emergency_id}</p>
              </div>

              <Card className="bg-nexus-surface2/50 border border-nexus-border">
                <div className="flex items-center justify-between mb-3 border-b border-nexus-border pb-2">
                  <span className="text-xs font-semibold text-nexus-accent">Calming Instructions</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={speakingText === sosResult.calming_instructions ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    onClick={() => speakText(sosResult.calming_instructions)}
                  >
                    Speak Response
                  </Button>
                </div>
                <p className="text-sm text-nexus-text leading-relaxed">
                  {sosResult.calming_instructions}
                </p>
              </Card>

              <div className="space-y-2">
                <div className="flex justify-between p-2 rounded bg-nexus-surface border border-nexus-border/50 text-xs">
                  <span className="text-nexus-muted">Nearest Medical:</span>
                  <span className="font-semibold text-nexus-text text-right">{sosResult.nearest_medical}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-nexus-surface border border-nexus-border/50 text-xs">
                  <span className="text-nexus-muted">Nearest Coordinator:</span>
                  <span className="font-semibold text-nexus-text text-right">{sosResult.nearest_volunteer}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-nexus-surface border border-nexus-border/50 text-xs">
                  <span className="text-nexus-muted">Operations Center Call:</span>
                  <span className="font-semibold text-nexus-accent text-right">{sosResult.emergency_contact}</span>
                </div>
              </div>

              <Button className="w-full mt-4" onClick={() => { setActiveModal(null); setSosResult(null); stopSpeaking(); }}>
                I am Safe / Close
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* ── 6. Audio Guidance Tour Modal ───────────────────────────────── */}
      <Modal
        isOpen={activeModal === 'guidance'}
        onClose={stopGuidance}
        title="Simulated Audio Navigation Guidance"
        size="md"
      >
        <div className="space-y-6 py-4 text-center">
          {!isPlayingGuidance ? (
            <div className="space-y-4">
              <Navigation size={48} className="mx-auto text-nexus-primary-light animate-bounce" />
              <h3 className="text-lg font-semibold text-nexus-text">Start Voice Navigation Simulation</h3>
              <p className="text-sm text-nexus-muted max-w-sm mx-auto">
                Trigger step-by-step vocal instructions corresponding to Section 102 entry points.
              </p>
              <Button size="lg" leftIcon={<Play size={16} />} onClick={startGuidance}>
                Start Simulation
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="nexus-card p-6 flex flex-col justify-center items-center gap-4 bg-nexus-surface2">
                <MapPin size={24} className="text-nexus-accent" />
                <Badge variant="accent">{guidanceSteps[audioStep].location}</Badge>
                <p className="text-lg font-medium text-nexus-text leading-relaxed">
                  &ldquo;{guidanceSteps[audioStep].text}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-nexus-border pt-4">
                <span className="text-xs text-nexus-muted">Step {audioStep + 1} of {guidanceSteps.length}</span>
                <div className="flex gap-2">
                  <Button variant="secondary" leftIcon={<Square size={14} />} onClick={stopGuidance}>
                    Stop
                  </Button>
                  <Button
                    rightIcon={audioStep < guidanceSteps.length - 1 ? <CornerDownRight size={14} /> : null}
                    onClick={nextGuidanceStep}
                  >
                    {audioStep < guidanceSteps.length - 1 ? "Next Step" : "Finish"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── 7. Settings Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
        title="Accessibility Settings"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-nexus-muted">
            Configure system settings. Preferences are persisted automatically.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { key: 'highContrast', label: 'High Contrast Mode', desc: 'Converts background to solid black, text to white/yellow.' },
              { key: 'largerButtons', label: 'Larger Action Buttons', desc: 'Increases touch padding and text readability.' },
              { key: 'voiceResponses', label: 'Voice Response Support', desc: 'Enable audio outputs on voice agent chats.' },
              { key: 'autoReadResponses', label: 'Auto-Read AI Answers', desc: 'Automatically speaks responses when completed.' },
              { key: 'reduceAnimations', label: 'Reduce Motion and Animations', desc: 'Turns off transition layouts and animations.' },
              { key: 'screenReaderFriendly', label: 'Screen Reader Friendly Mode', desc: 'Adjusts ARIA labeling hierarchy for screen tools.' },
              { key: 'wheelchairMode', label: 'Prefer Wheelchair Routes', desc: 'Alters voice and maps navigation to use elevators/ramps.' },
            ].map((cfg) => (
              <label
                key={cfg.key}
                className="flex items-start gap-3 p-3 rounded-xl bg-nexus-surface2 border border-nexus-border/50 hover:bg-nexus-border/30 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={settings[cfg.key]}
                  onChange={() => toggleSetting(cfg.key)}
                  className="mt-1 accent-nexus-primary rounded"
                />
                <div>
                  <p className="text-sm font-semibold text-nexus-text">{cfg.label}</p>
                  <p className="text-xs text-nexus-muted mt-0.5 leading-snug">{cfg.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-4 border-t border-nexus-border text-right">
            <Button onClick={() => setActiveModal(null)}>Save & Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
