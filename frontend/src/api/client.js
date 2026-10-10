import { 
  SAMPLE_PLATES, 
  MOCK_USER_PROFILE, 
  MOCK_HISTORY_MEALS, 
  MOCK_HEALTH_METRICS
} from './mockData';

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
      const res = await fetch(`${BASE_URL}/users/${userId}/profile`, {
        headers: { ...authHeaders() }
      });
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
      const res = await fetch(`${BASE_URL}/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update medical profile');
      return await res.json();
    }
  },

  nutrition: {
    async search(query) {
      const res = await fetch(`${BASE_URL}/nutrition/foods?query=${encodeURIComponent(query)}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Food search is unavailable');
      return await res.json();
    }
  },

  // Meals (Photo / Voice / Edit / Confirm)
  meals: {
    async logPhoto(formData) {
      if (DEMO_MODE) {
        // Simulate realistic computer-vision delay
        await new Promise(r => setTimeout(r, 900));
        const plate = SAMPLE_PLATES[0];
        return {
          meal_log_id: 'meal-' + Math.random().toString(36).substring(2, 9),
          items: plate.items,
          total: {
            calories: plate.items.reduce((s, i) => s + (i.calories || 0), 0),
            protein_g: plate.items.reduce((s, i) => s + (i.protein_g || 0), 0),
            carbs_g: plate.items.reduce((s, i) => s + (i.carbs_g || 0), 0),
            fat_g: plate.items.reduce((s, i) => s + (i.fat_g || 0), 0),
          },
          needs_manual_review: false
        };
      }
      const res = await fetch(`${BASE_URL}/meals/photo`, {
        method: 'POST',
        headers: { ...authHeaders() },
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
      const res = await fetch(`${BASE_URL}/meals/voice`, {
        method: 'POST',
        headers: { ...authHeaders() },
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Voice parsing failed' }));
        throw new Error(err.detail?.message || err.detail || 'Voice log error');
      }
      return await res.json();
    },

    async patchItem(mealLogId, itemId, data) {
      if (DEMO_MODE) throw new Error('Meal editing is unavailable in demo mode');
      const res = await fetch(`${BASE_URL}/meals/${mealLogId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update meal item');
      return await res.json();
    },

    async addItem(mealLogId, data) {
      const res = await fetch(`${BASE_URL}/meals/${mealLogId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('Failed to add meal item');
      return await res.json();
    },

    async deleteItem(mealLogId, itemId) {
      const res = await fetch(`${BASE_URL}/meals/${mealLogId}/items/${itemId}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to remove meal item');
    },

    async confirm(mealLogId) {
      if (DEMO_MODE) throw new Error('Meal confirmation is unavailable in demo mode');
      const res = await fetch(`${BASE_URL}/meals/${mealLogId}/confirm`, {
        method: 'POST',
        headers: { ...authHeaders() }
      });
      if (!res.ok) throw new Error('Failed to finalize meal log');
      return await res.json();
    },

    async listHistory(userId) {
      if (DEMO_MODE) {
        return MOCK_HISTORY_MEALS;
      }
      const res = await fetch(`${BASE_URL}/users/${userId}/meals`, {
        headers: { ...authHeaders() }
      });
      if (!res.ok) throw new Error('Failed to load meal history');
      return await res.json();
    }
  },

  // Health Metrics
  metrics: {
    async list(userId, type = null) {
      if (DEMO_MODE) {
        return type ? MOCK_HEALTH_METRICS.filter(m => m.metric_type === type) : MOCK_HEALTH_METRICS;
      }
      const url = type ? `${BASE_URL}/users/${userId}/health-metrics?type=${type}` : `${BASE_URL}/users/${userId}/health-metrics`;
      const res = await fetch(url, { headers: { ...authHeaders() } });
      if (!res.ok) throw new Error('Failed to load health metrics');
      return await res.json();
    },

    async add(userId, payload) {
      if (DEMO_MODE) {
        const item = {
          id: 'm-' + Date.now(),
          metric_type: payload.metric_type,
          value: payload.value,
          unit: payload.unit,
          recorded_at: new Date().toISOString()
        };
        MOCK_HEALTH_METRICS.unshift(item);
        return item;
      }
      const res = await fetch(`${BASE_URL}/users/${userId}/health-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ user_id: userId, message })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Chat inference failed' }));
        throw new Error(err.detail || 'Failed to query AI Coach');
      }
      return await res.json();
    }
  }
};
