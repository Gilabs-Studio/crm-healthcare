"use client";

import { usePathname } from "next/navigation";
import { SidebarWrapper } from "./sidebar-wrapper";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

// Routes that should NOT show sidebar
const NO_SIDEBAR_ROUTES = ["/", "/login", "/forgot-password", "/reset-password"];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { collapsed } = useSidebar();
  
  // Determine if sidebar should be shown
  const hasSidebar = !NO_SIDEBAR_ROUTES.includes(pathname) && isAuthenticated;

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarWrapper />
      <main
        className={cn(
          "flex-1 transition-[margin-left] duration-200 ease-in-out will-change-[margin-left]",
          hasSidebar && (collapsed ? "ml-16" : "ml-64")
        )}
      >
        <Breadcrumb />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

