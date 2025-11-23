"use client";

import { usePathname } from "next/navigation";
import { memo } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

// Routes that should NOT show sidebar
const NO_SIDEBAR_ROUTES = ["/", "/login", "/forgot-password", "/reset-password"];

function SidebarWrapperContent() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  // Don't show sidebar on auth pages or if not authenticated
  if (NO_SIDEBAR_ROUTES.includes(pathname) || !isAuthenticated) {
    return null;
  }

  return <Sidebar />;
}

export const SidebarWrapper = memo(SidebarWrapperContent);

