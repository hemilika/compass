import axios, { AxiosError, type AxiosInstance } from "axios";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function createHttpClient(): AxiosInstance {
  const instance = axios.create({ baseURL, withCredentials: false });

  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      try {
        const isAuthed = localStorage.getItem("mock-auth") === "true";
        if (isAuthed) {
          config.headers = config.headers ?? {};
          config.headers["Authorization"] = `Bearer mock-token`;
        }
      } catch {}
    }
    config.headers = config.headers ?? {};
    config.headers["Content-Type"] =
      config.headers["Content-Type"] ?? "application/json";
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      const apiError: ApiError = {
        status: (error.response?.status as number) || 0,
        message:
          (error.response?.data as any)?.message ||
          error.message ||
          "Request failed",
        details: error.response?.data,
      };
      if (typeof window !== "undefined" && apiError.status === 401) {
        try {
          localStorage.setItem("mock-auth", "false");
        } catch {}
      }
      return Promise.reject(apiError);
    }
  );

  return instance;
}

export const http = createHttpClient();

export const api = {
  get: async <T>(url: string, params?: Record<string, any>) => {
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
