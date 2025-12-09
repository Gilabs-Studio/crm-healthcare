"use client";

import React, { useState } from "react";
import { Edit, Trash2, Plus, Search, Eye, TrendingUp, UserPlus, MoreVertical, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useLeadList } from "../hooks/useLeadList";
import { LeadForm } from "./lead-form";
import { LeadDetailModal } from "./lead-detail-modal";
import { ConvertLeadDialog } from "./convert-lead-dialog";
import { useLeadFormData, useConvertLead, useCreateAccountFromLead } from "../hooks/useLeads";
import { useUsers } from "@/features/master-data/user-management/hooks/useUsers";
import { useHasPermission } from "@/features/master-data/user-management/hooks/useHasPermission";
import { useAccounts } from "../../account-management/hooks/useAccounts";
import type { Lead } from "../types";
import type { CreateLeadFormData, UpdateLeadFormData } from "../schemas/lead.schema";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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

export function LeadList() {
  const t = useTranslations("leadManagement.leadList");
  const {
    setPage,
    setPerPage,
    search,
    setSearch,
    status,
    setStatus,
    source,
    setSource,
    assignedTo,
    setAssignedTo,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingLead,
    setEditingLead,
    leads,
    pagination,
    editingLeadData,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    deletingLeadId,
    setDeletingLeadId,
    deleteLead,
    createLead,
    updateLead,
  } = useLeadList();

  const { data: formData } = useLeadFormData();
  const { data: usersData } = useUsers({ per_page: 100, status: "active" });
  const users = usersData?.data ?? [];
  const leadSources = formData?.data?.lead_sources ?? [];

  // Permission checks
  const hasCreatePermission = useHasPermission("CREATE_LEADS");
  const hasEditPermission = useHasPermission("EDIT_LEADS");
  const hasDeletePermission = useHasPermission("DELETE_LEADS");
  const hasConvertPermission = useHasPermission("CONVERT_LEADS");
  const hasCreateAccountPermission = useHasPermission("CREATE_ACCOUNT_FROM_LEAD");

  const [viewingLeadId, setViewingLeadId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [creatingAccountLeadId, setCreatingAccountLeadId] = useState<string | null>(null);
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);

  const convertLead = useConvertLead();
  const createAccountFromLead = useCreateAccountFromLead();
  const { data: accountsData } = useAccounts({ per_page: 100, status: "active" });
  const accounts = accountsData?.data ?? [];

  const handleViewLead = (id: string) => {
    setViewingLeadId(id);
    setIsDetailModalOpen(true);
  };

  const handleConvertLead = (lead: Lead) => {
    setConvertingLead(lead);
    setIsConvertDialogOpen(true);
  };

  const handleCreateAccountFromLead = (leadId: string) => {
    setCreatingAccountLeadId(leadId);
    setIsCreateAccountDialogOpen(true);
  };

  const handleCreateAccountConfirm = async () => {
    if (!creatingAccountLeadId) return;
    try {
      await createAccountFromLead.mutateAsync({
        id: creatingAccountLeadId,
        data: { create_contact: true },
      });
      toast.success(t("toast.accountCreated"));
      setIsCreateAccountDialogOpen(false);
      setCreatingAccountLeadId(null);
    } catch {
      // Error handled by interceptor
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const columns: Column<Lead>[] = [
    {
      id: "name",
      header: t("table.name"),
      accessor: (row) => (
        <div>
          <div className="font-medium">
            {row.first_name} {row.last_name}
          </div>
          {row.company_name && (
            <div className="text-sm text-muted-foreground">{row.company_name}</div>
          )}
        </div>
      ),
      className: "min-w-[200px]",
    },
    {
      id: "email",
      header: t("table.email"),
      accessor: (row) => (
        <span className="text-sm">{row.email}</span>
      ),
      className: "w-[200px]",
    },
    {
      id: "phone",
      header: t("table.phone"),
      accessor: (row) => (
        <span className="text-sm text-muted-foreground">{row.phone || "-"}</span>
      ),
      className: "w-[150px]",
    },
    {
      id: "lead_source",
      header: t("table.source"),
      accessor: (row) => {
        const source = leadSources.find((s) => s.value === row.lead_source);
        return (
          <Badge variant="outline" className="text-xs">
            {source?.label ?? row.lead_source}
          </Badge>
        );
      },
      className: "w-[120px]",
    },
    {
      id: "lead_status",
      header: t("table.status"),
      accessor: (row) => (
        <Badge variant={statusColors[row.lead_status] || "outline"} className="capitalize">
          {row.lead_status}
        </Badge>
      ),
      className: "w-[120px]",
    },
    {
      id: "lead_score",
      header: t("table.score"),
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{row.lead_score}</span>
        </div>
      ),
      className: "w-[100px]",
    },
    {
      id: "assigned_user",
      header: t("table.assignedTo"),
      accessor: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.assigned_user?.name ?? "-"}
        </span>
      ),
      className: "w-[150px]",
    },
    {
      id: "created_at",
      header: t("table.createdAt"),
      accessor: (row) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.created_at)}</span>
      ),
      className: "w-[150px]",
    },
    {
      id: "actions",
      header: t("table.actions"),
      accessor: (row) => {
        const canEdit = hasEditPermission && row.lead_status !== "converted";
        const canDelete = hasDeletePermission && row.lead_status !== "converted";
        const canConvert = hasConvertPermission && row.lead_status === "qualified";
        const canCreateAccount = hasCreateAccountPermission && row.lead_status !== "converted" && !row.account_id && row.company_name;
        // Dropdown menu actions (exclude Edit, as it's visible)
        const hasAnyDropdownAction = canDelete || canConvert || canCreateAccount;

        // Build menu items dynamically (Edit is excluded, shown as visible button)
        const menuItems: Array<{ label: string; icon: React.ReactNode; onClick: () => void; variant?: "destructive" }> = [];

        if (canConvert) {
          menuItems.push({
            label: t("buttons.convert"),
            icon: <TrendingUp className="h-4 w-4" />,
            onClick: () => handleConvertLead(row),
          });
        }

        if (canCreateAccount) {
          menuItems.push({
            label: t("buttons.createAccount"),
            icon: <Building2 className="h-4 w-4" />,
            onClick: () => handleCreateAccountFromLead(row.id),
          });
        }

        if (canDelete) {
          if (menuItems.length > 0) {
            menuItems.push({
              label: "", // Separator
              icon: null,
              onClick: () => {},
            });
          }
          menuItems.push({
            label: t("buttons.delete"),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleDeleteClick(row.id),
            variant: "destructive",
          });
        }

        return (
          <div className="flex items-center justify-end gap-1">
            {/* View button - always visible */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={() => handleViewLead(row.id)}
              title={t("buttons.viewDetails")}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {/* Edit button - visible if has permission and not converted */}
            {canEdit && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-8 w-8"
                onClick={() => setEditingLead(row.id)}
                title={t("buttons.edit")}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            {/* Dropdown menu for other actions (Convert, Create Account, Delete) */}
            {hasAnyDropdownAction && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8"
                    title={t("buttons.moreActions")}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {menuItems.map((item, index) => {
                    if (item.label === "") {
                      return <DropdownMenuSeparator key={`separator-${index}`} />;
                    }
                    return (
                      <DropdownMenuItem
                        key={item.label}
                        onClick={item.onClick}
                        variant={item.variant}
                        className={item.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
      className: "w-[120px] text-right",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("filters.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Select
            value={status || "all"}
            onValueChange={(value) => setStatus(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder={t("filters.allStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={source || "all"}
            onValueChange={(value) => setSource(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder={t("filters.allSources")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allSources")}</SelectItem>
              {leadSources.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={assignedTo || "all"}
            onValueChange={(value) => setAssignedTo(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder={t("filters.allUsers")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allUsers")}</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasCreatePermission && (
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("buttons.addLead")}
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={leads}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        emptyMessage={t("empty.table")}
        itemName="lead"
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("dialogs.createTitle")}</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSubmit={async (data) => {
              await handleCreate(data as CreateLeadFormData);
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createLead.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingLead && editingLeadData?.data && (
        <Dialog open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("dialogs.editTitle")}</DialogTitle>
            </DialogHeader>
            <LeadForm
              lead={editingLeadData.data}
              onSubmit={handleUpdate}
              onCancel={() => setEditingLead(null)}
              isLoading={updateLead.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletingLeadId}
        onOpenChange={(open) => !open && setDeletingLeadId(null)}
        onConfirm={handleDeleteConfirm}
        title={t("dialogs.deleteTitle")}
        description={t("dialogs.deleteDescription")}
        isLoading={deleteLead.isPending}
      />

      {/* Detail Modal */}
      {viewingLeadId && (
        <LeadDetailModal
          leadId={viewingLeadId}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onLeadUpdated={() => {
            // Refresh will be handled by query invalidation
          }}
        />
      )}

      {/* Convert Lead Dialog */}
      {convertingLead && (
        <ConvertLeadDialog
          lead={convertingLead}
          open={isConvertDialogOpen}
          onOpenChange={(open) => {
            setIsConvertDialogOpen(open);
            if (!open) setConvertingLead(null);
          }}
          onSuccess={() => {
            setIsConvertDialogOpen(false);
            setConvertingLead(null);
            // Refresh will be handled by query invalidation
          }}
        />
      )}

      {/* Create Account From Lead Dialog */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("createAccountDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("createAccountDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              {t("createAccountDialog.fields.createContact")}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateAccountDialogOpen(false);
                setCreatingAccountLeadId(null);
              }}
            >
              {t("createAccountDialog.buttons.cancel")}
            </Button>
            <Button
              onClick={handleCreateAccountConfirm}
              disabled={createAccountFromLead.isPending}
            >
              {createAccountFromLead.isPending
                ? t("createAccountDialog.buttons.creating")
                : t("createAccountDialog.buttons.create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

