"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeads } from "@/features/sales-crm/lead-management/hooks/useLeads";
import { User, Mail, TrendingUp } from "lucide-react";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "outline",
  contacted: "secondary",
  qualified: "default",
  unqualified: "secondary",
  nurturing: "secondary",
  disqualified: "destructive",
  converted: "default",
  lost: "destructive",
};

// Status ditampilkan langsung seperti di lead-list, dengan capitalize

export function LeadsTable() {
  const t = useTranslations("dashboardOverview");
  const router = useRouter();
  const { data, isLoading, isError } = useLeads({
    page: 1,
    per_page: 5,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("leadsTable.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-12 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("leadsTable.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("leadsTable.error")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const leads = data?.data ?? [];

  if (leads.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("leadsTable.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-2">
              {t("leadsTable.empty")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("leadsTable.emptyDescription")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getLeadName = (lead: {
    first_name?: string;
    last_name?: string;
    company_name?: string;
  }): string => {
    const firstName = lead.first_name ?? "";
    const lastName = lead.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || lead.company_name || "-";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t("leadsTable.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-3 px-2 text-left font-semibold">
                  {t("leadsTable.columns.name")}
                </th>
                <th className="py-3 px-2 text-left font-semibold">
                  {t("leadsTable.columns.email")}
                </th>
                <th className="py-3 px-2 text-left font-semibold">
                  {t("leadsTable.columns.status")}
                </th>
                <th className="py-3 px-2 text-right font-semibold">
                  {t("leadsTable.columns.amount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const leadName = getLeadName(lead);
                const leadStatus = lead.lead_status ?? "";
                const statusVariant = statusColors[leadStatus] ?? "outline";

                return (
                  <tr
                    key={lead.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <button
                        onClick={() => router.push("/leads")}
                        className="font-medium hover:text-primary transition-colors flex items-center gap-2 group text-left w-full"
                      >
                        <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        <span className="truncate max-w-[200px]" title={leadName}>
                          {leadName}
                        </span>
                      </button>
                      {lead.company_name && leadName !== lead.company_name && (
                        <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px] ml-6">
                          {lead.company_name}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-2 font-medium text-primary hover:underline group"
                        >
                          <Mail className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          <span className="truncate max-w-[200px]" title={lead.email}>
                            {lead.email}
                          </span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate max-w-[200px] text-muted-foreground">-</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={statusVariant} className="text-xs capitalize">
                        {leadStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {lead.opportunity?.value
                        ? (
                            <span className="font-medium">
                              {formatCurrency(lead.opportunity.value)}
                            </span>
                          )
                        : lead.lead_score && lead.lead_score > 0
                        ? (
                            <span className="text-muted-foreground text-xs">
                              Score: {lead.lead_score}
                            </span>
                          )
                        : (
                            <span className="text-muted-foreground">-</span>
                          )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}


