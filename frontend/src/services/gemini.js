const GEMINI_API_KEY  = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL    = 'gemini-1.5-flash';

class GeminiChatSession {
  #client;
  #history;

  constructor(client, initialHistory = []) {
    this.#client  = client;
    this.#history = [...initialHistory];
  }

  async sendMessage(message) {
    this.#history.push({ role: 'user', parts: [{ text: message }] });

    const data = await this.#client.#call('generateContent', {
      contents: this.#history,
    });

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    this.#history.push({ role: 'model', parts: [{ text: reply }] });
    return reply;
  }

  getHistory()  { return [...this.#history]; }
  clearHistory() { this.#history = []; }
}

class GeminiService {
  #apiKey;
  model;

  constructor(apiKey) {
    this.#apiKey = apiKey;
    this.model   = GEMINI_MODEL;
  }

  #endpoint(method) {
    return `${GEMINI_BASE_URL}/models/${this.model}:${method}?key=${this.#apiKey}`;
  }

  async #call(method, body) {
    const response = await fetch(this.#endpoint(method), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        ...body,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini API error: ${response.status}`);
    }

    return response.json();
  }

  async generateContent(prompt, systemInstruction = null) {
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }
    const data = await this.#call('generateContent', body);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async streamContent(prompt, onChunk, systemInstruction = null) {
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(this.#endpoint('streamGenerateContent'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
      for (const line of lines) {
        try {
          const json = JSON.parse(line.slice(6));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) onChunk(text);
        } catch {
          // Incomplete JSON chunk – skip
        }
      }
    }
  }

  startChat(initialHistory = []) {
    return new GeminiChatSession(this, initialHistory);
  }
}

export const geminiService = new GeminiService(GEMINI_API_KEY);
export default geminiService;
