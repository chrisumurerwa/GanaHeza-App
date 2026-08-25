/**
 * GanaHeza API Service
 *
 * Connects to the Node.js + PostgreSQL backend.
 *
 * IMPORTANT — set your machine's local IP below.
 * On Android emulator use: http://10.0.2.2:3000
 * On a real phone (same WiFi): http://YOUR_PC_IP:3000
 *   → find it with: ipconfig (Windows) or ifconfig (Mac/Linux)
 *
 * Example: http://192.168.1.45:3000
 */

// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE_URL = 'http://192.168.1.105:3000'; // Your PC's local IP — real device on same WiFi
// const BASE_URL = 'http://10.0.2.2:3000';   // Use this instead if on Android emulator

// ─── Stored auth token (set after login) ─────────────────────────────────────
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

// ─── Internal fetch helper ────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.error || data.message || `API error ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Login with email and password.
 * Returns { token, user } and automatically stores the token.
 */
export async function login(email, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) setAuthToken(data.token);
  return data; // { token, user }
}

/**
 * Fetch the currently logged-in user's profile.
 */
export async function getMe() {
  return apiFetch('/api/auth/me');
}

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * Get all products. Optional filters: { category, search }
 */
export async function getProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.search)   params.set('search', filters.search);
  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await apiFetch(`/api/products${query}`);
  return data.products || [];
}

/**
 * Get a single product by ID.
 */
export async function getProductById(id) {
  if (!id) return null;
  try {
    const data = await apiFetch(`/api/products/${id}`);
    return data.product || null;
  } catch {
    return null;
  }
}

/**
 * Create a new product (admin only — requires JWT).
 */
export async function createProduct(productData) {
  const data = await apiFetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  return data.product;
}

/**
 * Update an existing product (admin only — requires JWT).
 */
export async function updateProduct(id, updatedFields) {
  const data = await apiFetch(`/api/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updatedFields),
  });
  return data.product;
}

/**
 * Delete a product by ID (admin only — requires JWT).
 */
export async function deleteProduct(id) {
  return apiFetch(`/api/products/${id}`, { method: 'DELETE' });
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────

/**
 * Get all blog posts.
 */
export async function getBlogPosts() {
  const data = await apiFetch('/api/blog');
  return data.posts || [];
}

/**
 * Get a single blog post by ID.
 */
export async function getBlogPostById(id) {
  if (!id) return null;
  try {
    const data = await apiFetch(`/api/blog/${id}`);
    return data.post || null;
  } catch {
    return null;
  }
}

/**
 * Create a blog post (admin only — requires JWT).
 */
export async function createBlogPost(postData) {
  const data = await apiFetch('/api/blog', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
  return data.post;
}

/**
 * Update a blog post (admin only — requires JWT).
 */
export async function updateBlogPost(id, fields) {
  const data = await apiFetch(`/api/blog/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
  return data.post;
}

/**
 * Delete a blog post (admin only — requires JWT).
 */
export async function deleteBlogPost(id) {
  return apiFetch(`/api/blog/${id}`, { method: 'DELETE' });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

/**
 * Get all orders (admin only — requires JWT).
 * Optional filter: { status: 'Pending'|'Confirmed'|'Delivered'|'Cancelled' }
 */
export async function getOrders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await apiFetch(`/api/orders${query}`);
  return data.orders || [];
}

/**
 * Place a new order (public — no JWT needed).
 */
export async function placeOrder(orderData) {
  const data = await apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
  return data.order;
}

/**
 * Update an order's status (admin only — requires JWT).
 */
export async function updateOrderStatus(id, status) {
  const data = await apiFetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return data.order;
}

/**
 * Delete an order (admin only — requires JWT).
 */
export async function deleteOrder(id) {
  return apiFetch(`/api/orders/${id}`, { method: 'DELETE' });
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

/**
 * Submit a contact message (public — no JWT needed).
 */
export async function submitContactMessage(formData) {
  return apiFetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}
