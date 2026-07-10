const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  #authToken = null;

  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token) {
    this.#authToken = token;
  }

  #buildHeaders(extra = {}) {
    const headers = { 'Content-Type': 'application/json', ...extra };
    if (this.#authToken) headers['Authorization'] = `Bearer ${this.#authToken}`;
    return headers;
  }

  async #request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = { headers: this.#buildHeaders(options.headers), ...options };

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
    return this.#request(endpoint, { method: 'POST', body: JSON.stringify(body), headers });
  }

  put(endpoint, body, headers = {}) {
    return this.#request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers });
  }

  patch(endpoint, body, headers = {}) {
    return this.#request(endpoint, { method: 'PATCH', body: JSON.stringify(body), headers });
  }

  delete(endpoint, headers = {}) {
    return this.#request(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient(BASE_URL);

// ── Domain API namespaces ────────────────────────────────────────────

export const fansApi = {
  getMatchInfo:  (matchId)         => apiClient.get(`/fans/matches/${matchId}`),
  getNavigation: (body)            => apiClient.post('/fans/navigation', body),
  getConcessions: (section)        => apiClient.get(`/fans/concessions?section=${section}`),
  askQuestion:   (question, lang)  => apiClient.post('/fans/ask', { question, language: lang }),
};

export const securityApi = {
  getIncidents:    (params = {})   => apiClient.get(`/security/incidents?${new URLSearchParams(params)}`),
  createIncident:  (incident)      => apiClient.post('/security/incidents', incident),
  updateIncident:  (id, body)      => apiClient.put(`/security/incidents/${id}`, body),
  getCrowdStatus:  (zone)          => apiClient.get(`/security/crowd${zone ? `?zone=${zone}` : ''}`),
  getAlerts:       ()              => apiClient.get('/security/alerts'),
};

export const volunteersApi = {
  getTasks:        (volId)         => apiClient.get(`/volunteers/${volId}/tasks`),
  updateTaskStatus: (taskId, body) => apiClient.put(`/volunteers/tasks/${taskId}`, body),
  getSchedule:     (volId)         => apiClient.get(`/volunteers/${volId}/schedule`),
  askGuidance:     (body)          => apiClient.post('/volunteers/guidance', body),
};

export const venueApi = {
  getFacilities:    (venueId)      => apiClient.get(`/venue/${venueId}/facilities`),
  getStatus:        (venueId)      => apiClient.get(`/venue/${venueId}/status`),
  reportIssue:      (venueId, iss) => apiClient.post(`/venue/${venueId}/issues`, iss),
};

export const organizersApi = {
  getDashboard:    ()              => apiClient.get('/organizers/dashboard'),
  getReports:      ()              => apiClient.get('/organizers/reports'),
  generateInsight: (data)          => apiClient.post('/organizers/insights', data),
};

export const aiApi = {
  chat:           (message, history, context) =>
    apiClient.post('/ai/chat', { message, history: history || [], context }),
  generateSummary: (data, type)   => apiClient.post('/ai/summary', { data, summary_type: type }),
  translate:      (text, lang)    => apiClient.post('/ai/translate', { text, target_language: lang }),
};
