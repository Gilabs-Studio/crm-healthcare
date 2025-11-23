"use client";

import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserList } from "../hooks/useUserList";
import { UserForm } from "./user-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UserList() {
  const {
    page,
    setPage,
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
    handleDelete,
    createUser,
    updateUser,
  } = useUserList();

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];
    
    const totalPages = pagination.total_pages;
    const currentPage = pagination.page;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

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
      <div className="border rounded-lg">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`skeleton-${i}`} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {user.role?.name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "active" : "inactive"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditingUser(user.id)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(user.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Modern Pagination */}
            {pagination && (
              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{((pagination.page - 1) * pagination.per_page) + 1}</span> to{" "}
                    <span className="font-medium text-foreground">{Math.min(pagination.page * pagination.per_page, pagination.total)}</span> of{" "}
                    <span className="font-medium text-foreground">{pagination.total}</span> {pagination.total === 1 ? "user" : "users"}
                  </div>
                  
                  {pagination.total_pages > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!pagination.has_prev || isLoading}
                        className="h-9 px-3"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1 mx-2">
                        {getPageNumbers().map((pageNum, idx) => {
                          if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
                            return (
                              <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                ...
                              </span>
                            );
                          }
                          
                          const pageNumber = pageNum as number;
                          const isActive = pageNumber === pagination.page;
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={isActive ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setPage(pageNumber)}
                              disabled={isLoading}
                              className={`h-9 min-w-9 px-3 ${isActive ? "font-semibold" : ""}`}
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!pagination.has_next || isLoading}
                        className="h-9 px-3"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
    </div>
  );
}
