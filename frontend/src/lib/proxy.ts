/**
 * proxy.ts
 * Middleware-like utility to proxy requests from the Next.js frontend to the Django backend.
 * Handles both server-side (Docker network) and client-side (Browser localhost) network logic,
 * as well as auto-injecting headers and error wrapping.
 */

// Handle Docker internal networking vs Browser external networking
const IS_SERVER = typeof window === "undefined";
const BACKEND_URL = IS_SERVER
  ? process.env.BACKEND_API_URL || "http://backend:8000"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ProxyOptions extends RequestInit {
  token?: string;
}

export async function proxyFetch(endpoint: string, options: ProxyOptions = {}) {
  const { token, headers, ...restOptions } = options;

  // Clean endpoint path
  let url: string;
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    url = endpoint;
  } else {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    url = `${BACKEND_URL}${path}`;
  }

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Add auth header if token is provided or managed globally
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Merge headers appropriately prioritizing manual overrides
  const finalHeaders = { ...defaultHeaders, ...(headers as Record<string, string>) };

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: finalHeaders,
    });

    if (!response.ok) {
      // Normalize Django API error formats
      let errorData;
      try {
         errorData = await response.json();
      } catch {
         errorData = await response.text();
      }
      throw {
         status: response.status,
         statusText: response.statusText,
         data: errorData
      };
    }

    // Try to auto-parse JSON if empty returns text or 204 matches
    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    console.error(`[Proxy] API Request failed for ${url}:`, error);
    throw error;
  }
}

// Semantic methods for readability acting as our API middleware client
export const api = {
  getAll: async (endpoint: string, options?: ProxyOptions) => {
    let allResults: unknown[] = [];
    let nextUrl: string | null = endpoint;
    
    while (nextUrl) {
      const data = await proxyFetch(nextUrl, { ...options, method: "GET" }) as { results?: unknown[], next?: string | null } | unknown[];
      if (data && !Array.isArray(data) && Array.isArray(data.results)) {
        allResults = [...allResults, ...data.results];
        nextUrl = data.next || null;
      } else if (Array.isArray(data)) {
        allResults = [...allResults, ...data];
        break;
      } else {
        break;
      }
    }
    return allResults;
  },

  get: (endpoint: string, options?: ProxyOptions) =>
    proxyFetch(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, body: unknown, options?: ProxyOptions) =>
    proxyFetch(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),

  put: (endpoint: string, body: unknown, options?: ProxyOptions) =>
    proxyFetch(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),

  patch: (endpoint: string, body: unknown, options?: ProxyOptions) =>
    proxyFetch(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),

  delete: (endpoint: string, options?: ProxyOptions) =>
    proxyFetch(endpoint, { ...options, method: "DELETE" }),
};
