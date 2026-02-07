/**
 * Giri Vision - API Client
 * Communicates with /api/v1/giri-vision endpoints
 */
const GiriApi = {
  _baseUrl: () => `${AppConfig.API_URL}/giri-vision`,
  _workspaceId: () => AppState.currentWorkspace?.id,

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('productiveapp_token');
    if (token) h['Authorization'] = `Bearer ${token}`;
    const wid = this._workspaceId();
    if (wid) h['X-Workspace-Id'] = wid;
    return h;
  },

  async _fetch(path, opts = {}) {
    const url = `${this._baseUrl()}${path}`;
    const res = await fetch(url, { headers: this._headers(), ...opts });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `API error ${res.status}`);
    }
    const json = await res.json();
    return json.data || json;
  },

  _post(path, body) {
    return this._fetch(path, { method: 'POST', body: JSON.stringify(body) });
  },

  _put(path, body) {
    return this._fetch(path, { method: 'PUT', body: JSON.stringify(body) });
  },

  // --- Profile ---
  getProfile() {
    return this._fetch(`/workspace/${this._workspaceId()}/profile`);
  },
  createProfile(data) {
    return this._post(`/workspace/${this._workspaceId()}/profile`, data);
  },
  updateProfile(profileId, data) {
    return this._put(`/profile/${profileId}`, data);
  },

  // --- Dashboard ---
  getDashboard() {
    return this._fetch(`/workspace/${this._workspaceId()}/dashboard`);
  },

  // --- Therapists ---
  listTherapists() {
    return this._fetch(`/workspace/${this._workspaceId()}/therapists`);
  },

  // --- Availability ---
  setAvailability(slots) {
    return this._put(`/workspace/${this._workspaceId()}/availability`, { slots });
  },
  getAvailability(therapistId) {
    return this._fetch(`/therapists/${therapistId}/availability`);
  },
  getAvailableSlots(therapistId, date) {
    return this._fetch(`/therapists/${therapistId}/slots?date=${date}`);
  },

  // --- Consultations ---
  createConsultation(data) {
    return this._post(`/workspace/${this._workspaceId()}/consultations`, data);
  },
  listConsultations() {
    return this._fetch(`/workspace/${this._workspaceId()}/consultations`);
  },
  getConsultation(id) {
    return this._fetch(`/consultations/${id}`);
  },
  updateConsultation(id, data) {
    return this._put(`/consultations/${id}`, data);
  },
  joinWaitingRoom(id) {
    return this._post(`/consultations/${id}/join`);
  },
  startConsultation(id) {
    return this._post(`/consultations/${id}/start`);
  },
  endConsultation(id) {
    return this._post(`/consultations/${id}/end`);
  },

  // --- Bookings ---
  createBooking(data) {
    return this._post(`/workspace/${this._workspaceId()}/bookings`, data);
  },
  confirmBooking(id, response) {
    return this._post(`/bookings/${id}/confirm`, { response });
  },
  cancelBooking(id) {
    return this._post(`/bookings/${id}/cancel`);
  },

  // --- Recordings ---
  startRecording(consultationId) {
    return this._post(`/consultations/${consultationId}/recording`);
  },
  getRecording(consultationId) {
    return this._fetch(`/consultations/${consultationId}/recording`);
  },

  // --- Reports ---
  generateReport(consultationId) {
    return this._post(`/consultations/${consultationId}/report/generate`);
  },
  getReport(consultationId) {
    return this._fetch(`/consultations/${consultationId}/report`);
  },
  updateReport(reportId, data) {
    return this._put(`/reports/${reportId}`, data);
  },

  // --- Progress ---
  recordProgress(consultationId, data) {
    return this._post(`/consultations/${consultationId}/progress`, data);
  },
  getClientProgress(therapistId, clientId) {
    return this._fetch(`/therapists/${therapistId}/clients/${clientId}/progress`);
  },
};

window.GiriApi = GiriApi;
