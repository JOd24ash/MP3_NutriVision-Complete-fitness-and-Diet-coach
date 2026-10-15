import { MOCK_USER_PROFILE } from './mockData';

const BASE_URL = '/api/v1';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Token storage helper
const TOKEN_KEY = 'nutrivision_token';
const USER_KEY = 'nutrivision_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = () => {
  try {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
};
export const setStoredUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));

// State for backend connectivity
let isLiveBackendAvailable = DEMO_MODE;

export const checkBackendStatus = async () => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'OPTIONS',
      signal: AbortSignal.timeout(1800)
    });
    isLiveBackendAvailable = DEMO_MODE || res.ok || res.status === 405 || res.status === 422;
  } catch (err) {
    isLiveBackendAvailable = false;
  }
  return isLiveBackendAvailable;
};

export const getBackendStatus = () => isLiveBackendAvailable;

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    ...authHeaders(),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    removeToken();
    window.dispatchEvent(new CustomEvent('nutrivision:unauthorized'));
  }
  return res;
};

// API Client
export const api = {
  // Auth
  auth: {
    async login(email, password) {
      if (DEMO_MODE) {
        // Mock success
        const token = 'mock_jwt_token_' + Date.now();
        setToken(token);
        const user = { ...MOCK_USER_PROFILE, email };
        setStoredUser(user);
        return { access_token: token, user };
      }
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
        throw new Error(err.detail || 'Login failed');
      }
      const data = await res.json();
      setToken(data.access_token);
      setStoredUser(data.user);
      return data;
    },

    async signup(name, email, password) {
      if (DEMO_MODE) {
        const token = 'mock_jwt_token_' + Date.now();
        setToken(token);
        const user = { ...MOCK_USER_PROFILE, name, email };
        setStoredUser(user);
        return { access_token: token, user };
      }
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(err.detail || 'Signup failed');
      }
      const data = await res.json();
      setToken(data.access_token);
      setStoredUser(data.user);
      return data;
    },

    logout() {
      removeToken();
    }
  },

  // Profile & Medical Guardrails
  profile: {
    async get(userId) {
      if (DEMO_MODE) {
        return getStoredUser();
      }
      const res = await fetchWithAuth(`${BASE_URL}/users/${userId}/profile`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return await res.json();
    },

    async update(userId, data) {
      if (DEMO_MODE) {
        const current = getStoredUser();
        const updated = { ...current, ...data };
        setStoredUser(updated);
        return updated;
      }
      const rawAllergies = Array.isArray(data.allergies)
        ? data.allergies
        : (data.allergy && data.allergy !== 'none' ? [data.allergy] : []);
      const rawConditions = Array.isArray(data.conditions)
        ? data.conditions
        : (data.medical_condition && data.medical_condition !== 'none' ? [data.medical_condition] : []);

      const payload = {
        allergies: rawAllergies.filter(Boolean),
        conditions: rawConditions.filter(Boolean)
      };

      const res = await fetchWithAuth(`${BASE_URL}/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update medical profile');
      return await res.json();
    }
  },

  nutrition: {
    async search(query) {
      const res = await fetchWithAuth(`${BASE_URL}/nutrition/foods?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Food search is unavailable');
      return await res.json();
    }
  },

  fitness: {
    async updateGoals(userId, payload) { const res = await fetchWithAuth(`${BASE_URL}/users/${userId}/goals`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) { const err = await res.json().catch(() => ({ detail: 'Could not save nutrition profile' })); throw new Error(err.detail || 'Could not save nutrition profile'); } return await res.json(); },
    async goals(userId) { const res = await fetchWithAuth(`${BASE_URL}/users/${userId}/goals`); if (!res.ok) throw new Error('Set your goals to view progress'); return await res.json(); },
    async summary(userId) { const date = new Date().toISOString().slice(0, 10); const res = await fetchWithAuth(`${BASE_URL}/users/${userId}/daily-summary?date=${date}`); if (!res.ok) throw new Error('Set your goals to view progress'); return await res.json(); },
    async suggestions(userId) { const res = await fetchWithAuth(`${BASE_URL}/users/${userId}/meal-suggestions`); if (!res.ok) throw new Error('Suggestions unavailable'); return await res.json(); },
    async weekly(userId, anchorDate) {
      const param = anchorDate ? `?anchor_date=${anchorDate}` : '';
      const res = await fetchWithAuth(`${BASE_URL}/users/${userId}/weekly-summary${param}`);
      if (!res.ok) throw new Error('Weekly summary unavailable');
      return await res.json();
    },
  },

  // Meals (Photo / Voice / Edit / Confirm)
  meals: {
    async createManual(data) {
      const res = await fetchWithAuth(`${BASE_URL}/meals/manual`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to start manual meal');
      return await res.json();
    },
    async logPhoto(formData) {
      if (DEMO_MODE) {
        throw new Error('Photo analysis requires the NutriVision backend.');
      }
      const res = await fetchWithAuth(`${BASE_URL}/meals/photo`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Photo recognition failed' }));
        throw new Error(err.detail || 'Failed to analyze meal image');
      }
      return await res.json();
    },

    async logVoice(formData) {
      if (DEMO_MODE) throw new Error('Voice logging is unavailable in demo mode');
      const res = await fetchWithAuth(`${BASE_URL}/meals/voice`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Voice parsing failed' }));
        throw new Error(err.detail?.message || err.detail || 'Voice log error');
      }
      return await res.json();
    },

    async get(mealLogId) {
      if (DEMO_MODE) throw new Error('Meal fetch is unavailable in demo mode');
      const res = await fetchWithAuth(`${BASE_URL}/meals/${mealLogId}`);
      if (!res.ok) throw new Error('Failed to fetch meal');
      return await res.json();
    },

    async patchItem(mealLogId, itemId, data) {
      if (DEMO_MODE) throw new Error('Meal editing is unavailable in demo mode');
      const res = await fetchWithAuth(`${BASE_URL}/meals/${mealLogId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update meal item');
      return await res.json();
    },

    async addItem(mealLogId, data) {
      const res = await fetchWithAuth(`${BASE_URL}/meals/${mealLogId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to add meal item');
      return await res.json();
    },

    async deleteItem(mealLogId, itemId) {
      const res = await fetchWithAuth(`${BASE_URL}/meals/${mealLogId}/items/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove meal item');
    },

    async confirm(mealLogId) {
      if (DEMO_MODE) throw new Error('Meal confirmation is unavailable in demo mode');
      const res = await fetchWithAuth(`${BASE_URL}/meals/${mealLogId}/confirm`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to finalize meal log');
      return await res.json();
    },

    async listHistory(userId) {
      const res = await fetchWithAuth(`${BASE_URL}/users/${userId}/meals`);
      if (!res.ok) throw new Error('Failed to load meal history');
      return await res.json();
    }
  },

  // Health Metrics
  metrics: {
    async list(userId, type = null) {
      const url = type ? `${BASE_URL}/users/${userId}/health-metrics?type=${type}` : `${BASE_URL}/users/${userId}/health-metrics`;
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error('Failed to load health metrics');
      return await res.json();
    },

    async add(userId, payload) {
      const res = await fetchWithAuth(`${BASE_URL}/users/${userId}/health-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to record biometric');
      return await res.json();
    }
  },

  // RAG Chatbot
  chat: {
    async send(userId, message) {
      if (DEMO_MODE) throw new Error('Chat is unavailable in demo mode');
      let res;
      try {
        res = await fetchWithAuth(`${BASE_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, message }),
          signal: AbortSignal.timeout(45000)
        });
      } catch (error) {
        if (error.name === 'TimeoutError') throw new Error('AI Coach took too long to respond. Please try again.');
        throw error;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Chat inference failed' }));
        throw new Error(err.detail || 'Failed to query AI Coach');
      }
      return await res.json();
    }
  }
};
