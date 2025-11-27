import { useEffect, useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useAuthStore } from "../stores/useAuthStore";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  
  // Initialize as checking to avoid hydration mismatch
  // Server and client will both start with isChecking=true
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check localStorage directly for initial load (only on client)
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("token");

    // If we have token in localStorage, wait a bit for Zustand to rehydrate
    if (token) {
      // Give Zustand time to rehydrate (max 500ms)
      const timer = setTimeout(() => {
        const currentState = useAuthStore.getState();
        setIsChecking(false);
        
        // If still not authenticated after rehydration, check token validity
        if (!currentState.isAuthenticated && pathname !== "/") {
          // Token exists but store not authenticated - might be invalid
          // Let it through and let API handle it
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // No token, check immediately
      // Use setTimeout to defer setState and avoid setState in effect
      setTimeout(() => setIsChecking(false), 0);
      if (pathname !== "/login") {
        // Redirect unauthenticated users to locale-scoped login ("/[locale]/login")
        router.push("/login");
      }
    }
  }, [pathname, router]);

  // Only redirect if we're sure user is not authenticated
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!isChecking && !isAuthenticated && pathname !== "/login") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isChecking, pathname, router]);

  // Check if we have token (only on client)
  // This will be false on server, true on client if token exists
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");
  // Always show loading during SSR and initial client render to avoid hydration mismatch
  const isLoading = isChecking || (!isAuthenticated && hasToken);

  return {
    isAuthenticated: isAuthenticated || hasToken,
    isLoading,
  };
}
