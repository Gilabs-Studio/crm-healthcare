"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

export function useUserPermissions() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User not authenticated");
      return userService.getPermissions(user.id);
    },
    enabled: !!user?.id,
  });
}

