import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { formatError } from "./i18n/error-messages";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
const failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  const queue = [...failedQueue];
  failedQueue.splice(0, failedQueue.length); // Clear array
  queue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
};

// Request interceptor untuk menambahkan token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

interface ErrorDetails {
  field?: string;
  resource?: string;
  value?: string;
  [key: string]: unknown;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetails;
    field_errors?: Array<{ field: string; message: string }>;
  };
  timestamp: string;
  request_id: string;
}

// Response interceptor untuk handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    // Network error (tidak terhubung ke server) - lebih jelas dan awam
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        const msg = formatError("network", "timeout");
        toast.error(msg.title, {
          description: msg.description,
        });
      } else if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        const msg = formatError("network", "connectionFailed");
        toast.error(msg.title, {
          description: msg.description,
        });
      } else {
        const msg = formatError("network", "generic");
        toast.error(msg.title, {
          description: msg.description,
        });
      }
      return Promise.reject(error);
    }

    // HTTP error responses
    const status = error.response.status;
    const errorData = error.response.data;

    if (!errorData || !errorData.error) {
      const msg = formatError("backend", "invalidFormat");
      toast.error(msg.title, {
        description: msg.description,
      });
      return Promise.reject(error);
    }

    const errorCode = errorData.error.code;
    const errorDetails = errorData.error.details;
    const fieldErrors = errorData.error.field_errors;

    // Handle specific error codes
    if (errorCode === "RESOURCE_ALREADY_EXISTS" || errorCode === "CONFLICT") {
      // Handle duplicate email or other resource conflicts - lebih jelas dan awam
      if (errorDetails?.field === "email" && errorDetails?.resource === "user") {
        const msg = formatError("backend", "emailExists", {
          email: String(errorDetails.value || ""),
        });
        toast.error(msg.title, {
          description: msg.description,
        });
      } else if (errorDetails?.field && errorDetails?.resource) {
        const msg = formatError("backend", "resourceExists", {
          field: errorDetails.field,
          value: String(errorDetails.value || ""),
        });
        toast.error(msg.title, {
          description: msg.description,
        });
      } else {
        const msg = formatError("backend", "conflict");
        toast.error(msg.title, {
          description: msg.description,
        });
      }
      return Promise.reject(error);
    }

    // Handle INTERNAL_SERVER_ERROR with details (e.g., duplicate email from database constraint)
    if (errorCode === "INTERNAL_SERVER_ERROR" && errorDetails) {
      if (errorDetails.field === "email" && errorDetails.resource === "user") {
        const msg = formatError("backend", "emailExists", {
          email: String(errorDetails.value || ""),
        });
        toast.error(msg.title, {
          description: msg.description,
        });
        return Promise.reject(error);
      }
      // Other internal errors with details
      if (errorDetails.field && errorDetails.resource) {
        const msg = formatError("backend", "resourceExists", {
          field: errorDetails.field,
          value: String(errorDetails.value || ""),
        });
        toast.error(msg.title, {
          description: msg.description,
        });
        return Promise.reject(error);
      }
    }

    // Handle validation errors
    if (errorCode === "VALIDATION_ERROR" && fieldErrors && fieldErrors.length > 0) {
      const firstError = fieldErrors[0];
      const msg = formatError("backend", "fieldError", {
        field: firstError.field,
        message: firstError.message,
      });
      toast.error(msg.title, {
        description: msg.description,
      });
      return Promise.reject(error);
    }

    // Handle HTTP status codes
    if (status === 401) {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Skip refresh if this is already a retry or if it's a refresh token request
      if (originalRequest?._retry || originalRequest?.url?.includes("/auth/refresh")) {
        // Refresh failed or already retried, logout user
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          const msg = formatError("backend", "unauthorized");
          toast.error(msg.title, {
            description: msg.description,
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        }
        return Promise.reject(error);
      }

      // Try to refresh token
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

        if (!refreshToken) {
          // No refresh token, logout
          isRefreshing = false;
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            const msg = formatError("backend", "unauthorized");
            toast.error(msg.title, {
              description: msg.description,
            });
            setTimeout(() => {
              window.location.href = "/";
            }, 1000);
          }
          processQueue(error, null);
          return Promise.reject(error);
        }

        // Create separate axios instance for refresh to avoid circular dependency
        const refreshClient = axios.create({
          baseURL: `${API_BASE_URL}/api/v1`,
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        });

        // Call refresh token endpoint directly
        return refreshClient
          .post<{
            success: boolean;
            data?: {
              user: {
                id: string;
                email: string;
                name: string;
                role: string;
                permissions: string[];
                created_at: string;
                updated_at: string;
              };
              token: string;
              refresh_token: string;
              expires_in: number;
            };
          }>("/auth/refresh", {
            refresh_token: refreshToken,
          })
          .then((refreshResponse) => {
            const response = refreshResponse.data;
            if (response.success && response.data) {
              const { user, token, refresh_token } = response.data;
              if (typeof window !== "undefined") {
                localStorage.setItem("token", token);
                localStorage.setItem("refreshToken", refresh_token);
                // Update cookie
                document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
              }

              // Update auth store with user data and tokens
              import("@/features/auth/stores/useAuthStore").then(({ useAuthStore }) => {
                useAuthStore.getState().setToken(token);
                useAuthStore.getState().setUser(user);
                useAuthStore.setState({
                  refreshToken: refresh_token,
                  isAuthenticated: true,
                });
              });

              // Update original request with new token
              if (originalRequest?.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              originalRequest._retry = true;

              processQueue(null, token);
              isRefreshing = false;

              // Retry original request
              return apiClient(originalRequest);
            } else {
              throw new Error("Refresh token failed");
            }
          })
          .catch((refreshError) => {
            // Refresh failed, logout user
            isRefreshing = false;
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              const msg = formatError("backend", "unauthorized");
              toast.error(msg.title, {
                description: msg.description,
              });
              setTimeout(() => {
                window.location.href = "/";
              }, 1000);
            }
            processQueue(refreshError as AxiosError, null);
            return Promise.reject(refreshError);
          });
      } else {
        // Already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest?.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            originalRequest._retry = true;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
    } else if (status === 403) {
      const msg = formatError("backend", "forbidden");
      toast.error(msg.title, {
        description: msg.description,
      });
    } else if (status === 404) {
      // Only show 404 toast for mutations, not queries (to avoid showing on page refresh)
      const isMutation = error.config?.method && ["post", "put", "patch", "delete"].includes(error.config.method.toLowerCase());
      if (isMutation) {
        const msg = formatError("backend", "notFound");
        toast.error(msg.title, {
          description: msg.description,
        });
      }
    } else if (status === 409) {
      // Conflict - already handled above but keep as fallback
      const msg = formatError("backend", "conflict");
      toast.error(msg.title, {
        description: msg.description,
      });
    } else if (status === 503) {
      const msg = formatError("backend", "serviceUnavailable");
      toast.error(msg.title, {
        description: msg.description,
      });
    } else if (status === 429) {
      const msg = formatError("backend", "rateLimit");
      toast.error(msg.title, {
        description: msg.description,
      });
    } else if (status >= 500) {
      const msg = formatError("backend", "serverError");
      toast.error(msg.title, {
        description: msg.description,
      });
    } else {
      // Other 4xx errors
      const msg = formatError("backend", "unexpectedError");
      toast.error(msg.title, {
        description: msg.description,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
