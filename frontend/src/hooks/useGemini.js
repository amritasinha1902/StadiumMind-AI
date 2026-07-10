import { useState, useCallback, useRef } from 'react';
import geminiService from '@/services/gemini';

/**
 * One-shot content generation.
 */
export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [response, setResponse] = useState(null);

  const generate = useCallback(async (prompt, systemInstruction = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await geminiService.generateContent(prompt, systemInstruction);
      setResponse(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return { generate, loading, error, response, reset };
}

/**
 * Multi-turn chat session with Gemini.
 */
export function useGeminiChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const sessionRef              = useRef(null);

  const ensureSession = useCallback(() => {
    if (!sessionRef.current) {
      sessionRef.current = geminiService.startChat();
    }
    return sessionRef.current;
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    const userMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const session = ensureSession();
      const reply   = await session.sendMessage(text);
      const aiMessage = { role: 'assistant', content: reply, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMessage]);
      return reply;
    } catch (err) {
      setError(err.message);
      setMessages((prev) => prev.filter((m) => m !== userMessage));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ensureSession]);

  const clearChat = useCallback(() => {
    sessionRef.current = null;
    setMessages([]);
    setError(null);
  }, []);

  return { messages, sendMessage, loading, error, clearChat };
}
