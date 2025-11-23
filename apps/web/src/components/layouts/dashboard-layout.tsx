"use client";

import { Sidebar } from "@/components/navigation/sidebar";

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}
