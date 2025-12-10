/**
 * Centralized API configuration
 * 
 * This file provides a single source of truth for the API base URL.
 * All API requests should use this constant instead of defining their own.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export { API_BASE };
