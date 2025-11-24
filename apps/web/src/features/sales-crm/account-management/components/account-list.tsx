"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, Search, Eye, ChevronDown, ChevronRight, UserPlus, Contact, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, badgeVariants } from "@/components/ui/badge";
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
import { toast } from "sonner";
import type { Account, Contact } from "../types";
import type { CreateContactFormData, UpdateContactFormData } from "../schemas/contact.schema";
import type { VariantProps } from "class-variance-authority";

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

  const handleCreateContactSubmit = async (data: CreateContactFormData) => {
    if (!createContactAccountId) return;
    try {
      await createContact.mutateAsync({ ...data, account_id: createContactAccountId });
      setIsCreateContactDialogOpen(false);
      setCreateContactAccountId(null);
      toast.success("Contact created successfully");
    } catch {
      // Error already handled
    }
  };

  const handleUpdateContactSubmit = async (data: UpdateContactFormData) => {
    if (!editingContact?.contactId) return;
    try {
      await updateContact.mutateAsync({ id: editingContact.contactId, data });
      setEditingContact(null);
      toast.success("Contact updated successfully");
    } catch {
      // Error already handled
    }
  };

  const handleDeleteContactConfirm = async () => {
    if (!deletingContactId) return;
    try {
      await deleteContact.mutateAsync(deletingContactId);
      setDeletingContactId(null);
      toast.success("Contact deleted successfully");
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
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">All Categories</option>
            {categories
              .filter((cat) => cat.status === "active")
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
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
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[150px]">City</TableHead>
                  <TableHead className="w-[150px]">Phone</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No accounts found
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
                      Rows per page
                    </label>
                    <select
                      id="rows-per-page"
                      value={pagination.per_page}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {[10, 20, 50, 100].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex grow justify-center lg:justify-end text-sm whitespace-nowrap text-muted-foreground order-2">
                    <p>
                      <span className="text-foreground font-semibold">
                        {(pagination.page - 1) * pagination.per_page + 1}-
                        {Math.min(pagination.page * pagination.per_page, pagination.total)}
                      </span>{" "}
                      of <span className="text-foreground font-semibold">{pagination.total}</span>
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
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, pagination.page - 1))}
                        disabled={!pagination.has_prev}
                      >
                        Prev
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
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.total_pages)}
                        disabled={!pagination.has_next}
                      >
                        Last
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
            <DialogTitle>Create Account</DialogTitle>
          </DialogHeader>
          <AccountForm
            onSubmit={handleCreate}
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
              <DialogTitle>Edit Account</DialogTitle>
            </DialogHeader>
            <AccountForm
              account={editingAccountData.data}
              onSubmit={handleUpdate}
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
              onSubmit={handleCreateContactSubmit}
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
        title="Delete Account?"
        description={
          deletingAccountId
            ? `Are you sure you want to delete account "${accounts.find((a) => a.id === deletingAccountId)?.name || "this account"}"? This action cannot be undone. All associated contacts will also be deleted.`
            : "Are you sure you want to delete this account? This action cannot be undone. All associated contacts will also be deleted."
        }
        itemName="account"
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
}: AccountRowProps) {
  const { data: contactsData, isLoading: isLoadingContacts } = useContacts({
    account_id: account.id,
    per_page: 100,
  });
  const contacts = contactsData?.data || [];

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
              variant={account.category.badge_color as VariantProps<typeof badgeVariants>["variant"]} 
              className="font-normal"
            >
              {account.category.name}
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
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              className="h-8 w-8"
              title="Edit"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
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
                  <h4 className="font-semibold text-sm text-foreground">Contacts</h4>
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
                  <span>Add Contact</span>
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
                      <p className="text-sm font-medium text-foreground mb-1">No contacts yet</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Get started by adding your first contact
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onCreateContact}
                        className="h-8 gap-1.5"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Add Contact</span>
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
                          <Contact className="h-5 w-5 text-primary" />
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
                          title="Edit contact"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDeleteContact(contact.id)}
                          title="Delete contact"
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
