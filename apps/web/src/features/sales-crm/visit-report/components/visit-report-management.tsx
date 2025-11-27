"use client";

import { VisitReportList } from "./visit-report-list";
import { useTranslations } from "next-intl";

export function VisitReportManagement() {
  const t = useTranslations("visitReportManagement.page");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("description")}
        </p>
      </div>
      <VisitReportList />
    </div>
  );
}

