"use client";

import { Calendar, MapPin, CheckCircle2, XCircle, Clock, User, Building2, FileText, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer } from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useVisitReport,
  useCheckIn,
  useCheckOut,
  useApproveVisitReport,
  useRejectVisitReport,
  useUploadPhoto,
  useActivityTimeline,
} from "../hooks/useVisitReports";
import { toast } from "sonner";
import { useState } from "react";
import { PhotoUploadDialog } from "./photo-upload-dialog";
import { ActivityTimeline } from "./activity-timeline";
import { CreateActivityDialog } from "./create-activity-dialog";
import { VisitReportInsightsButton } from "@/features/ai/components/visit-report-insights-button";
import { useTranslations } from "next-intl";

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
  const uploadPhoto = useUploadPhoto();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isPhotoUploadDialogOpen, setIsPhotoUploadDialogOpen] = useState(false);
  const [isCreateActivityDialogOpen, setIsCreateActivityDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const visitReport = data?.data;

  const { data: timelineData } = useActivityTimeline({
    account_id: visitReport?.account_id,
    limit: 10,
  });
  const activities = timelineData?.data || [];
  const t = useTranslations("visitReportDetail");
  const tPhoto = useTranslations("photoUploadDialog");

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return t("sections.notAvailable");
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t("sections.invalidDate");
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return t("sections.notAvailable");
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t("sections.invalidDate");
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number; address: string }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(t("errors.geolocationUnsupported")));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get address from reverse geocoding (using a free service)
          let address = "";
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            if (data.display_name) {
              address = data.display_name;
            } else {
              address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            }
          } catch (error) {
            // Fallback to coordinates if reverse geocoding fails
            address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }

          resolve({ latitude, longitude, address });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const handleCheckIn = async () => {
    if (!visitReportId || !visitReport) return;
    try {
      toast.loading(t("actions.gettingLocation"), { id: "checkin-location" });
      const location = await getCurrentLocation();
      toast.dismiss("checkin-location");
      
      await checkIn.mutateAsync({
        id: visitReportId,
        data: {
          location,
        },
      });
      toast.success(t("actions.checkInSuccess"));
      onVisitReportUpdated?.();
    } catch (error) {
      toast.dismiss("checkin-location");
      if (error instanceof Error) {
        toast.error(t("actions.checkInGetLocationFailed"), { description: error.message });
      } else {
        toast.error(t("actions.checkInFailed"));
      }
    }
  };

  const handleCheckOut = async () => {
    if (!visitReportId || !visitReport) return;
    try {
      toast.loading(t("actions.gettingLocation"), { id: "checkout-location" });
      const location = await getCurrentLocation();
      toast.dismiss("checkout-location");
      
      await checkOut.mutateAsync({
        id: visitReportId,
        data: {
          location,
        },
      });
      toast.success(t("actions.checkOutSuccess"));
      onVisitReportUpdated?.();
    } catch (error) {
      toast.dismiss("checkout-location");
      if (error instanceof Error) {
        toast.error(t("actions.checkOutGetLocationFailed"), { description: error.message });
      } else {
        toast.error(t("actions.checkOutFailed"));
      }
    }
  };

  const handleApprove = async () => {
    if (!visitReportId) return;
    try {
      await approve.mutateAsync(visitReportId);
      toast.success(t("actions.approveSuccess"));
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
      toast.success(t("actions.rejectSuccess"));
      setIsRejectDialogOpen(false);
      setRejectReason("");
      onVisitReportUpdated?.();
    } catch (error) {
      // Error already handled
    }
  };

  const handleUploadPhoto = async (photoUrl: string) => {
    if (!visitReportId) return;
    try {
      await uploadPhoto.mutateAsync({
        id: visitReportId,
        data: { photo_url: photoUrl },
      });
      toast.success(t("actions.uploadPhotoSuccess"));
      onVisitReportUpdated?.();
    } catch (error) {
      // Error already handled
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        title={t("drawerTitle")}
        side="right"
        className="max-w-3xl"
      >

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
              {t("loadError")}
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
                  <VisitReportInsightsButton visitReportId={visitReport.id} iconOnly />
                  {visitReport.status === "submitted" && (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setIsRejectDialogOpen(true)}
                        disabled={reject.isPending}
                        title={t("actions.reject")}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={handleApprove}
                        disabled={approve.isPending}
                        title={t("actions.approve")}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {visitReport.status === "draft" && !visitReport.check_in_time && (
                    <Button
                      size="icon"
                      onClick={handleCheckIn}
                      disabled={checkIn.isPending}
                      title={t("actions.checkIn")}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  )}
                  {visitReport.check_in_time && !visitReport.check_out_time && (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCheckOut}
                      disabled={checkOut.isPending}
                      title={t("actions.checkOut")}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t("sections.visitInformationTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {t("sections.accountLabel")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{visitReport.account?.name || "N/A"}</span>
                      </div>
                    </div>
                    {visitReport.contact && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {t("sections.contactLabel")}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{visitReport.contact?.name || t("sections.notAvailable")}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("sections.purposeLabel")}
                    </div>
                    <p className="text-sm">{visitReport.purpose}</p>
                  </div>

                  {visitReport.notes && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {t("sections.notesLabel")}
                      </div>
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
                    {t("sections.checkInOutTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {t("sections.checkInLabel")}
                      </div>
                      <div className="flex items-center gap-2">
                        {visitReport.check_in_time ? (
                          <>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDateTime(visitReport.check_in_time)}</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {t("sections.notCheckedIn")}
                          </span>
                        )}
                      </div>
                      {visitReport.check_in_location && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {visitReport.check_in_location?.address || 
                            (visitReport.check_in_location?.latitude && visitReport.check_in_location?.longitude
                              ? `${visitReport.check_in_location.latitude}, ${visitReport.check_in_location.longitude}`
                              : t("sections.locationNotAvailable"))}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {t("sections.checkOutLabel")}
                      </div>
                      <div className="flex items-center gap-2">
                        {visitReport.check_out_time ? (
                          <>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDateTime(visitReport.check_out_time)}</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {t("sections.notCheckedOut")}
                          </span>
                        )}
                      </div>
                      {visitReport.check_out_location && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {visitReport.check_out_location?.address || 
                            (visitReport.check_out_location?.latitude && visitReport.check_out_location?.longitude
                              ? `${visitReport.check_out_location.latitude}, ${visitReport.check_out_location.longitude}`
                              : t("sections.locationNotAvailable"))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photos */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("sections.photosTitle")}</CardTitle>
                    {(visitReport.status === "draft" || visitReport.status === "submitted") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsPhotoUploadDialogOpen(true)}
                        disabled={uploadPhoto.isPending}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {tPhoto("buttons.upload")}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {visitReport.photos && Array.isArray(visitReport.photos) && visitReport.photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {visitReport.photos.map((photo) => (
                        <div key={photo} className="relative group">
                          <img
                            src={photo}
                            alt="Visit documentation"
                            className="w-full h-32 object-cover rounded-md border"
                          />
                          <a
                            href={photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                          >
                            <span className="text-white text-xs">
                              {t("sections.viewPhoto")}
                            </span>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      {t("sections.noPhotos")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approval Information */}
              {visitReport.approved_at && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("sections.approvalTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">
                        {t("sections.approvedAtLabel")}
                      </div>
                      <div>{formatDateTime(visitReport.approved_at)}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {visitReport.rejection_reason && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("sections.rejectionTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">
                        {t("sections.rejectionReasonLabel")}
                      </div>
                      <div>{visitReport.rejection_reason}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activity Timeline */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("sections.activityTimelineTitle")}</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsCreateActivityDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("sections.addActivity")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline
                    activities={activities}
                    isLoading={!timelineData}
                    accountId={visitReport.account_id}
                  />
                </CardContent>
              </Card>
            </div>
          )}
      </Drawer>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectDialog.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("rejectDialog.reasonLabel")} *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("rejectDialog.reasonPlaceholder")}
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
                {t("rejectDialog.cancel")}
              </Button>
              <Button
                onClick={handleReject}
                disabled={reject.isPending || !rejectReason.trim()}
                variant="destructive"
              >
                {reject.isPending ? t("rejectDialog.submitting") : t("rejectDialog.submit")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <PhotoUploadDialog
        open={isPhotoUploadDialogOpen}
        onOpenChange={setIsPhotoUploadDialogOpen}
        onUpload={handleUploadPhoto}
        isLoading={uploadPhoto.isPending}
      />

      {/* Create Activity Dialog */}
      {visitReport && (
        <CreateActivityDialog
          open={isCreateActivityDialogOpen}
          onOpenChange={setIsCreateActivityDialogOpen}
          accountId={visitReport.account_id}
          contactId={visitReport.contact_id || undefined}
          onSuccess={() => {
            // Refresh timeline - query will auto-refresh due to invalidation in hook
            onVisitReportUpdated?.();
          }}
        />
      )}
    </>
  );
}

