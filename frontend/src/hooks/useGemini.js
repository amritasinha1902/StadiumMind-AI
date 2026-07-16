import { useState, useCallback, useRef } from 'react';
import { aiApi } from '@/services/api';

/** 
 * One-shot content generation.
 */
export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const generate = useCallback(async (prompt, systemInstruction = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.chat(
        prompt,
        [],
        {}
      );
      setResponse(result.response);
      return result.response;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    const userMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const history = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await aiApi.chat(
        text,
        history,
        ""
      );

      const aiMessage = {
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      return result.response;

    } catch (err) {
      console.error(err);
      setError(err.message);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to contact AI backend.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    loading,
    error,
    clearChat,
  };
}