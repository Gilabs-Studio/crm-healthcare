"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PipelineReport } from "../types";

interface SalesFunnelTableProps {
  data: PipelineReport;
}

// Mock data structure - will be replaced when Deal API is available
interface DealRow {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  stage: string;
  value: number;
  probability: number;
  expected_revenue: number;
  creation_date: string;
  expected_close_date: string;
  team_member: string;
  progress_to_won: number;
  last_interacted_on: string;
  next_step: string;
  status: "available" | "placeholder";
}

export function SalesFunnelTable({ data }: SalesFunnelTableProps) {
  const t = useTranslations("reportsFeature.salesFunnelTable");
  // Calculate expected revenue from summary (placeholder until deals API is available)
  const grandTotalValue = data.summary.total_value;
  const grandTotalExpected = data.summary.total_value * 0.5; // Placeholder calculation

  // Mock data - will be replaced with actual API call when Deal module is ready
  const mockDeals: DealRow[] = [
    {
      id: "deal_1",
      company_name: "Rumah Sakit Umum",
      contact_name: "Dr. John Doe",
      contact_email: "john@rsu.example.com",
      stage: "Proposal",
      value: 50000000,
      probability: 75,
      expected_revenue: 37500000,
      creation_date: "2025-01-15",
      expected_close_date: "2025-02-28",
      team_member: "Sales Rep A",
      progress_to_won: 75,
      last_interacted_on: "2025-01-20",
      next_step: "Follow-up proposal",
      status: "placeholder",
    },
    {
      id: "deal_2",
      company_name: "Klinik Sehat",
      contact_name: "Dr. Jane Smith",
      contact_email: "jane@klinik.example.com",
      stage: "Qualified",
      value: 30000000,
      probability: 50,
      expected_revenue: 15000000,
      creation_date: "2025-01-10",
      expected_close_date: "2025-03-15",
      team_member: "Sales Rep B",
      progress_to_won: 50,
      last_interacted_on: "2025-01-18",
      next_step: "Schedule meeting",
      status: "placeholder",
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      Lead: "bg-gray-100 text-gray-800",
      Contacted: "bg-blue-100 text-blue-800",
      Qualified: "bg-yellow-100 text-yellow-800",
      Proposal: "bg-orange-100 text-orange-800",
      Negotiation: "bg-purple-100 text-purple-800",
      Won: "bg-green-100 text-green-800",
      Lost: "bg-red-100 text-red-800",
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      {/* Reminder for missing data */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p className="text-sm">
            <strong>{t("noteTitle")}</strong>{" "}
            {t("noteIntro")}
          </p>
          <ul className="text-sm mt-2 list-disc list-inside space-y-1">
            <li>
              <strong>{t("noteEndpoint").split(":")[0]}:</strong>{" "}
              {t("noteEndpoint").split(":")[1] ?? ""}
            </li>
            <li>
              <strong>{t("noteFields").split(":")[0]}:</strong>{" "}
              {t("noteFields").split(":")[1] ?? ""}
            </li>
            <li>
              <strong>{t("noteProgress").split(":")[0]}:</strong>{" "}
              {t("noteProgress").split(":")[1] ?? ""}
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.companyName")}</TableHead>
                  <TableHead>{t("columns.contactName")}</TableHead>
                  <TableHead>{t("columns.contactEmail")}</TableHead>
                  <TableHead>{t("columns.stage")}</TableHead>
                  <TableHead className="text-right">
                    {t("columns.value")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("columns.probability")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("columns.expectedRevenue")}
                  </TableHead>
                  <TableHead>{t("columns.creationDate")}</TableHead>
                  <TableHead>{t("columns.expectedCloseDate")}</TableHead>
                  <TableHead>{t("columns.teamMember")}</TableHead>
                  <TableHead>{t("columns.progressToWon")}</TableHead>
                  <TableHead>{t("columns.lastInteractedOn")}</TableHead>
                  <TableHead>{t("columns.nextStep")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Grand Total Row */}
                <TableRow className="bg-red-50 font-bold">
                  <TableCell colSpan={4}>{t("grandTotal")}</TableCell>
                  <TableCell className="text-right">{formatCurrency(grandTotalValue)}</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">{formatCurrency(grandTotalExpected)}</TableCell>
                  <TableCell colSpan={6}>-</TableCell>
                </TableRow>

                {/* Deal Rows */}
                {mockDeals.map((deal) => (
                  <TableRow key={deal.id} className={deal.status === "placeholder" ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{deal.company_name}</TableCell>
                    <TableCell>
                      <span className={deal.status === "placeholder" ? "underline" : ""}>
                        {deal.contact_name}
                      </span>
                    </TableCell>
                    <TableCell>{deal.contact_email}</TableCell>
                    <TableCell>
                      <Badge className={getStageColor(deal.stage)}>{deal.stage}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(deal.value)}</TableCell>
                    <TableCell className="text-right">{deal.probability}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(deal.expected_revenue)}</TableCell>
                    <TableCell>{formatDate(deal.creation_date)}</TableCell>
                    <TableCell>
                      <span className={deal.status === "placeholder" ? "text-red-600" : ""}>
                        {formatDate(deal.expected_close_date)}
                      </span>
                    </TableCell>
                    <TableCell>{deal.team_member}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-24">
                        <Progress value={deal.progress_to_won} className="flex-1" />
                        <span className="text-xs text-muted-foreground">{deal.progress_to_won}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={deal.status === "placeholder" ? "text-muted-foreground italic" : ""}>
                        {deal.status === "placeholder"
                          ? "N/A (Sprint 2)"
                          : formatDate(deal.last_interacted_on)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={deal.status === "placeholder" ? "text-muted-foreground italic" : ""}>
                        {deal.status === "placeholder" ? "N/A (Sprint 2)" : deal.next_step}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Empty state if no deals */}
                {mockDeals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                      {t("emptyDeals")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

