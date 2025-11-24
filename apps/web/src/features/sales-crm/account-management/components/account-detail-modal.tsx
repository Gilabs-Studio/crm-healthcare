"use client";

import { Edit, Trash2, Mail, Building2, MapPin, Phone, Calendar, X } from "lucide-react";
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
import type { Account } from "../types";

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

  const account = data?.data;

  const handleDeleteConfirm = async () => {
    if (!account || !accountId) return;
    try {
      await deleteAccount.mutateAsync(accountId);
      toast.success("Account deleted successfully");
      onOpenChange(false);
      onAccountUpdated?.();
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "hospital":
        return "default";
      case "clinic":
        return "secondary";
      case "pharmacy":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
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
              Failed to load account details
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
                  <h2 className="text-2xl font-semibold tracking-tight">{account.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getCategoryBadgeVariant(account.category)} className="capitalize">
                      {account.category}
                    </Badge>
                    <Badge variant={account.status === "active" ? "active" : "inactive"}>
                      {account.status}
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
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={deleteAccount.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Account Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Basic account details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>Name</span>
                      </div>
                      <div className="text-base font-medium">{account.name}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Category</span>
                      </div>
                      <div>
                        <Badge variant={getCategoryBadgeVariant(account.category)} className="capitalize">
                          {account.category}
                        </Badge>
                      </div>
                    </div>

                    {account.address && (
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Address</span>
                        </div>
                        <div className="text-base font-medium">{account.address}</div>
                      </div>
                    )}

                    {account.city && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>City</span>
                        </div>
                        <div className="text-base font-medium">{account.city}</div>
                      </div>
                    )}

                    {account.province && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Province</span>
                        </div>
                        <div className="text-base font-medium">{account.province}</div>
                      </div>
                    )}

                    {account.phone && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>Phone</span>
                        </div>
                        <div className="text-base font-medium">{account.phone}</div>
                      </div>
                    )}

                    {account.email && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </div>
                        <div className="text-base font-medium">{account.email}</div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Status</span>
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
                        <span>Created At</span>
                      </div>
                      <div className="text-base font-medium">
                        {account.created_at ? new Date(account.created_at).toLocaleDateString() : "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Updated At</span>
                      </div>
                      <div className="text-base font-medium">
                        {account.updated_at ? new Date(account.updated_at).toLocaleDateString() : "N/A"}
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
              <DialogTitle>Edit Account</DialogTitle>
            </DialogHeader>
            <AccountForm
              account={account}
              onSubmit={async (formData) => {
                try {
                  await updateAccount.mutateAsync({ id: accountId!, data: formData });
                  setIsEditDialogOpen(false);
                  toast.success("Account updated successfully");
                  onAccountUpdated?.();
                } catch (error) {
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
        title="Delete Account?"
        description={
          account
            ? `Are you sure you want to delete account "${account.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this account? This action cannot be undone."
        }
        itemName="account"
        isLoading={deleteAccount.isPending}
      />
    </>
  );
}

