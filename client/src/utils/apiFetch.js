/**
 * Authenticated API fetch helper
 * 
 * This utility provides a standardized way to make authenticated API requests.
 * It automatically:
 * - Retrieves and attaches the JWT token
 * - Handles 401/403 responses by clearing auth and redirecting to login
 * - Throws errors for missing tokens
 * 
 * @param {string} url - The full URL to fetch
 * @param {RequestInit} options - Standard fetch options (method, headers, body, etc.)
 * @param {Function} navigate - React Router's navigate function for redirects
 * @returns {Promise<Response>} - The fetch Response object
 * @throws {Error} - Throws "NO_TOKEN" or "UNAUTHORIZED" errors
 */

import { getToken, clearAuthData } from "./authUtils";

export async function apiFetch(url, options = {}, navigate) {
  const token = getToken();
  
  if (!token) {
    if (navigate) navigate("/login");
    throw new Error("NO_TOKEN");
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    clearAuthData();
    if (navigate) navigate("/login");
    throw new Error("UNAUTHORIZED");
  }

  return res;
}
