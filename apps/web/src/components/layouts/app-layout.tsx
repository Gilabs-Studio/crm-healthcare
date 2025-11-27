"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

// AppLayout wraps only authenticated pages with the main DashboardLayout (sidebar + header).
// Public routes (e.g. the landing/login page at "/") are rendered without the dashboard chrome.
export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const publicRoutes: readonly string[] = ["/"];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}


