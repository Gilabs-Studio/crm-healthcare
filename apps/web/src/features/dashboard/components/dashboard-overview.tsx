"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardOverview } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Users, MapPin, Activity } from "lucide-react";

export function DashboardOverview() {
  const { data, isLoading } = useDashboardOverview({ period: "today" });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const overview = data?.data;

  if (!overview) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.visit_stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {overview.visit_stats.completed} completed, {overview.visit_stats.pending} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.account_stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {overview.account_stats.active} active, {overview.account_stats.inactive} inactive
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.activity_stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {overview.activity_stats.visits} visits, {overview.activity_stats.calls} calls, {overview.activity_stats.emails} emails
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Approved Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.visit_stats.approved}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {overview.visit_stats.rejected} rejected
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

