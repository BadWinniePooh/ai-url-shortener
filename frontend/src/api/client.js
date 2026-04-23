const BASE = '/api';

function getToken() {
  return localStorage.getItem('sw_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('sw_token', token);
  else localStorage.removeItem('sw_token');
}

async function request(method, path, body) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    register: (body) => request('POST', '/auth/register', body),
    login: (body) => request('POST', '/auth/login', body),
    me: () => request('GET', '/auth/me'),
  },
  urls: {
    list: () => request('GET', '/urls'),
    create: (body) => request('POST', '/urls', body),
    delete: (slug) => request('DELETE', `/urls/${slug}`),
  },
  stats: {
    get: (slug) => request('GET', `/stats/${slug}`),
  },
};
