 "use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { useEffect } from "react";
import { userService } from "../services/userService";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { AxiosError } from "axios";

export function useUserPermissions() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  
  const query = useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User not authenticated");
      return userService.getPermissions(user.id);
    },
    enabled: !!user?.id,
    retry: false, // Don't retry on 404 - user doesn't exist
  });

  // Handle 404 error - user not found, clear auth and redirect
  useEffect(() => {
    if (query.error) {
      const error = query.error as AxiosError<{
        success: false;
        error: {
          code: string;
          message: string;
        };
      }>;
      
      // If user not found (404) or USER_NOT_FOUND error, clear auth state
      if (
        error.response?.status === 404 ||
        error.response?.data?.error?.code === "USER_NOT_FOUND"
      ) {
        // Clear auth state and redirect to locale-scoped login
        logout();
        router.push("/login");
      }
    }
  }, [query.error, logout, router]);

  return query;
}

