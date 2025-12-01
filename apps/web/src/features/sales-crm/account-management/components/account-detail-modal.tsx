"use client";

import { Edit, Trash2, Mail, Building2, MapPin, Phone, Calendar } from "lucide-react";
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
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useAccount, useDeleteAccount, useUpdateAccount } from "../hooks/useAccounts";
import { toast } from "sonner";
import { useState } from "react";
import { AccountForm } from "./account-form";
import { useTranslations } from "next-intl";
import { toBadgeVariant } from "@/lib/badge-variant";

interface AccountDetailModalProps {
  readonly accountId: string | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onAccountUpdated?: () => void;
}

export function AccountDetailModal({ accountId, open, onOpenChange, onAccountUpdated }: AccountDetailModalProps) {
  const { data, isLoading, error } = useAccount(accountId || "");
  const deleteAccount = useDeleteAccount();
  const updateAccount = useUpdateAccount();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const t = useTranslations("accountManagement.accountDetail");

  const account = data?.data;

  const handleDeleteConfirm = async () => {
    if (!account || !accountId) return;
    try {
      await deleteAccount.mutateAsync(accountId);
      toast.success(t("toastDeleted"));
      onOpenChange(false);
      onAccountUpdated?.();
    } catch {
      // Error already handled in api-client interceptor
    }
  };


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>

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
              {t("loadError")}
            </div>
          )}

          {!isLoading && !error && account && (
            <div className="space-y-6">
              {/* Account Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold tracking-tight">{account.name || t("infoCard.notAvailable")}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {account.category ? (
                      <Badge variant={toBadgeVariant(account.category?.badge_color, "secondary")} className="font-normal">
                        {account.category?.name || "-"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">-</Badge>
                    )}
                    <Badge variant={account.status === "active" ? "active" : "inactive"}>
                      {account.status || "-"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("header.edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={deleteAccount.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("header.delete")}
                  </Button>
                </div>
              </div>

              {/* Account Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("infoCard.title")}</CardTitle>
                  <CardDescription>{t("infoCard.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{t("infoCard.name")}</span>
                      </div>
                      <div className="text-base font-medium">{account.name || t("infoCard.notAvailable")}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{t("infoCard.category")}</span>
                      </div>
                      <div>
                        {account.category ? (
                          <Badge variant={toBadgeVariant(account.category?.badge_color, "secondary")} className="font-normal">
                            {account.category?.name || "-"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">{t("infoCard.notAvailable")}</span>
                        )}
                      </div>
                    </div>

                    {account.address && (
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{t("infoCard.address")}</span>
                        </div>
                        <div className="text-base font-medium">{account.address}</div>
                      </div>
                    )}

                    {account.city && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{t("infoCard.city")}</span>
                        </div>
                        <div className="text-base font-medium">{account.city}</div>
                      </div>
                    )}

                    {account.province && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{t("infoCard.province")}</span>
                        </div>
                        <div className="text-base font-medium">{account.province}</div>
                      </div>
                    )}

                    {account.phone && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{t("infoCard.phone")}</span>
                        </div>
                        <div className="text-base font-medium">{account.phone}</div>
                      </div>
                    )}

                    {account.email && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{t("infoCard.email")}</span>
                        </div>
                        <div className="text-base font-medium">{account.email}</div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{t("infoCard.status")}</span>
                      </div>
                      <div>
                        <Badge variant={account.status === "active" ? "active" : "inactive"}>
                          {account.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{t("infoCard.createdAt")}</span>
                      </div>
                      <div className="text-base font-medium">
                        {account.created_at
                          ? new Date(account.created_at).toLocaleDateString()
                          : t("infoCard.notAvailable")}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{t("infoCard.updatedAt")}</span>
                      </div>
                      <div className="text-base font-medium">
                        {account.updated_at
                          ? new Date(account.updated_at).toLocaleDateString()
                          : t("infoCard.notAvailable")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {isEditDialogOpen && account && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("editDialogTitle")}</DialogTitle>
            </DialogHeader>
            <AccountForm
              account={account}
              onSubmit={async (formData) => {
                try {
                  await updateAccount.mutateAsync({ id: accountId!, data: formData });
                  setIsEditDialogOpen(false);
                  toast.success(t("toastUpdated"));
                  onAccountUpdated?.();
                } catch {
                  // Error already handled in api-client interceptor
                }
              }}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={updateAccount.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t("deleteDialogTitle")}
        description={
          account
            ? t("deleteDialogDescriptionWithName", { name: account.name })
            : t("deleteDialogDescription")
        }
        itemName={t("deleteDialogItemName")}
        isLoading={deleteAccount.isPending}
      />
    </>
  );
}

