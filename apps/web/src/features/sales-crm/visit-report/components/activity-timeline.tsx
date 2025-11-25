"use client";

import { Activity, Clock, User, Building2, Contact, Phone, Mail, CheckSquare, TrendingUp } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Activity as ActivityType } from "../types/activity";

interface ActivityTimelineProps {
  readonly activities: ActivityType[];
  readonly isLoading?: boolean;
  readonly accountId?: string;
}

const activityIcons: Record<string, React.ReactNode> = {
  visit: <Activity className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  deal: <TrendingUp className="h-4 w-4" />,
  other: <Activity className="h-4 w-4" />,
};

const activityColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  visit: "default",
  call: "secondary",
  email: "secondary",
  task: "outline",
  deal: "default",
  other: "outline",
};

export function ActivityTimeline({ activities, isLoading, accountId }: ActivityTimelineProps) {
  const columns: Column<ActivityType>[] = [
    {
      id: "type",
      header: "Type",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">
            {activityIcons[row.type] || activityIcons.other}
          </div>
          <Badge variant={activityColors[row.type] || "outline"} className="text-xs">
            {row.type}
          </Badge>
        </div>
      ),
      className: "w-[120px]",
    },
    {
      id: "description",
      header: "Description",
      accessor: (row) => {
        // Format metadata nicely instead of raw JSON
        const formatMetadata = (metadata: Record<string, unknown> | undefined): string => {
          if (!metadata || Object.keys(metadata).length === 0) return "";
          
          const parts: string[] = [];
          if (metadata.status && typeof metadata.status === "string") parts.push(`Status: ${metadata.status}`);
          if (metadata.action && typeof metadata.action === "string") parts.push(`Action: ${metadata.action}`);
          if (metadata.visit_date && typeof metadata.visit_date === "string") parts.push(`Date: ${metadata.visit_date}`);
          if (metadata.duration && typeof metadata.duration === "string") parts.push(`Duration: ${metadata.duration}`);
          if (metadata.outcome && typeof metadata.outcome === "string") parts.push(`Outcome: ${metadata.outcome}`);
          if (metadata.subject && typeof metadata.subject === "string") parts.push(`Subject: ${metadata.subject}`);
          if (metadata.priority && typeof metadata.priority === "string") parts.push(`Priority: ${metadata.priority}`);
          if (metadata.value) {
            const valueStr = typeof metadata.value === "number" 
              ? metadata.value.toLocaleString("id-ID")
              : String(metadata.value);
            parts.push(`Value: ${valueStr}`);
          }
          
          return parts.length > 0 ? parts.join(" • ") : "";
        };

        const metadataText = formatMetadata(row.metadata as Record<string, unknown> | undefined);
        
        return (
          <div className="flex-1">
            <p className="text-sm font-medium line-clamp-2">{row.description}</p>
            {metadataText && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {metadataText}
              </p>
            )}
          </div>
        );
      },
      className: "min-w-[300px]",
    },
    {
      id: "account",
      header: "Account",
      accessor: (row) => (
        row.account ? (
          <div className="flex items-center gap-2">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {typeof row.account === "object" && "name" in row.account
                ? row.account.name
                : "N/A"}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      ),
      className: "w-[150px]",
    },
    {
      id: "contact",
      header: "Contact",
      accessor: (row) => (
        row.contact ? (
          <div className="flex items-center gap-2">
            <Contact className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {typeof row.contact === "object" && "name" in row.contact
                ? row.contact.name
                : "N/A"}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      ),
      className: "w-[150px]",
    },
    {
      id: "user",
      header: "User",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {typeof row.user === "object" && "name" in row.user
              ? row.user.name
              : "N/A"}
          </span>
        </div>
      ),
      className: "w-[150px]",
    },
    {
      id: "timestamp",
      header: "Timestamp",
      accessor: (row) => {
        const date = new Date(row.timestamp);
        const formatted = date.toLocaleString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{formatted}</span>
          </div>
        );
      },
      className: "w-[180px]",
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={`skeleton-${i}`} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No activities found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={activities}
          isLoading={isLoading}
          emptyMessage="No activities found"
          itemName="activity"
        />
      </CardContent>
    </Card>
  );
}

