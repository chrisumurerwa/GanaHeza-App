/**
 * GanaHeza Network Layer
 *
 * The single source of truth for all HTTP communication.
 * Owns: API base URL (from env), auth token storage, the core
 * fetch wrapper (apiFetch), timeout handling, and error types.
 *
 * Usage:
 *   import { apiFetch, setAuthToken } from '@/services/network';
 *   const data = await apiFetch('/api/products');
 *
 * Environment variables (read from .env via Expo):
 *   EXPO_PUBLIC_API_URL     — backend base URL (no trailing slash)
 *   EXPO_PUBLIC_API_TIMEOUT — request timeout in ms (default 15000)
 */

// ─── Config (from environment, with fallbacks) ───────────────────────────────
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://ganahezabackend.onrender.com';

const API_TIMEOUT =
  Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 15000;

// Debug log — shows in Metro console so you can verify which URL is active
if (__DEV__) {
  console.log('[network] API_URL =', API_URL);
  console.log('[network] EXPO_PUBLIC_API_URL =', process.env.EXPO_PUBLIC_API_URL);
}

// ─── Auth Token Store (in-memory) ────────────────────────────────────────────
let _authToken = null;

export function setAuthToken(token) {
  _authToken = token;
}

export function getAuthToken() {
  return _authToken;
}

export function clearAuthToken() {
  _authToken = null;
}

// ─── Custom Error Class ──────────────────────────────────────────────────────

/**
 * ApiError — thrown for any non-2xx HTTP response or network failure.
 * Carries the HTTP status code and raw response data for debugging.
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? null;
    this.data = data ?? null;
  }
}

// ─── Core Fetch Wrapper ──────────────────────────────────────────────────────

/**
 * apiFetch — the one function every API call goes through.
 *
 * @param {string} path     — route path (e.g. '/api/products')
 * @param {object} options  — standard fetch options (method, body, etc.)
 * @returns {Promise<any>}  — parsed JSON response body
 * @throws {ApiError}       — on network failure, timeout, or non-2xx response
 */
export async function apiFetch(path, options = {}) {
  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach JWT if we have one
  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  // Timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);

    // Distinguish timeout vs. generic network failure
    if (err?.name === 'AbortError') {
      throw new ApiError(
        `Request timed out after ${API_TIMEOUT}ms.`,
        null,
        null
      );
    }
    throw new ApiError(
      err?.message || 'Network request failed. Is the server running?',
      null,
      null
    );
  }

  clearTimeout(timeoutId);

  // Parse JSON (graceful fallback if body is empty or non-JSON)
  const data = await res.json().catch(() => ({}));

  // Throw on non-ok responses
  if (!res.ok) {
    const message =
      data.error || data.message || `API error ${res.status}`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

// Re-export API_URL for debugging / display in the app
export { API_URL, API_TIMEOUT };
