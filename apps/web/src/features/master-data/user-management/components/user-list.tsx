"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useUserList } from "../hooks/useUserList";
import { UserForm } from "./user-form";
import { UserDetailModal } from "./user-detail-modal";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "../types";

export function UserList() {
  const {
    page,
    setPage,
    setPerPage,
    search,
    setSearch,
    status,
    setStatus,
    roleId,
    setRoleId,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingUser,
    setEditingUser,
    users,
    pagination,
    roles,
    editingUserData,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    deletingUserId,
    setDeletingUserId,
    deleteUser,
    createUser,
    updateUser,
  } = useUserList();

  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getAvatarUrl = (user: User) => {
    if (user.avatar_url) {
      return user.avatar_url;
    }
    // Always use dicebear with email as seed
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(user.email)}`;
  };

  const handleViewUser = (userId: string) => {
    setViewingUserId(userId);
    setIsDetailModalOpen(true);
  };

  const columns: Column<User>[] = [
    {
      id: "name",
      header: "Name",
      accessor: (row) => (
        <button
          onClick={() => handleViewUser(row.id)}
          className="flex items-center gap-3 font-medium text-primary hover:underline"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={getAvatarUrl(row)} alt={row.name} />
          </Avatar>
          <span>{row.name}</span>
        </button>
      ),
      className: "w-[200px]",
    },
    {
      id: "email",
      header: "Email",
      accessor: (row) => (
        <span className="text-muted-foreground">{row.email}</span>
      ),
    },
    {
      id: "role",
      header: "Role",
      accessor: (row) => (
        <Badge variant="outline" className="font-normal">
          {row.role?.name || "N/A"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        <Badge variant={row.status === "active" ? "active" : "inactive"}>
          {row.status}
        </Badge>
      ),
      className: "w-[100px]",
    },
    {
      id: "actions",
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8"
            title="View Details"
            onClick={() => handleViewUser(row.id)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditingUser(row.id)}
            className="h-8 w-8"
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDeleteClick(row.id)}
            className="h-8 w-8 text-destructive hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      className: "w-[140px] text-right",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
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
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">All Roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyMessage="No users found"
        pagination={
          pagination
            ? {
                page: pagination.page,
                per_page: pagination.per_page,
                total: pagination.total,
                total_pages: pagination.total_pages,
                has_next: pagination.has_next,
                has_prev: pagination.has_prev,
              }
            : undefined
        }
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        itemName="user"
        perPageOptions={[10, 20, 50, 100]}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createUser.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingUser && editingUserData?.data && (
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <UserForm
              user={editingUserData.data}
              onSubmit={handleUpdate}
              onCancel={() => setEditingUser(null)}
              isLoading={updateUser.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        userId={viewingUserId}
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          setIsDetailModalOpen(open);
          if (!open) {
            setViewingUserId(null);
          }
        }}
        onUserUpdated={() => {
          // Refresh will be handled by query invalidation in hooks
        }}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletingUserId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingUserId(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete User?"
        description={
          deletingUserId
            ? `Are you sure you want to delete user "${users.find((u) => u.id === deletingUserId)?.name || "this user"}"? This action cannot be undone.`
            : "Are you sure you want to delete this user? This action cannot be undone."
        }
        itemName="user"
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}
