import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

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

// Response interceptor untuk handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Network error (tidak terhubung ke server)
    if (!error.response) {
      if (error.code === "ECONNABORTED" || error.message === "Network Error") {
        toast.error("Tidak dapat terhubung ke server", {
          description: "Pastikan server backend sedang berjalan",
        });
      } else if (error.code === "ERR_NETWORK") {
        toast.error("Koneksi gagal", {
          description: "Tidak dapat terhubung ke backend. Periksa koneksi internet atau pastikan server berjalan.",
        });
      } else {
        toast.error("Terjadi kesalahan", {
          description: error.message || "Gagal melakukan request",
        });
      }
      return Promise.reject(error);
    }

    // HTTP error responses
    const status = error.response.status;
    const errorData = error.response.data as { error?: { code?: string; message?: string }; message?: string };

    if (status === 401) {
      // Token expired, clear auth and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        toast.error("Sesi telah berakhir", {
          description: "Silakan login kembali",
        });
        window.location.href = "/";
      }
    } else if (status === 403) {
      toast.error("Akses ditolak", {
        description: errorData?.error?.message || "Anda tidak memiliki izin untuk melakukan aksi ini",
      });
    } else if (status === 404) {
      toast.error("Data tidak ditemukan", {
        description: errorData?.error?.message || "Resource yang diminta tidak ditemukan",
      });
    } else if (status >= 500) {
      toast.error("Server error", {
        description: errorData?.error?.message || "Terjadi kesalahan pada server",
      });
    } else {
      // Other 4xx errors
      const message = errorData?.error?.message || errorData?.message || "Terjadi kesalahan";
      toast.error("Request gagal", {
        description: message,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;

