/**
 * GanaHeza API Service
 *
 * Thin endpoint wrappers over the network layer.
 * All HTTP logic (base URL, token, fetch, timeouts, errors) lives in
 * services/network.js. This file only defines endpoint functions.
 */

import {
  apiFetch,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  ApiError,
  API_URL,
} from './network';

// Re-export token management + error class so existing imports
// (import { login, setAuthToken } from '@/services/api') keep working.
export { setAuthToken, getAuthToken, clearAuthToken, ApiError, API_URL };

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

/**
 * Request a password reset token for a given email.
 * Returns { message, resetToken? } — the reset token is included
 * directly in the response (no email service yet).
 */
export async function forgotPassword(email) {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset password using a reset token obtained from forgotPassword().
 */
export async function resetPassword(resetToken, newPassword) {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ resetToken, newPassword }),
  });
}

/**
 * Change password while logged in (requires auth token).
 */
export async function changePassword(currentPassword, newPassword) {
  return apiFetch('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
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
 * Upload a product image to the backend.
 * The file is saved in backend/uploads/products/ and the server
 * returns the relative path (e.g. /uploads/products/12345-avocado.jpg).
 * That path is stored in the database as imageUrl.
 *
 * @param {string} imageUri  — local file URI from expo-image-picker
 * @returns {Promise<string>} — server image path (imageUrl)
 */
export async function uploadProductImage(imageUri) {
  const formData = new FormData();

  // Extract filename and infer mime type from the URI
  const filename = imageUri.split('/').pop() || 'product.jpg';
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeType =
    ext === 'png' ? 'image/png'
    : ext === 'webp' ? 'image/webp'
    : ext === 'gif' ? 'image/gif'
    : 'image/jpeg'; // default to jpeg

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type: mimeType,
  });

  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // NOTE: Do NOT set Content-Type — fetch sets it automatically
  // with the correct multipart boundary for FormData.

  const res = await fetch(`${API_URL}/api/products/upload`, {
    method: 'POST',
    body: formData,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      data.error || `Upload failed (${res.status})`,
      res.status,
      data
    );
  }

  return data.imageUrl; // e.g. '/uploads/products/12345-avocado.jpg'
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
