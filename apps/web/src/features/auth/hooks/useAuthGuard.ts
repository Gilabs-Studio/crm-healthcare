import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../stores/useAuthStore";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check localStorage directly for initial load
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const storeState = useAuthStore.getState();
      
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
        setIsChecking(false);
        if (pathname !== "/") {
          router.push("/");
        }
      }
    } else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  // Only redirect if we're sure user is not authenticated
  useEffect(() => {
    if (!isChecking && !isAuthenticated && pathname !== "/") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isChecking, pathname, router]);

  // Check if we have token (for initial render)
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");
  const isLoading = isChecking || (!isAuthenticated && hasToken);

  return {
    isAuthenticated: isAuthenticated || hasToken,
    isLoading,
  };
}
