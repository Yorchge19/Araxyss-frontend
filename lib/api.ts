/**
 * API client for communicating with the backend-api service.
 * Set NEXT_PUBLIC_API_URL in your .env to point to the backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = {
  get: async (path: string) => {
    const res = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },

  post: async (path: string, body: unknown) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },

  delete: async (path: string) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },
};

/**
 * Auth session helpers - calls backend-api session endpoint
 */
export const sessionApi = {
  create: (idToken: string) => apiClient.post('/api/auth/session', { idToken }),
  destroy: () => apiClient.delete('/api/auth/session'),
};

/**
 * Workspaces API - calls backend-api (server-side protected route)
 */
export const workspacesApi = {
  getAll: () => apiClient.get('/api/workspaces'),
};
