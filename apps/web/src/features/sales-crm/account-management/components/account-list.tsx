"use client";

import { useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Eye,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Contact as ContactIcon,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { AccountForm } from "./account-form";
import { ContactForm } from "./contact-form";
import { AccountDetailModal } from "./account-detail-modal";
import { useAccountList } from "../hooks/useAccountList";
import { useCategories } from "../hooks/useCategories";
import { useContacts, useContact, useDeleteContact, useCreateContact, useUpdateContact } from "../hooks/useContacts";
import { useHasPermission } from "@/features/master-data/user-management/hooks/useHasPermission";
import { toast } from "sonner";
import type { Account, Contact } from "../types";
import type { CreateContactFormData, UpdateContactFormData } from "../schemas/contact.schema";
import type { VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";

export function AccountList() {
  const {
    setPage,
    setPerPage,
    search,
    setSearch,
    status,
    setStatus,
    categoryId,
    setCategoryId,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingAccount,
    setEditingAccount,
    accounts,
    pagination,
    editingAccountData,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    deletingAccountId,
    setDeletingAccountId,
    deleteAccount,
    createAccount,
    updateAccount,
  } = useAccountList();

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data || [];

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [viewingAccountId, setViewingAccountId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<{ accountId: string; contactId: string | null } | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const [isCreateContactDialogOpen, setIsCreateContactDialogOpen] = useState(false);
  const [createContactAccountId, setCreateContactAccountId] = useState<string | null>(null);
  
  // Permission checks
  const hasCreatePermission = useHasPermission("CREATE_ACCOUNTS");
  const hasEditPermission = useHasPermission("EDIT_ACCOUNTS");
  const hasDeletePermission = useHasPermission("DELETE_ACCOUNTS");

  const toggleRow = (accountId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedRows(newExpanded);
  };

  const handleViewAccount = (accountId: string) => {
    setViewingAccountId(accountId);
    setIsDetailModalOpen(true);
  };

  const handleCreateContact = (accountId: string) => {
    setCreateContactAccountId(accountId);
    setIsCreateContactDialogOpen(true);
  };

  const handleEditContact = (accountId: string, contactId: string) => {
    setEditingContact({ accountId, contactId });
  };

  const handleDeleteContactClick = (contactId: string) => {
    setDeletingContactId(contactId);
  };

  const deleteContact = useDeleteContact();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const t = useTranslations("accountManagement.accountList");
  const tContacts = useTranslations("accountManagement.accountList.contactsSection");
  const tToast = useTranslations("accountManagement.accountList.toast");

  const handleCreateContactSubmit = async (data: CreateContactFormData) => {
    if (!createContactAccountId) return;
    try {
      await createContact.mutateAsync({ ...data, account_id: createContactAccountId });
      setIsCreateContactDialogOpen(false);
      setCreateContactAccountId(null);
      toast.success(tToast("contactCreated"));
    } catch {
      // Error already handled
    }
  };

  const handleUpdateContactSubmit = async (data: UpdateContactFormData) => {
    if (!editingContact?.contactId) return;
    try {
      await updateContact.mutateAsync({ id: editingContact.contactId, data });
      setEditingContact(null);
      toast.success(tToast("contactUpdated"));
    } catch {
      // Error already handled
    }
  };

  const handleDeleteContactConfirm = async () => {
    if (!deletingContactId) return;
    try {
      await deleteContact.mutateAsync(deletingContactId);
      setDeletingContactId(null);
      toast.success(tToast("contactDeleted"));
    } catch {
      // Error already handled
    }
  };
  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
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
              <SelectValue placeholder={t("allStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatus")}</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={categoryId || "all"} 
            onValueChange={(value) => setCategoryId(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder={t("allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCategories")}</SelectItem>
              {categories
                .filter((cat) => cat.status === "active")
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {hasCreatePermission && (
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("addAccount")}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={`skeleton-row-${i}`} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-[250px]">{t("table.name")}</TableHead>
                  <TableHead>{t("table.category")}</TableHead>
                  <TableHead className="w-[150px]">{t("table.city")}</TableHead>
                  <TableHead className="w-[150px]">{t("table.phone")}</TableHead>
                  <TableHead className="w-[100px]">{t("table.status")}</TableHead>
                  <TableHead className="w-[140px] text-right">
                    {t("table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {t("empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => (
                    <AccountRow
                      key={account.id}
                      account={account}
                      isExpanded={expandedRows.has(account.id)}
                      onToggle={() => toggleRow(account.id)}
                      onView={() => handleViewAccount(account.id)}
                      onEdit={() => setEditingAccount(account.id)}
                      onDelete={() => handleDeleteClick(account.id)}
                      onCreateContact={() => handleCreateContact(account.id)}
                      onEditContact={handleEditContact}
                      onDeleteContact={handleDeleteContactClick}
                      hasEditPermission={hasEditPermission}
                      hasDeletePermission={hasDeletePermission}
                    />
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && (
              <div className="border-t bg-muted/30 px-6 py-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 order-3 lg:order-1">
                    <label htmlFor="rows-per-page" className="text-sm whitespace-nowrap">
                      {t("rowsPerPage")}
                    </label>
                    <Select
                      value={String(pagination.per_page)}
                      onValueChange={(value) => {
                        setPerPage(Number(value));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger
                        id="rows-per-page"
                        className="w-fit whitespace-nowrap h-9"
                      >
                        <SelectValue placeholder="Select rows" />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 20, 50, 100].map((option) => (
                          <SelectItem key={option} value={String(option)}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex grow justify-center lg:justify-end text-sm whitespace-nowrap text-muted-foreground order-2">
                    <p>
                      <span className="text-foreground font-semibold">
                        {(pagination.page - 1) * pagination.per_page + 1}-
                        {Math.min(pagination.page * pagination.per_page, pagination.total)}
                      </span>{" "}
                      {t("paginationOf", {
                        total: pagination.total,
                      })}
                    </p>
                  </div>
                  {pagination.total_pages > 1 && (
                    <div className="order-1 lg:order-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(1)}
                        disabled={!pagination.has_prev}
                      >
                        {t("first")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, pagination.page - 1))}
                        disabled={!pagination.has_prev}
                      >
                        {t("prev")}
                      </Button>
                      <span className="text-sm">
                        Page {pagination.page} of {pagination.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.page + 1)}
                        disabled={!pagination.has_next}
                      >
                        {t("next")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.total_pages)}
                        disabled={!pagination.has_next}
                      >
                        {t("last")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Account Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("createTitle")}</DialogTitle>
          </DialogHeader>
          <AccountForm
            onSubmit={async (data) => {
              await handleCreate(data as any);
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createAccount.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      {editingAccount && editingAccountData?.data && (
        <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("editTitle")}</DialogTitle>
            </DialogHeader>
            <AccountForm
              account={editingAccountData.data}
              onSubmit={async (data) => {
                await handleUpdate(data as any);
              }}
              onCancel={() => setEditingAccount(null)}
              isLoading={updateAccount.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Account Detail Modal */}
      <AccountDetailModal
        accountId={viewingAccountId}
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          setIsDetailModalOpen(open);
          if (!open) {
            setViewingAccountId(null);
          }
        }}
        onAccountUpdated={() => {
          // Refresh will be handled by query invalidation
        }}
      />

      {/* Create Contact Dialog */}
      {isCreateContactDialogOpen && createContactAccountId && (
        <Dialog open={isCreateContactDialogOpen} onOpenChange={setIsCreateContactDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Contact</DialogTitle>
            </DialogHeader>
            <ContactForm
              defaultAccountId={createContactAccountId}
              onSubmit={async (data) => {
                await handleCreateContactSubmit(data as any);
              }}
              onCancel={() => {
                setIsCreateContactDialogOpen(false);
                setCreateContactAccountId(null);
              }}
              isLoading={createContact.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Contact Dialog */}
      {editingContact?.contactId && (
        <ContactEditDialog
          contactId={editingContact.contactId}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
          onSubmit={handleUpdateContactSubmit}
          isLoading={updateContact.isPending}
        />
      )}

      {/* Delete Account Dialog */}
      <DeleteDialog
        open={!!deletingAccountId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingAccountId(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title={t("deleteTitle")}
        description={
          deletingAccountId
            ? t("deleteDescriptionWithName", {
                name: accounts.find((a) => a.id === deletingAccountId)?.name || "this account",
              })
            : t("deleteDescription")
        }
        itemName={t("deleteTitle")}
        isLoading={deleteAccount.isPending}
      />

      {/* Delete Contact Dialog */}
      <DeleteDialog
        open={!!deletingContactId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingContactId(null);
          }
        }}
        onConfirm={handleDeleteContactConfirm}
        title="Delete Contact?"
        description="Are you sure you want to delete this contact? This action cannot be undone."
        itemName="contact"
        isLoading={deleteContact.isPending}
      />
    </div>
  );
}


interface AccountRowProps {
  readonly account: Account;
  readonly isExpanded: boolean;
  readonly onToggle: () => void;
  readonly onView: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
  readonly onCreateContact: () => void;
  readonly onEditContact: (accountId: string, contactId: string) => void;
  readonly onDeleteContact: (contactId: string) => void;
  readonly hasEditPermission: boolean;
  readonly hasDeletePermission: boolean;
}

function AccountRow({
  account,
  isExpanded,
  onToggle,
  onView,
  onEdit,
  onDelete,
  onCreateContact,
  onEditContact,
  onDeleteContact,
  hasEditPermission,
  hasDeletePermission,
}: AccountRowProps) {
  const { data: contactsData, isLoading: isLoadingContacts } = useContacts({
    account_id: account.id,
    per_page: 100,
  });
  const contacts = contactsData?.data || [];
  const tContacts = useTranslations("accountManagement.accountList.contactsSection");

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6"
            onClick={onToggle}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <button
            onClick={onView}
            className="font-medium text-primary hover:underline"
          >
            {account.name}
          </button>
        </TableCell>
        <TableCell>
          {account.category ? (
            <Badge 
              variant={(account.category?.badge_color || "secondary") as VariantProps<typeof badgeVariants>["variant"]} 
              className="font-normal"
            >
              {account.category?.name || "-"}
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell>
          <span className="text-muted-foreground">{account.city || "-"}</span>
        </TableCell>
        <TableCell>
          <span className="text-muted-foreground">{account.phone || "-"}</span>
        </TableCell>
        <TableCell>
          <Badge variant={account.status === "active" ? "active" : "inactive"}>
            {account.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              title="View Details"
              onClick={onView}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {hasEditPermission && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onEdit}
                className="h-8 w-8"
                title="Edit"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            {hasDeletePermission && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onDelete}
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/20 p-0">
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-foreground">
                    {tContacts("title")}
                  </h4>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {contacts.length}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateContact}
                  className="h-8 gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{tContacts("addContact")}</span>
                </Button>
              </div>

              {/* Content */}
              {(() => {
                if (isLoadingContacts) {
                  return (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }, (_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                      ))}
                    </div>
                  );
                }
                if (contacts.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <UserPlus className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        {tContacts("emptyTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        {tContacts("emptyDescription")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onCreateContact}
                        className="h-8 gap-1.5"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>{tContacts("addContact")}</span>
                      </Button>
                    </div>
                  );
                }
                return (
                  <div className="grid gap-3">
                    {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="group relative flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-border/80 hover:shadow-sm transition-all"
                    >
                      {/* Avatar/Icon */}
                      <div className="shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ContactIcon className="h-5 w-5 text-primary" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h5 className="font-medium text-sm text-foreground truncate">
                              {contact.name}
                            </h5>
                            {contact.position && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {contact.position}
                              </p>
                            )}
                          </div>
                          {contact.role ? (
                            <Badge 
                              variant={contact.role.badge_color as VariantProps<typeof badgeVariants>["variant"]} 
                              className="text-xs font-normal shrink-0"
                            >
                              {contact.role.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs font-normal shrink-0">
                              -
                            </Badge>
                          )}
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                          {contact.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              <span className="truncate">{contact.phone}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate">{contact.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8"
                          onClick={() => onEditContact(account.id, contact.id)}
                          title={tContacts("editContactTooltip")}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDeleteContact(contact.id)}
                          title={tContacts("deleteContactTooltip")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

interface ContactEditDialogProps {
  readonly contactId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (data: UpdateContactFormData) => Promise<void>;
  readonly isLoading: boolean;
}

function ContactEditDialog({
  contactId,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: ContactEditDialogProps) {
  const { data: contactData, isLoading: isLoadingContact } = useContact(contactId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        {(() => {
          if (isLoadingContact) {
            return (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            );
          }
          if (contactData?.data) {
            return (
              <ContactForm
                contact={contactData.data}
                onSubmit={onSubmit}
                onCancel={() => onOpenChange(false)}
                isLoading={isLoading}
              />
            );
          }
          return null;
        })()}
      </DialogContent>
    </Dialog>
  );
}
