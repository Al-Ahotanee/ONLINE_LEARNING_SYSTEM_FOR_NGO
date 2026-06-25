// ==========================================
// Centralised API utility — single source of truth
// ==========================================

const API_BASE =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5000/api';

const REQUEST_TIMEOUT_MS = 12000;

function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out. Please check your connection.')), ms)
  );
  return Promise.race([promise, timeout]);
}

export const fetchApi = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('ngo_token');

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  let res;
  try {
    res = await withTimeout(fetch(`${API_BASE}${endpoint}`, options), REQUEST_TIMEOUT_MS);
  } catch (networkErr) {
    throw new Error(networkErr.message || 'Network error — please try again.');
  }

  // Handle non-JSON responses gracefully
  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { error: text || `Unexpected response (${res.status})` };
  }

  if (res.status === 401) {
    // Token expired — clean up and redirect to login
    localStorage.removeItem('ngo_token');
    localStorage.removeItem('ngo_user');
    window.dispatchEvent(new Event('ngo:session-expired'));
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    throw new Error(data.error || `Server error (${res.status})`);
  }

  return data;
};
