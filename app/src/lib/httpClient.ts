import type { User } from "@/types/api";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    // localStorage not available
    return null;
  }
};

export const setAuthToken = (token: string | null): void => {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // localStorage not available or quota exceeded
  }
};

export const getAuthUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? (JSON.parse(userStr) as User) : null;
  } catch {
    // localStorage not available or invalid JSON
    return null;
  }
};

export const setAuthUser = (user: unknown | null): void => {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // localStorage not available or quota exceeded
  }
};

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  let data: unknown;
  if (isJson) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorData = data as { message?: string } | undefined;
    const apiError: ApiError = {
      status: response.status,
      message: errorData?.message || response.statusText || "Request failed",
      details: data,
    };

    if (typeof window !== "undefined" && apiError.status === 401) {
      // Clear auth on 401
      setAuthToken(null);
      setAuthUser(null);
    }

    return Promise.reject(apiError);
  }

  return data as T;
}

function buildUrl(
  url: string,
  params?: Record<string, string | number | boolean>
): string {
  const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;

  if (!params || Object.keys(params).length === 0) {
    return fullUrl;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const separator = fullUrl.includes("?") ? "&" : "?";
  return `${fullUrl}${separator}${searchParams.toString()}`;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

export const api = {
  get: async <T>(
    url: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> => {
    const fullUrl = buildUrl(url, params);
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: getHeaders(),
    });

    return handleResponse<T>(response);
  },

  post: async <T, B = unknown>(url: string, body?: B): Promise<T> => {
    const fullUrl = buildUrl(url);
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse<T>(response);
  },

  put: async <T, B = unknown>(url: string, body?: B): Promise<T> => {
    const fullUrl = buildUrl(url);
    const response = await fetch(fullUrl, {
      method: "PUT",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse<T>(response);
  },

  patch: async <T, B = unknown>(url: string, body?: B): Promise<T> => {
    const fullUrl = buildUrl(url);
    const response = await fetch(fullUrl, {
      method: "PATCH",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse<T>(response);
  },

  delete: async <T>(url: string): Promise<T> => {
    const fullUrl = buildUrl(url);
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: getHeaders(),
    });

    return handleResponse<T>(response);
  },
};
