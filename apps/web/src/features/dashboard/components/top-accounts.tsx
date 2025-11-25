"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopAccounts } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TopAccounts() {
  const { data, isLoading } = useTopAccounts({ limit: 5 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topAccounts = data?.data || [];

  if (topAccounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No accounts found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <CardTitle>Top Accounts</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topAccounts.map((account) => (
            <div
              key={account.account.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium">{account.account.name}</div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{account.visit_count} visits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span>{account.activity_count} activities</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline">{account.visit_count}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

