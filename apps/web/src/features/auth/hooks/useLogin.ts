import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/useAuthStore";
import type { LoginFormData } from "../schemas/login.schema";
import type { AuthError } from "../types/errors";

export function useLogin() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      // Error is already handled by store, re-throw for component handling
      const error = err as AuthError;
      throw error;
    }
  };

  return {
    handleLogin,
    isLoading,
    error,
    clearError,
  };
}

