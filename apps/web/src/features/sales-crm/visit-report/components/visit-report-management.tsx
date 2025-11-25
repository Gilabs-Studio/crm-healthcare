"use client";

import { VisitReportList } from "./visit-report-list";

export function VisitReportManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visit Reports</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage sales visits with check-in/out, GPS, and documentation
        </p>
      </div>
      <VisitReportList />
    </div>
  );
}

