const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  #authToken = null;

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token) {
    this.#authToken = token;
  }

  #buildHeaders(extra = {}, isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    Object.assign(headers, extra);
    if (this.#authToken) headers['Authorization'] = `Bearer ${this.#authToken}`;
    return headers;
  }

  async #request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const config = { ...options, headers: this.#buildHeaders(options.headers, isFormData) };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
      throw new Error(error.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  get(endpoint, headers = {}) {
    return this.#request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body, headers = {}) {
    const requestBody = body instanceof FormData ? body : JSON.stringify(body);
    return this.#request(endpoint, { method: 'POST', body: requestBody, headers });
  }

  put(endpoint, body, headers = {}) {
    const requestBody = body instanceof FormData ? body : JSON.stringify(body);
    return this.#request(endpoint, { method: 'PUT', body: requestBody, headers });
  }

  patch(endpoint, body, headers = {}) {
    const requestBody = body instanceof FormData ? body : JSON.stringify(body);
    return this.#request(endpoint, { method: 'PATCH', body: requestBody, headers });
  }

  delete(endpoint, headers = {}) {
    return this.#request(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient(BASE_URL);

// ── Domain API namespaces ────────────────────────────────────────────

export const fansApi = {
  getMatchInfo: (matchId) => apiClient.get(`/fans/matches/${matchId}`),
  getNavigation: (body) => apiClient.post('/fans/navigation', body),
  getConcessions: (section) => apiClient.get(`/fans/concessions?section=${section}`),
  askQuestion: (question, lang) => apiClient.post('/fans/ask', { question, language: lang }),
};

export const securityApi = {
  getIncidents: (params = {}) => apiClient.get(`/security/incidents?${new URLSearchParams(params)}`),
  createIncident: (incident) => apiClient.post('/security/incidents', incident),
  updateIncident: (id, body) => apiClient.put(`/security/incidents/${id}`, body),
  getCrowdStatus: (zone) => apiClient.get(`/security/crowd${zone ? `?zone=${zone}` : ''}`),
  getAlerts: () => apiClient.get('/security/alerts'),
};

export const volunteersApi = {
  getTasks: (volId) => apiClient.get(`/volunteers/${volId}/tasks`),
  updateTaskStatus: (taskId, body) => apiClient.put(`/volunteers/tasks/${taskId}`, body),
  getSchedule: (volId) => apiClient.get(`/volunteers/${volId}/schedule`),
  askGuidance: (body) => apiClient.post('/volunteers/guidance', body),
};

export const venueApi = {
  getFacilities: (venueId) => apiClient.get(`/venue/${venueId}/facilities`),
  getStatus: (venueId) => apiClient.get(`/venue/${venueId}/status`),
  reportIssue: (venueId, iss) => apiClient.post(`/venue/${venueId}/issues`, iss),
};

export const organizersApi = {
  getDashboard: () => apiClient.get('/organizers/dashboard'),
  getReports: () => apiClient.get('/organizers/reports'),
  generateInsight: (data) => apiClient.post('/organizers/insights', data),
};

export const aiApi = {
  chat: (message, history, context) =>
    apiClient.post('/ai/chat', { message, history: history || [], context }),
  generateSummary: (data, type) => apiClient.post('/ai/summary', { data, summary_type: type }),
  translate: (text, lang) => apiClient.post('/ai/translate', { text, target_language: lang }),
};

export const accessibilityApi = {
  chat: (message, history, location) =>
    apiClient.post('/accessibility/voice', { message, history, location }),
  analyzeOcr: (formData) => apiClient.post('/accessibility/ocr', formData),
  analyzeScene: (formData) => apiClient.post('/accessibility/scene', formData),
  detectObjects: (formData) => apiClient.post('/accessibility/objects', formData),
  triggerSos: (location, type = 'general', notes = '') =>
    apiClient.post('/accessibility/sos', { current_location: location, emergency_type: type, notes }),
};

export const fanCopilotApi = {
  chat: (message, history, preferences, parkingLocation, language = 'en') =>
    apiClient.post('/fan-copilot/chat', {
      message,
      history,
      preferences: preferences || null,
      parking_location: parkingLocation,
      language
    }),
  translate: (text, targetLang) =>
    apiClient.post('/fan-copilot/translate', { text, target_language: targetLang }),
  saveParking: (location) =>
    apiClient.post('/fan-copilot/parking', { location }),
  updatePrefs: (preferences) =>
    apiClient.post('/fan-copilot/preferences', { preferences }),
  getRecommendations: (category, currentLocation, preferences) =>
    apiClient.post('/fan-copilot/recommendations', { category, current_location: currentLocation, preferences }),
};

export const digitalTwinApi = {
  getStatus: () => apiClient.get('/digital-twin/status'),
  getNavigation: (fromLoc, toLoc, preference) =>
    apiClient.post('/digital-twin/navigation', { from_location: fromLoc, to_location: toLoc, preference }),
  injectIncident: () => apiClient.post('/digital-twin/incident/inject', {}),
  assignResponder: (incidentId, responderId, type) =>
    apiClient.post('/digital-twin/assign-responder', { incident_id: incidentId, assigned_responder_id: responderId, responder_type: type }),
  updateWeather: (status) =>
    apiClient.post(`/digital-twin/weather/update?status=${status}`, {}),
};

export const multiAgentApi = {
  chat: (message, history, memory) =>
    apiClient.post('/multi-agent/chat', { message, history, memory }),
  route: (message, context) =>
    apiClient.post('/multi-agent/route', { message, context }),
  testIntent: (message) =>
    apiClient.post('/multi-agent/intent', { message }),
  getMemory: () => apiClient.get('/multi-agent/memory'),
  getPrompts: () => apiClient.get('/multi-agent/prompts'),
};

export const commandCenterApi = {
  getStatus: (role) => apiClient.get(`/command-center/status?role=${role}`),
  resolveIncident: (incidentId) =>
    apiClient.post('/command-center/incident/resolve', { incident_id: incidentId }),
  generateReport: (type) =>
    apiClient.post('/command-center/report', { type }),
};
