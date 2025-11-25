"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle } from "lucide-react";
import type { PipelineReport } from "../types";
import { SalesFunnelTable } from "./sales-funnel-table";
import { SalesFunnelInsights } from "./sales-funnel-insights";

interface SalesFunnelViewerProps {
  data?: PipelineReport;
  isLoading: boolean;
}

export function SalesFunnelViewer({ data, isLoading }: SalesFunnelViewerProps) {
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
      {/* Reminder Alert for Missing Data */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Data Availability Notice</AlertTitle>
        <AlertDescription>
          <p className="text-sm mb-2">
            This Sales Funnel view displays available data from the current sprint. Some fields may show placeholders
            until the Sales Pipeline Management module is fully implemented (Sprint 2 - Dev2).
          </p>
          <p className="text-sm font-medium">
            Fields that will be available after Sprint 2: Deal details, Contact information, Last interaction dates,
            Next steps, and Progress indicators.
          </p>
        </AlertDescription>
      </Alert>

      {/* Main Tabs */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Sales Funnel</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-6">
          <SalesFunnelTable data={data} />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <SalesFunnelInsights data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

