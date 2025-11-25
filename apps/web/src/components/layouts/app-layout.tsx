"use client";

import { usePathname } from "next/navigation";
import { SidebarWrapper } from "./sidebar-wrapper";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

// Routes that should NOT show sidebar
const NO_SIDEBAR_ROUTES = ["/", "/login", "/forgot-password", "/reset-password"];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  
  // Determine if sidebar should be shown
  const hasSidebar = !NO_SIDEBAR_ROUTES.includes(pathname) && isAuthenticated;

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarWrapper />
      <main className={cn("flex-1 transition-all duration-200", hasSidebar && "ml-64")}>
        <Breadcrumb />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

