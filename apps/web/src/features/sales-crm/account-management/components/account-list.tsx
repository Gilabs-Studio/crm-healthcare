"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, Search, Eye, ChevronDown, ChevronRight, UserPlus, Contact, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useContacts, useContact, useDeleteContact, useCreateContact, useUpdateContact } from "../hooks/useContacts";
import { toast } from "sonner";
import type { Account, Contact } from "../types";
import { cn } from "@/lib/utils";

export function AccountList() {
  const {
    page,
    setPage,
    setPerPage,
    search,
    setSearch,
    status,
    setStatus,
    category,
    setCategory,
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
    handleDelete,
    createAccount,
    updateAccount,
  } = useAccountList();

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

  const handleCreateContactSubmit = async (data: any) => {
    if (!createContactAccountId) return;
    try {
      await createContact.mutateAsync({ ...data, account_id: createContactAccountId });
      setIsCreateContactDialogOpen(false);
      setCreateContactAccountId(null);
      toast.success("Contact created successfully");
    } catch (error) {
      // Error already handled
    }
  };

  const handleUpdateContactSubmit = async (data: any) => {
    if (!editingContact?.contactId) return;
    try {
      await updateContact.mutateAsync({ id: editingContact.contactId, data });
      setEditingContact(null);
      toast.success("Contact updated successfully");
    } catch (error) {
      // Error already handled
    }
  };

  const handleDeleteContactConfirm = async () => {
    if (!deletingContactId) return;
    try {
      await deleteContact.mutateAsync(deletingContactId);
      setDeletingContactId(null);
      toast.success("Contact deleted successfully");
    } catch (error) {
      // Error already handled
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">All Categories</option>
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="pharmacy">Pharmacy</option>
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
                      onDelete={() => handleDelete(account.id)}
                      onCreateContact={() => handleCreateContact(account.id)}
                      onEditContact={handleEditContact}
                      onDeleteContact={handleDeleteContactClick}
                      getCategoryBadgeVariant={getCategoryBadgeVariant}
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
      {editingContact && editingContact.contactId && (
        <ContactEditDialog
          accountId={editingContact.accountId}
          contactId={editingContact.contactId}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
          onSubmit={handleUpdateContactSubmit}
          isLoading={updateContact.isPending}
        />
      )}

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
  account: Account;
  isExpanded: boolean;
  onToggle: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateContact: () => void;
  onEditContact: (accountId: string, contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  getCategoryBadgeVariant: (category: string) => "default" | "secondary" | "outline";
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
  getCategoryBadgeVariant,
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
          <Badge variant={getCategoryBadgeVariant(account.category)} className="font-normal capitalize">
            {account.category}
          </Badge>
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
              {isLoadingContacts ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : contacts.length === 0 ? (
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
              ) : (
                <div className="grid gap-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="group relative flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-border/80 hover:shadow-sm transition-all"
                    >
                      {/* Avatar/Icon */}
                      <div className="flex-shrink-0">
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
                          <Badge variant="outline" className="text-xs font-normal capitalize shrink-0">
                            {contact.role}
                          </Badge>
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
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

interface ContactEditDialogProps {
  accountId: string;
  contactId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

function ContactEditDialog({
  accountId,
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
        {isLoadingContact ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : contactData?.data ? (
          <ContactForm
            contact={contactData.data}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
