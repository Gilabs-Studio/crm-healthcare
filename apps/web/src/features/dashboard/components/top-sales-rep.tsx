"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopSalesRep } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MapPin, Building2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export function TopSalesRep() {
  const { data, isLoading } = useTopSalesRep({ limit: 5 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Sales Reps</CardTitle>
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

  const topSalesReps = data?.data || [];

  if (topSalesReps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Sales Reps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No sales reps found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAvatarUrl = (email: string) => {
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(email)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle>Top Sales Reps</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topSalesReps.map((salesRep) => (
            <div
              key={salesRep.sales_rep.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={getAvatarUrl(salesRep.sales_rep.email)}
                    alt={salesRep.sales_rep.name}
                  />
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{salesRep.sales_rep.name}</div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{salesRep.visit_count} visits</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span>{salesRep.account_count} accounts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>{salesRep.activity_count} activities</span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant="outline">{salesRep.visit_count}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

