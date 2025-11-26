"use client";

import type React from "react";

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

// AppLayout is now a thin shell – main layout & navigation are handled by DashboardLayout per page
export function AppLayout({ children }: AppLayoutProps) {
  return <>{children}</>;
}


