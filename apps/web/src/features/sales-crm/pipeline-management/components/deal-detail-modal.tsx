"use client";

import { User, Building2, FileText, Edit, Trash2, DollarSign, TrendingUp, Calendar, Circle, Activity, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useDeal, useUpdateDeal, useDeleteDeal, useDealVisitReports, useDealActivities } from "../hooks/useDeals";
import { DealForm } from "./deal-form";
import { formatCurrency } from "../utils/format";
import { toast } from "sonner";
import { useState } from "react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { AccountDetailModal } from "@/features/sales-crm/account-management/components/account-detail-modal";
import { ContactDetailModal } from "@/features/sales-crm/account-management/components/contact-detail-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  open: "secondary",
  won: "default",
  lost: "destructive",
};

interface DealDetailModalProps {
  readonly dealId: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onDealUpdated?: () => void;
}

export function DealDetailModal({
  dealId,
  open,
  onOpenChange,
  onDealUpdated,
}: DealDetailModalProps) {
  const t = useTranslations("deals.detail");
  const tCommon = useTranslations("common");
  
  const { data, isLoading, error } = useDeal(dealId || "");
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewingAccountId, setViewingAccountId] = useState<string | null>(null);
  const [viewingContactId, setViewingContactId] = useState<string | null>(null);

  const deal = data?.data;

  const handleUpdate = async (formData: Parameters<typeof updateDeal.mutateAsync>[0]["data"]) => {
    if (!dealId) return;
    try {
      await updateDeal.mutateAsync({ id: dealId, data: formData });
      toast.success(t("toast.updated"));
      setIsEditDialogOpen(false);
      onDealUpdated?.();
    } catch {
      // Error handled by interceptor
    }
  };

  const handleDelete = async () => {
    if (!dealId) return;
    try {
      await deleteDeal.mutateAsync(dealId);
      toast.success(t("toast.deleted"));
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
      onDealUpdated?.();
    } catch {
      // Error handled by interceptor
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("drawerTitle")}</DialogTitle>
          </DialogHeader>

          {isLoading && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64 mt-2" />
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
              {t("notFound")}
            </div>
          )}

          {!isLoading && !error && deal && (
            <div className="space-y-6">
              {/* Deal Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold tracking-tight">{deal.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={statusVariantMap[deal.status] || "outline"} className="capitalize">
                      {deal.status}
                    </Badge>
                    {deal.stage && (
                      <>
                        <Circle
                          className="h-3 w-3"
                          style={{ color: deal.stage.color || "#CBD5F5", fill: deal.stage.color || "#CBD5F5" }}
                        />
                        <span className="text-sm text-muted-foreground">{deal.stage.name || t("fallbacks.unknownStage")}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("actions.edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={deleteDeal.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("actions.delete")}
                  </Button>
                </div>
              </div>

              {/* Deal Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("sections.basicInfo")}</CardTitle>
                  <CardDescription>
                    {t("sections.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {deal.description && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {t("sections.description")}
                      </div>
                      <div className="text-base whitespace-pre-wrap">{deal.description}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>{t("sections.value")}</span>
                      </div>
                      <div className="text-base font-semibold">
                        {deal.value_formatted || formatCurrency(deal.value ?? 0)}
                      </div>
                    </div>

                    {(deal.probability ?? 0) > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          <span>Probability</span>
                        </div>
                        <div className="text-base font-medium">{deal.probability ?? 0}%</div>
                      </div>
                    )}

                    {deal.account && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span>{t("sections.account")}</span>
                        </div>
                        <div>
                          <Button
                            variant="link"
                            className="h-auto p-0 text-base font-medium"
                            onClick={() => setViewingAccountId(deal.account?.id || null)}
                          >
                            {deal.account?.name || t("fallbacks.unknownAccount")}
                          </Button>
                        </div>
                      </div>
                    )}

                    {deal.contact && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{t("sections.contact")}</span>
                        </div>
                        <div>
                          <Button
                            variant="link"
                            className="h-auto p-0 text-base font-medium"
                            onClick={() => setViewingContactId(deal.contact?.id || null)}
                          >
                            {deal.contact?.name || t("fallbacks.unknownContact")}
                          </Button>
                        </div>
                      </div>
                    )}

                    {deal.assigned_user && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{t("sections.assignedTo")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {deal.assigned_user?.avatar_url && (
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={deal.assigned_user.avatar_url} alt={deal.assigned_user?.name ?? t("fallbacks.unknownUser")} />
                            </Avatar>
                          )}
                          <div className="text-base font-medium">{deal.assigned_user?.name ?? t("fallbacks.unknownUser")}</div>
                        </div>
                      </div>
                    )}

                    {deal.expected_close_date && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{t("sections.expectedCloseDate")}</span>
                        </div>
                        <div className="text-base font-medium">
                          {(() => {
                            if (!deal.expected_close_date) return t("fallbacks.noDate");
                            const date = new Date(deal.expected_close_date);
                            if (isNaN(date.getTime())) return t("fallbacks.invalidDate");
                            return date.toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {deal.actual_close_date && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{t("sections.actualCloseDate")}</span>
                        </div>
                        <div className="text-base font-medium">
                          {(() => {
                            if (!deal.actual_close_date) return t("fallbacks.noDate");
                            const date = new Date(deal.actual_close_date);
                            if (isNaN(date.getTime())) return t("fallbacks.invalidDate");
                            return date.toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {deal.source && (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <span>{t("sections.source")}</span>
                        </div>
                        <div className="text-base font-medium">{deal.source}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {deal.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {t("sections.notes")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base whitespace-pre-wrap">{deal.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Visit Reports & Activities */}
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
                      <DealVisitReportsList dealId={dealId || ""} />
                    </TabsContent>
                    <TabsContent value="activities" className="mt-4">
                      <DealActivitiesList dealId={dealId || ""} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("sections.metadata")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    {t("sections.createdAt")}{" "}
                    {new Date(deal.created_at).toLocaleString("id-ID")}
                  </p>
                  <p>
                    {t("sections.updatedAt")}{" "}
                    {new Date(deal.updated_at).toLocaleString("id-ID")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tCommon("edit")}</DialogTitle>
          </DialogHeader>
          {deal && (
            <DealForm
              deal={deal}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={updateDeal.isPending}
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
        isLoading={deleteDeal.isPending}
      />

      {/* Account Detail Modal */}
      <AccountDetailModal
        accountId={viewingAccountId}
        open={!!viewingAccountId}
        onOpenChange={(open) => !open && setViewingAccountId(null)}
      />

      {/* Contact Detail Modal */}
      <ContactDetailModal
        contactId={viewingContactId}
        open={!!viewingContactId}
        onOpenChange={(open) => !open && setViewingContactId(null)}
      />
    </>
  );
}

// Visit Reports List Component for Deal
function DealVisitReportsList({ dealId }: { readonly dealId: string }) {
  const { data, isLoading } = useDealVisitReports(dealId, { per_page: 10 });
  const t = useTranslations("deals.detail");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
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
              <Badge variant={vr.status === "approved" ? "default" : vr.status === "rejected" ? "destructive" : "secondary"}>
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

// Activities List Component for Deal
function DealActivitiesList({ dealId }: { readonly dealId: string }) {
  const { data, isLoading } = useDealActivities(dealId, { per_page: 10 });
  const t = useTranslations("deals.detail");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
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

