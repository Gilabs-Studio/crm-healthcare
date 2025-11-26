"use client";

import type React from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

// AppLayout wraps all authenticated pages with the main DashboardLayout (sidebar + header)
export function AppLayout({ children }: AppLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

