import { API_URLS } from "./constants";

type RequestConfig = RequestInit & {
  skipAuth?: boolean;
};

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { skipAuth, headers, ...customConfig } = config;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const authHeaders: HeadersInit = {};
    if (token && !skipAuth) {
      authHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...customConfig,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...headers,
      },
    });

    if (response.status === 401) {
        if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/auth/signin?next=${encodeURIComponent(currentPath)}`;
      }
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API Error: ${response.status}`);
    }

    // Handle empty responses
    const contentLength = response.headers.get("content-length");
    if (contentLength === "0") {
      return {} as T;
    }

    try {
      return await response.json();
    } catch {
      // Fallback for non-JSON responses if needed, though we expect JSON
      return {} as T;
    }
  }

  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  post<T>(endpoint: string, body: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: "POST", body: JSON.stringify(body) });
  }

  put<T>(endpoint: string, body: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: "PUT", body: JSON.stringify(body) });
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_URLS.GATEWAY);
