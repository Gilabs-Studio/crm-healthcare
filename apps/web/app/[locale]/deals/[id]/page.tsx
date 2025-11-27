"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { useDeal } from "@/features/sales-crm/pipeline-management/hooks/useDeals";
import { useUpdateDeal, useDeleteDeal } from "@/features/sales-crm/pipeline-management/hooks/useDeals";
import { DealForm } from "@/features/sales-crm/pipeline-management/components/deal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react";
import { formatCurrency } from "@/features/sales-crm/pipeline-management/utils/format";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

function DealDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  const t = useTranslations("deals.detail");
  const tCommon = useTranslations("common");
  
  const { data, isLoading } = useDeal(dealId);
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deal = data?.data;

  const handleUpdate = async (formData: Parameters<typeof updateDeal.mutateAsync>[0]["data"]) => {
    try {
      await updateDeal.mutateAsync({ id: dealId, data: formData });
      setIsEditDialogOpen(false);
      toast.success(t("toast.updated"));
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDeal.mutateAsync(dealId);
      setIsDeleteDialogOpen(false);
      toast.success(t("toast.deleted"));
      router.push("/pipeline");
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <div className="text-muted-foreground">{t("loading")}</div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("notFound")}</p>
          <Button onClick={() => router.push("/pipeline")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToList")}
          </Button>
        </div>
      </div>
    );
  }

  const valueFormatted = deal.value_formatted || formatCurrency(deal.value);

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/pipeline")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              {tCommon("edit")}
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              {tCommon("delete")}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{deal.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={deal.status === "won" ? "default" : deal.status === "lost" ? "destructive" : "secondary"}>
                    {deal.status}
                  </Badge>
                  {deal.stage && (
                    <>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: deal.stage.color }}
                      />
                      <span className="text-sm text-muted-foreground">{deal.stage.name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{valueFormatted}</p>
                {deal.probability > 0 && (
                  <p className="text-sm text-muted-foreground">{deal.probability}% probability</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {deal.description && (
              <div>
                  <h3 className="font-semibold mb-2">
                    {t("sections.description")}
                  </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{deal.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">
                  {t("sections.account")}
                </h3>
                <p className="text-muted-foreground">
                  {deal.account?.name || t("fallbacks.unknownAccount")}
                </p>
              </div>

              {deal.contact && (
                <div>
                  <h3 className="font-semibold mb-2">
                    {t("sections.contact")}
                  </h3>
                  <p className="text-muted-foreground">{deal.contact.name}</p>
                  {deal.contact.email && (
                    <p className="text-sm text-muted-foreground">{deal.contact.email}</p>
                  )}
                  {deal.contact.phone && (
                    <p className="text-sm text-muted-foreground">{deal.contact.phone}</p>
                  )}
                </div>
              )}

              {deal.assigned_user && (
                <div>
                  <h3 className="font-semibold mb-2">
                    {t("sections.assignedTo")}
                  </h3>
                  <p className="text-muted-foreground">{deal.assigned_user.name}</p>
                  {deal.assigned_user.email && (
                    <p className="text-sm text-muted-foreground">{deal.assigned_user.email}</p>
                  )}
                </div>
              )}

              {deal.expected_close_date && (
                <div>
                  <h3 className="font-semibold mb-2">
                    {t("sections.expectedCloseDate")}
                  </h3>
                  <p className="text-muted-foreground">
                    {new Date(deal.expected_close_date).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              {deal.actual_close_date && (
                <div>
                  <h3 className="font-semibold mb-2">
                    {t("sections.actualCloseDate")}
                  </h3>
                  <p className="text-muted-foreground">
                    {new Date(deal.actual_close_date).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              {deal.source && (
                <div>
                  <h3 className="font-semibold mb-2">
                    {t("sections.source")}
                  </h3>
                  <p className="text-muted-foreground">{deal.source}</p>
                </div>
              )}
            </div>

            {deal.notes && (
              <div>
                <h3 className="font-semibold mb-2">
                  {t("sections.notes")}
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{deal.notes}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground pt-4 border-t">
              <p>
                {t("sections.createdAt")}{" "}
                {new Date(deal.created_at).toLocaleString("id-ID")}
              </p>
              <p>
                {t("sections.updatedAt")}{" "}
                {new Date(deal.updated_at).toLocaleString("id-ID")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{tCommon("edit")}</DialogTitle>
            </DialogHeader>
            <DealForm
              deal={deal}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={updateDeal.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("deleteDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                {t("deleteDialog.cancel")}
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteDeal.isPending}>
                {deleteDeal.isPending
                  ? t("deleteDialog.confirmLoading")
                  : t("deleteDialog.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function DealDetailPage() {
  return (
    <AuthGuard>
      <DealDetailPageContent />
    </AuthGuard>
  );
}



