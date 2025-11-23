"use client";

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
}

// DashboardLayout no longer includes Sidebar as it's now in root layout
// This component is kept for backward compatibility and styling consistency
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return <>{children}</>;
}
