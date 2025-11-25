"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Download, FileSpreadsheet, FileText as FileTextIcon, ChevronDown } from "lucide-react";
import { useVisitReportReport } from "../hooks/useReports";
import { usePipelineReport } from "../hooks/useReports";
import { useSalesPerformanceReport } from "../hooks/useReports";
import { VisitReportViewer } from "./visit-report-viewer";
import { PipelineReportViewer } from "./pipeline-report-viewer";
import { SalesPerformanceReportViewer } from "./sales-performance-report-viewer";
import { SalesFunnelViewer } from "./sales-funnel-viewer";
import { reportService } from "../services/reportService";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function ReportGenerator() {
  const [reportType, setReportType] = useState<"visit" | "pipeline" | "sales-performance">("visit");
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState<string>("");
  const [salesRepId, setSalesRepId] = useState<string>("");
  const [status, setStatus] = useState<string>("all");
  const [exportPopoverOpen, setExportPopoverOpen] = useState(false);

  const visitReportParams = {
    start_date: startDate,
    end_date: endDate,
    account_id: accountId || undefined,
    sales_rep_id: salesRepId || undefined,
    status: status === "all" ? undefined : status,
  };

  const { data: visitReport, isLoading: visitLoading } = useVisitReportReport(visitReportParams);
  const { data: pipelineReport, isLoading: pipelineLoading } = usePipelineReport({
    start_date: startDate,
    end_date: endDate,
  });
  const { data: salesPerformanceReport, isLoading: salesLoading } = useSalesPerformanceReport({
    start_date: startDate,
    end_date: endDate,
    sales_rep_id: salesRepId || undefined,
  });

  const exportMutation = useMutation({
    mutationFn: async (format: "csv" | "excel") => {
      let blob: Blob;
      let filename: string;

      switch (reportType) {
        case "visit":
          blob = await reportService.exportVisitReportReport(visitReportParams, format);
          filename = `visit-report-${startDate}-${endDate}.${format === "csv" ? "csv" : "xlsx"}`;
          break;
        case "pipeline":
          blob = await reportService.exportPipelineReport(
            {
              start_date: startDate,
              end_date: endDate,
            },
            format
          );
          filename = `pipeline-report-${startDate}-${endDate}.${format === "csv" ? "csv" : "xlsx"}`;
          break;
        case "sales-performance":
          blob = await reportService.exportSalesPerformanceReport(
            {
              start_date: startDate,
              end_date: endDate,
              sales_rep_id: salesRepId || undefined,
            },
            format
          );
          filename = `sales-performance-report-${startDate}-${endDate}.${format === "csv" ? "csv" : "xlsx"}`;
          break;
        default:
          throw new Error("Invalid report type");
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success("Report exported successfully");
    },
    onError: (error) => {
      toast.error("Failed to export report");
      console.error("Export error:", error);
    },
  });

  const handleExport = (format: "csv" | "excel") => {
    exportMutation.mutate(format);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-id">Account ID (Optional)</Label>
              <Input
                id="account-id"
                placeholder="Filter by account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-rep-id">Sales Rep ID (Optional)</Label>
              <Input
                id="sales-rep-id"
                placeholder="Filter by sales rep"
                value={salesRepId}
                onChange={(e) => setSalesRepId(e.target.value)}
              />
            </div>
          </div>

          {reportType === "visit" && (
            <div className="space-y-2">
              <Label htmlFor="status">Status (Optional)</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Popover open={exportPopoverOpen} onOpenChange={setExportPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  disabled={exportMutation.isPending}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {exportMutation.isPending ? "Exporting..." : "Export Report"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleExport("csv");
                      setExportPopoverOpen(false);
                    }}
                    disabled={exportMutation.isPending}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileTextIcon className="h-4 w-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      handleExport("excel");
                      setExportPopoverOpen(false);
                    }}
                    disabled={exportMutation.isPending}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export as Excel
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={reportType} onValueChange={(v) => setReportType(v as typeof reportType)}>
            <TabsList>
              <TabsTrigger value="visit">Visit Reports</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="sales-performance">Sales Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="visit" className="mt-6">
              <VisitReportViewer data={visitReport?.data} isLoading={visitLoading} />
            </TabsContent>

            <TabsContent value="pipeline" className="mt-6">
              <SalesFunnelViewer data={pipelineReport?.data} isLoading={pipelineLoading} />
            </TabsContent>

            <TabsContent value="sales-performance" className="mt-6">
              <SalesPerformanceReportViewer
                data={salesPerformanceReport?.data}
                isLoading={salesLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

