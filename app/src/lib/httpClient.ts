import axios, { AxiosError, type AxiosInstance } from "axios";

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

export const getAuthUser = (): unknown | null => {
  if (typeof window === "undefined") return null;
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
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

function createHttpClient(): AxiosInstance {
  const instance = axios.create({ baseURL, withCredentials: false });

  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = getAuthToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    config.headers = config.headers ?? {};
    config.headers["Content-Type"] =
      config.headers["Content-Type"] ?? "application/json";
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      const errorData = error.response?.data as
        | { message?: string }
        | undefined;
      const apiError: ApiError = {
        status: (error.response?.status as number) || 0,
        message: errorData?.message || error.message || "Request failed",
        details: error.response?.data,
      };
      if (typeof window !== "undefined" && apiError.status === 401) {
        // Clear auth on 401
        setAuthToken(null);
        setAuthUser(null);
      }
      return Promise.reject(apiError);
    }
  );

  return instance;
}

export const http = createHttpClient();

export const api = {
  get: async <T>(
    url: string,
    params?: Record<string, string | number | boolean>
  ) => {
    const res = await http.get<T>(url, { params });
    return res.data;
  },
  post: async <T, B = unknown>(url: string, body?: B) => {
    const res = await http.post<T>(url, body);
    return res.data;
  },
  put: async <T, B = unknown>(url: string, body?: B) => {
    const res = await http.put<T>(url, body);
    return res.data;
  },
  patch: async <T, B = unknown>(url: string, body?: B) => {
    const res = await http.patch<T>(url, body);
    return res.data;
  },
  delete: async <T>(url: string) => {
    const res = await http.delete<T>(url);
    return res.data;
  },
};
