"use client";

import { User, Building2, FileText, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer } from "@/components/ui/drawer";
import { useDeal, useUpdateDeal, useDeleteDeal } from "../hooks/useDeals";
import { DealForm } from "./deal-form";
import { formatCurrency } from "../utils/format";
import { toast } from "sonner";
import { useState } from "react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { AccountDetailModal } from "@/features/sales-crm/account-management/components/account-detail-modal";
import { ContactDetailModal } from "@/features/sales-crm/account-management/components/contact-detail-modal";

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
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        title={deal?.title || deal?.name || t("drawerTitle")}
        side="right"
        className="max-w-2xl"
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
            {t("notFound")}
          </div>
        )}

        {!isLoading && !error && deal && (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("sections.basicInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("sections.name")}</label>
                  <p className="text-sm mt-1">{deal.title || deal.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("sections.value")}</label>
                  <p className="text-sm mt-1 font-semibold">
                    {deal.value_formatted || formatCurrency(deal.value)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("sections.status")}</label>
                  <div className="mt-1">
                    <Badge variant={statusVariantMap[deal.status] || "outline"}>
                      {deal.status}
                    </Badge>
                  </div>
                </div>

                {deal.stage && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("sections.stage")}</label>
                    <p className="text-sm mt-1">{deal.stage.name}</p>
                  </div>
                )}

                {deal.account && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("sections.account")}</label>
                    <div className="mt-1">
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm font-normal"
                        onClick={() => setViewingAccountId(deal.account?.id || null)}
                      >
                        <Building2 className="h-4 w-4 mr-1" />
                        {deal.account.name}
                      </Button>
                    </div>
                  </div>
                )}

                {deal.contact && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("sections.contact")}</label>
                    <div className="mt-1">
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm font-normal"
                        onClick={() => setViewingContactId(deal.contact?.id || null)}
                      >
                        <User className="h-4 w-4 mr-1" />
                        {deal.contact.name}
                      </Button>
                    </div>
                  </div>
                )}

                {deal.assigned_user && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("sections.assignedTo")}</label>
                    <p className="text-sm mt-1">{deal.assigned_user.name}</p>
                  </div>
                )}

                {deal.expected_close_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("sections.expectedCloseDate")}</label>
                    <p className="text-sm mt-1">
                      {new Date(deal.expected_close_date).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {deal.source && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("sections.source")}</label>
                    <p className="text-sm mt-1">{deal.source}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {deal.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t("sections.notes")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{deal.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("sections.metadata")}</CardTitle>
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
      </Drawer>

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

