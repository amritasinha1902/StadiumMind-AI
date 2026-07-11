import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Mic, Paperclip, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card   from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge  from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { useGeminiChat } from '@/hooks/useGemini';

const suggestions = [
  'What is the current crowd density at the North Stand?',
  'Summarise today\'s security incidents',
  'Give me a volunteer performance snapshot',
  'What venue system alerts are active?',
  'Translate "Please proceed to your seat" to Spanish',
  'Generate a match day operations summary',
];

export default function AIAssistantPage() {
  const [input, setInput]       = useState('');
  const messagesEndRef            = useRef(null);
  const textareaRef               = useRef(null);
  const { messages, sendMessage, loading, clearChat } = useGeminiChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(text).catch(() => {});
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      <PageHeader
        title="AI Assistant"
        subtitle="Powered by Google Gemini · Your intelligent stadium co-pilot"
        icon={Bot}
        actions={
          <Button size="sm" variant="ghost" leftIcon={<RefreshCw size={14} />} onClick={clearChat}>
            Clear Chat
          </Button>
        }
      />

      <div className="flex-1 flex flex-col min-h-0 gap-4">
        {/* Message area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <div className="w-20 h-20 rounded-3xl bg-primary-gradient flex items-center justify-center mb-6 shadow-glow animate-pulse-glow">
                <Bot size={36} className="text-white" />
              </div>
              <h2 className="text-3xl font-display font-black text-nexus-text mb-2">How can I help you?</h2>
              <p className="text-nexus-muted max-w-md mb-8 text-sm leading-relaxed">
                Ask anything about stadium operations, real-time fan services, emergency support, volunteer rosters, or venue metrics.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="p-4 rounded-2xl text-left text-sm text-nexus-muted hover:text-nexus-text nexus-card border border-nexus-border/60 hover:border-nexus-primary/40 hover:scale-[1.02] hover:shadow-nexus transition-all duration-200"
                  >
                    💡 {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'assistant' ? (
                  <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center flex-shrink-0 shadow-nexus">
                    <Bot size={18} className="text-white" />
                  </div>
                ) : (
                  <Avatar name="You" size="sm" className="w-9 h-9 shadow-sm" />
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-nexus-primary text-white rounded-tr-none shadow-nexus border border-nexus-primary-dark/20'
                      : 'nexus-card rounded-tl-none text-nexus-text border border-nexus-border shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center flex-shrink-0 shadow-nexus">
                <Bot size={16} className="text-white" />
              </div>
              <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm nexus-card border border-nexus-primary/30 shadow-glow relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-nexus-primary/10 via-nexus-accent/5 to-nexus-primary/10 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                <div className="relative flex items-center gap-2">
                  <span className="text-xs font-display font-bold text-nexus-primary-light uppercase tracking-wider">StadiumMind AI</span>
                  <div className="flex gap-1 items-center">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full bg-nexus-accent"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="nexus-card p-3 flex-shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about stadium ops, fan services, security…"
              rows={1}
              className="nexus-input flex-1 resize-none min-h-[44px] max-h-32 py-3 text-sm leading-relaxed"
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                className="p-2 rounded-lg text-nexus-muted hover:text-nexus-text hover:bg-nexus-surface2 transition-colors"
                aria-label="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <button
                className="p-2 rounded-lg text-nexus-muted hover:text-nexus-text hover:bg-nexus-surface2 transition-colors"
                aria-label="Voice input"
              >
                <Mic size={18} />
              </button>
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl"
                aria-label="Send message"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 px-1">
            <Badge variant="primary" size="sm">
              <Sparkles size={9} />
              Gemini 1.5 Flash
            </Badge>
            <span className="text-[10px] text-nexus-muted">Enter to send · Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
