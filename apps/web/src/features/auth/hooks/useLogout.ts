"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "../stores/useAuthStore";

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  return handleLogout;
}


