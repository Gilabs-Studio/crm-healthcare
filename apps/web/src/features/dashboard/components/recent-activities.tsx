"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentActivities } from "../hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Clock, Building2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const activityIcons: Record<string, React.ReactNode> = {
  visit: <Activity className="h-4 w-4" />,
  call: <Activity className="h-4 w-4" />,
  email: <Activity className="h-4 w-4" />,
  task: <Activity className="h-4 w-4" />,
  deal: <Activity className="h-4 w-4" />,
};

export function RecentActivities() {
  const { data, isLoading } = useRecentActivities({ limit: 10 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
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

  const activities = data?.data || [];

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No recent activities</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <CardTitle>Recent Activities</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="mt-0.5">
                {activityIcons[activity.type] || <Activity className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
                <div className="text-sm">{activity.description}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {activity.account && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span>{activity.account.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{activity.user.name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

