"use client";

import { FileText, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VisitReportList } from "./visit-report-list";
import { ActivityTypeList } from "./activity-type-list";
import { useHasPermission } from "@/features/master-data/user-management/hooks/useHasPermission";

export function VisitReportManagement() {
  const hasVisitReportsPermission = useHasPermission("VIEW_VISIT_REPORTS");
  const hasActivityPermission = useHasPermission("ACTIVITY");
  const t = useTranslations("visitReportManagement.tabs");

  // Determine default tab - use first available tab
  const defaultTab = hasVisitReportsPermission ? "visit-reports" : "activity-types";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList>
        {hasVisitReportsPermission && (
          <TabsTrigger value="visit-reports" className="gap-2">
            <FileText className="h-4 w-4" />
            {t("visitReports")}
          </TabsTrigger>
        )}
        {hasActivityPermission && (
          <TabsTrigger value="activity-types" className="gap-2">
            <Settings className="h-4 w-4" />
            {t("activityTypes")}
          </TabsTrigger>
        )}
      </TabsList>

      {hasVisitReportsPermission && (
        <TabsContent value="visit-reports" className="mt-6">
          <VisitReportList />
        </TabsContent>
      )}

      {hasActivityPermission && (
        <TabsContent value="activity-types" className="mt-6">
          <ActivityTypeList />
        </TabsContent>
      )}
    </Tabs>
  );
}

