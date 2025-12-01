"use client";

import { VisitReportList } from "./visit-report-list";
import { useTranslations } from "next-intl";

export function VisitReportManagement() {
  return (
    <div className="space-y-6">
      <VisitReportList />
    </div>
  );
}

