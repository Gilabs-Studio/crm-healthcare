"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Building2, Users, Calendar } from "lucide-react";
import type { VisitReportReport } from "../types";

interface VisitReportViewerProps {
  data?: VisitReportReport;
  isLoading: boolean;
}

export function VisitReportViewer({ data, isLoading }: VisitReportViewerProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No data available. Please generate a report.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* By Account */}
      {data.by_account && data.by_account.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>By Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.by_account.map((item) => (
                <div
                  key={item.account.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="font-medium">{item.account.name}</div>
                  <div className="text-sm text-muted-foreground">{item.visit_count} visits</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* By Sales Rep */}
      {data.by_sales_rep && data.by_sales_rep.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>By Sales Rep</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.by_sales_rep.map((item) => (
                <div
                  key={item.sales_rep.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="font-medium">{item.sales_rep.name}</div>
                  <div className="text-sm text-muted-foreground">{item.visit_count} visits</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* By Date */}
      {data.by_date && data.by_date.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>By Date</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.by_date.slice(0, 20).map((item) => (
                <div key={item.date} className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground w-32">
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded-full relative overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${
                            (item.count /
                              Math.max(...data.by_date.map((d) => d.count), 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium w-12 text-right">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

