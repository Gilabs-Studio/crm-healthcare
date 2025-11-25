"use client";

import { Calendar, MapPin, CheckCircle2, XCircle, Clock, User, Building2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVisitReport, useCheckIn, useCheckOut, useApproveVisitReport, useRejectVisitReport } from "../hooks/useVisitReports";
import { toast } from "sonner";
import { useState } from "react";
import { useActivityTimeline } from "../hooks/useVisitReports";
import type { VisitReport } from "../types";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  submitted: "secondary",
  approved: "default",
  rejected: "destructive",
};

interface VisitReportDetailModalProps {
  readonly visitReportId: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onVisitReportUpdated?: () => void;
}

export function VisitReportDetailModal({
  visitReportId,
  open,
  onOpenChange,
  onVisitReportUpdated,
}: VisitReportDetailModalProps) {
  const { data, isLoading, error } = useVisitReport(visitReportId || "");
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const approve = useApproveVisitReport();
  const reject = useRejectVisitReport();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const visitReport = data?.data;

  const { data: timelineData } = useActivityTimeline({
    account_id: visitReport?.account_id,
    limit: 10,
  });
  const activities = timelineData?.data || [];

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCheckIn = async () => {
    if (!visitReportId || !visitReport) return;
    try {
      // Get current location (simplified - in real app, use geolocation API)
      await checkIn.mutateAsync({
        id: visitReportId,
        data: {
          location: {
            latitude: 0,
            longitude: 0,
            address: "Location to be captured",
          },
        },
      });
      toast.success("Checked in successfully");
      onVisitReportUpdated?.();
    } catch (error) {
      // Error already handled
    }
  };

  const handleCheckOut = async () => {
    if (!visitReportId || !visitReport) return;
    try {
      await checkOut.mutateAsync({
        id: visitReportId,
        data: {
          location: {
            latitude: 0,
            longitude: 0,
            address: "Location to be captured",
          },
        },
      });
      toast.success("Checked out successfully");
      onVisitReportUpdated?.();
    } catch (error) {
      // Error already handled
    }
  };

  const handleApprove = async () => {
    if (!visitReportId) return;
    try {
      await approve.mutateAsync(visitReportId);
      toast.success("Visit report approved");
      onVisitReportUpdated?.();
    } catch (error) {
      // Error already handled
    }
  };

  const handleReject = async () => {
    if (!visitReportId || !rejectReason.trim()) return;
    try {
      await reject.mutateAsync({
        id: visitReportId,
        data: { reason: rejectReason },
      });
      toast.success("Visit report rejected");
      setIsRejectDialogOpen(false);
      setRejectReason("");
      onVisitReportUpdated?.();
    } catch (error) {
      // Error already handled
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visit Report Details</DialogTitle>
          </DialogHeader>

          {isLoading && (
            <div className="space-y-6">
              <Skeleton className="h-8 w-48" />
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {error && (
            <div className="text-center text-muted-foreground py-8">
              Failed to load visit report details
            </div>
          )}

          {!isLoading && !error && visitReport && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <Badge variant={statusColors[visitReport.status] || "outline"}>
                    {visitReport.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(visitReport.visit_date)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {visitReport.status === "submitted" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsRejectDialogOpen(true)}
                        disabled={reject.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApprove}
                        disabled={approve.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </>
                  )}
                  {visitReport.status === "draft" && !visitReport.check_in_time && (
                    <Button
                      size="sm"
                      onClick={handleCheckIn}
                      disabled={checkIn.isPending}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Check In
                    </Button>
                  )}
                  {visitReport.check_in_time && !visitReport.check_out_time && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCheckOut}
                      disabled={checkOut.isPending}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Check Out
                    </Button>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Visit Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Account</div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{visitReport.account?.name || "N/A"}</span>
                      </div>
                    </div>
                    {visitReport.contact && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Contact</div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{visitReport.contact.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Purpose</div>
                    <p className="text-sm">{visitReport.purpose}</p>
                  </div>

                  {visitReport.notes && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Notes</div>
                      <p className="text-sm whitespace-pre-wrap">{visitReport.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Check In/Out Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Check In/Out
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Check In</div>
                      <div className="flex items-center gap-2">
                        {visitReport.check_in_time ? (
                          <>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDateTime(visitReport.check_in_time)}</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not checked in</span>
                        )}
                      </div>
                      {visitReport.check_in_location && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {visitReport.check_in_location.address || `${visitReport.check_in_location.latitude}, ${visitReport.check_in_location.longitude}`}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Check Out</div>
                      <div className="flex items-center gap-2">
                        {visitReport.check_out_time ? (
                          <>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDateTime(visitReport.check_out_time)}</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not checked out</span>
                        )}
                      </div>
                      {visitReport.check_out_location && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {visitReport.check_out_location.address || `${visitReport.check_out_location.latitude}, ${visitReport.check_out_location.longitude}`}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photos */}
              {visitReport.photos && visitReport.photos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {visitReport.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Visit photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Approval Information */}
              {visitReport.approved_at && (
                <Card>
                  <CardHeader>
                    <CardTitle>Approval</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">Approved at</div>
                      <div>{formatDateTime(visitReport.approved_at)}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {visitReport.rejection_reason && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rejection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">Reason</div>
                      <div>{visitReport.rejection_reason}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activity Timeline */}
              {activities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                          <div className="flex-1">
                            <div className="font-medium">{activity.description}</div>
                            <div className="text-muted-foreground text-xs">
                              {formatDateTime(activity.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Visit Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  setRejectReason("");
                }}
                disabled={reject.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={reject.isPending || !rejectReason.trim()}
                variant="destructive"
              >
                {reject.isPending ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

