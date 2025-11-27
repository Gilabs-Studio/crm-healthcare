"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeals } from "@/features/sales-crm/pipeline-management/hooks/useDeals";

export function LeadsTable() {
  const t = useTranslations("dashboardOverview");
  const { data, isLoading } = useDeals({
    status: "open",
    page: 1,
    per_page: 5,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("leadsTable.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const leads = data?.data ?? [];

  if (leads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("leadsTable.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("leadsTable.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {t("leadsTable.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 text-left font-medium">
                  {t("leadsTable.columns.status")}
                </th>
                <th className="py-2 text-left font-medium">
                  {t("leadsTable.columns.email")}
                </th>
                <th className="py-2 text-right font-medium">
                  {t("leadsTable.columns.amount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((deal) => (
                <tr key={deal.id} className="border-b last:border-0">
                  <td className="py-2">
                    <span className="capitalize">
                      {deal.status === "won"
                        ? t("leadsTable.status.won")
                        : deal.status === "lost"
                        ? t("leadsTable.status.lost")
                        : t("leadsTable.status.open")}
                    </span>
                  </td>
                  <td className="py-2">
                    {deal.contact?.email ?? deal.account?.name ?? "-"}
                  </td>
                  <td className="py-2 text-right">
                    {deal.value_formatted ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}


