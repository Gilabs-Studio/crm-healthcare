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
import { FileText, Download, Calendar } from "lucide-react";
import { useVisitReportReport } from "../hooks/useReports";
import { usePipelineReport } from "../hooks/useReports";
import { useSalesPerformanceReport } from "../hooks/useReports";
import { VisitReportViewer } from "./visit-report-viewer";
import { PipelineReportViewer } from "./pipeline-report-viewer";
import { SalesPerformanceReportViewer } from "./sales-performance-report-viewer";

export function ReportGenerator() {
  const [reportType, setReportType] = useState<"visit" | "pipeline" | "sales-performance">("visit");
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState<string>("");
  const [salesRepId, setSalesRepId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const visitReportParams = {
    start_date: startDate,
    end_date: endDate,
    account_id: accountId || undefined,
    sales_rep_id: salesRepId || undefined,
    status: status || undefined,
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

  const handleGenerate = () => {
    // Reports are auto-generated when params change due to React Query
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export report");
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
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={handleGenerate}>
              <Calendar className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
              <PipelineReportViewer data={pipelineReport?.data} isLoading={pipelineLoading} />
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

