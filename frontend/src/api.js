const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

const TIMEOUT_MS = 12000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Check your connection.')), ms)
    ),
  ]);
}

export const fetchApi = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('ngo_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  let res;
  try {
    res = await withTimeout(fetch(`${API_BASE}${endpoint}`, options), TIMEOUT_MS);
  } catch (err) {
    throw new Error(err.message || 'Network error — please try again.');
  }

  const ct = res.headers.get('content-type') || '';
  let data;
  if (ct.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { error: text || `Unexpected response (${res.status})` };
  }

  if (res.status === 401) {
    localStorage.removeItem('ngo_token');
    localStorage.removeItem('ngo_user');
    window.dispatchEvent(new Event('ngo:session-expired'));
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
  return data;
};
