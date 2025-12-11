"use client";

import { Edit, Trash2, Mail, Building2, MapPin, Phone, Calendar, TrendingUp, UserPlus, Globe, FileText, Activity } from "lucide-react";
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
import { Drawer } from "@/components/ui/drawer";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLead, useDeleteLead, useUpdateLead, useLeadVisitReports, useLeadActivities } from "../hooks/useLeads";
import { toast } from "sonner";
import { useState } from "react";
import { LeadForm } from "./lead-form";
import { ConvertLeadDialog } from "./convert-lead-dialog";
import { useTranslations } from "next-intl";
import { useHasPermission } from "@/features/master-data/user-management/hooks/useHasPermission";

interface LeadDetailModalProps {
  readonly leadId: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onLeadUpdated?: () => void;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "outline",
  contacted: "secondary",
  qualified: "default",
  unqualified: "secondary",
  nurturing: "secondary",
  disqualified: "destructive",
  converted: "default",
  lost: "destructive",
};

export function LeadDetailModal({ leadId, open, onOpenChange, onLeadUpdated }: LeadDetailModalProps) {
  const { data, isLoading, error } = useLead(leadId || "");
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const t = useTranslations("leadManagement.leadDetail");
  const hasEditPermission = useHasPermission("EDIT_LEADS");
  const hasDeletePermission = useHasPermission("DELETE_LEADS");
  const hasConvertPermission = useHasPermission("CONVERT_LEADS");

  const lead = data?.data;

  const handleUpdate = async (formData: Parameters<typeof updateLead.mutateAsync>[0]["data"]) => {
    if (!leadId) return;
    try {
      await updateLead.mutateAsync({ id: leadId, data: formData });
      toast.success(t("toast.updated"));
      setIsEditDialogOpen(false);
      onLeadUpdated?.();
    } catch {
      // Error handled by interceptor
    }
  };

  const handleDelete = async () => {
    if (!leadId) return;
    try {
      await deleteLead.mutateAsync(leadId);
      toast.success(t("toast.deleted"));
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
      onLeadUpdated?.();
    } catch {
      // Error handled by interceptor
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return t("fallbacks.noDate");
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return t("fallbacks.invalidDate");
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        title={t("drawerTitle")}
        side="right"
        defaultWidth={672}
      >
        {isLoading && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
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

        {!isLoading && !error && lead && (
          <div className="space-y-6">
            {/* Lead Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {lead.first_name} {lead.last_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={statusColors[lead.lead_status] || "outline"} className="capitalize">
                    {lead.lead_status}
                  </Badge>
                  {lead.company_name && (
                    <span className="text-sm text-muted-foreground">{lead.company_name}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasEditPermission && lead.lead_status !== "converted" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("actions.edit")}
                  </Button>
                )}
                {hasConvertPermission && lead.lead_status === "qualified" && (
                  <Button
                    size="sm"
                    onClick={() => setIsConvertDialogOpen(true)}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t("actions.convert")}
                  </Button>
                )}
                {hasDeletePermission && lead.lead_status !== "converted" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={deleteLead.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("actions.delete")}
                  </Button>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t("sections.basicInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{t("sections.email")}</span>
                    </div>
                    <div className="text-base">{lead.email}</div>
                  </div>

                  {lead.phone && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{t("sections.phone")}</span>
                      </div>
                      <div className="text-base">{lead.phone}</div>
                    </div>
                  )}

                  {lead.job_title && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <span>{t("sections.jobTitle")}</span>
                      </div>
                      <div className="text-base">{lead.job_title}</div>
                    </div>
                  )}

                  {lead.industry && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <span>{t("sections.industry")}</span>
                      </div>
                      <div className="text-base">{lead.industry}</div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{t("sections.leadSource")}</span>
                    </div>
                    <div className="text-base">{lead.lead_source}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>{t("sections.leadScore")}</span>
                    </div>
                    <div className="text-base font-medium">{lead.lead_score}</div>
                  </div>

                  {lead.assigned_user && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserPlus className="h-4 w-4" />
                        <span>{t("sections.assignedTo")}</span>
                      </div>
                      <div className="text-base">{lead.assigned_user.name}</div>
                    </div>
                  )}
                </div>

                {(lead.address || lead.city || lead.province) && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{t("sections.address")}</span>
                    </div>
                    <div className="text-base">
                      {[lead.address, lead.city, lead.province, lead.postal_code, lead.country]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                )}

                {lead.website && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>{t("sections.website")}</span>
                    </div>
                    <div className="text-base">
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {lead.website}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {lead.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t("sections.notes")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base whitespace-pre-wrap">{lead.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Conversion Info */}
            {lead.lead_status === "converted" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("sections.conversionInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lead.converted_at && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{t("sections.convertedAt")}</span>
                      </div>
                      <div className="text-base">{formatDate(lead.converted_at)}</div>
                    </div>
                  )}
                  {lead.account && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{t("sections.account")}</span>
                      </div>
                      <div className="text-base">{lead.account.name}</div>
                    </div>
                  )}
                  {lead.opportunity && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>{t("sections.opportunity")}</span>
                      </div>
                      <div className="text-base">{lead.opportunity.title}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Visit Reports & Activities */}
            {lead.lead_status !== "converted" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("sections.relatedActivities")}</CardTitle>
                  <CardDescription>
                    {t("sections.relatedActivitiesDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="visit-reports" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="visit-reports">
                        <MapPin className="h-4 w-4 mr-2" />
                        {t("sections.visitReports")}
                      </TabsTrigger>
                      <TabsTrigger value="activities">
                        <Activity className="h-4 w-4 mr-2" />
                        {t("sections.activities")}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="visit-reports" className="mt-4">
                      <LeadVisitReportsList leadId={leadId || ""} />
                    </TabsContent>
                    <TabsContent value="activities" className="mt-4">
                      <LeadActivitiesList leadId={leadId || ""} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>{t("sections.metadata")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {t("sections.createdAt")} {formatDate(lead.created_at)}
                </p>
                <p>
                  {t("sections.updatedAt")} {formatDate(lead.updated_at)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </Drawer>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("editDialog.title")}</DialogTitle>
          </DialogHeader>
          {lead && (
            <LeadForm
              lead={lead}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={updateLead.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description")}
        isLoading={deleteLead.isPending}
      />

      {/* Convert Dialog */}
      {lead && (
        <ConvertLeadDialog
          lead={lead}
          open={isConvertDialogOpen}
          onOpenChange={setIsConvertDialogOpen}
          onSuccess={() => {
            onLeadUpdated?.();
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}

// Visit Reports List Component for Lead
function LeadVisitReportsList({ leadId }: { readonly leadId: string }) {
  const { data, isLoading } = useLeadVisitReports(leadId, { per_page: 10 });
  const t = useTranslations("leadManagement.leadDetail");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={`visit-report-skeleton-${i}`} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const visitReports = data?.data ?? [];

  if (visitReports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">{t("sections.noVisitReports")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visitReports.map((vr) => (
        <div key={vr.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant={
                  vr.status === "approved"
                    ? "default"
                    : vr.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {vr.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {vr.visit_date ? new Date(vr.visit_date).toLocaleDateString("id-ID") : ""}
              </span>
            </div>
            <p className="text-sm font-medium line-clamp-1">{vr.purpose}</p>
            {vr.account && (
              <p className="text-xs text-muted-foreground mt-1">
                {vr.account.name}
              </p>
            )}
          </div>
        </div>
      ))}
      {data?.meta?.pagination && data.meta.pagination.total > 10 && (
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            {t("sections.showing")} {visitReports.length} {t("sections.of")} {data.meta.pagination.total} {t("sections.visitReports")}
          </p>
        </div>
      )}
    </div>
  );
}

// Activities List Component for Lead
function LeadActivitiesList({ leadId }: { readonly leadId: string }) {
  const { data, isLoading } = useLeadActivities(leadId, { per_page: 10 });
  const t = useTranslations("leadManagement.leadDetail");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={`activity-skeleton-${i}`} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const activities = data?.data ?? [];

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">{t("sections.noActivities")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="capitalize">
                {activity.type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) : ""}
              </span>
            </div>
            <p className="text-sm font-medium line-clamp-2">{activity.description}</p>
            {activity.account && (
              <p className="text-xs text-muted-foreground mt-1">
                {activity.account.name}
              </p>
            )}
          </div>
        </div>
      ))}
      {data?.meta?.pagination && data.meta.pagination.total > 10 && (
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            {t("sections.showing")} {activities.length} {t("sections.of")} {data.meta.pagination.total} {t("sections.activities")}
          </p>
        </div>
      )}
    </div>
  );
}

