"use client";

import { Edit, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoryList } from "../hooks/useCategoryList";
import { CategoryForm } from "./category-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";

export function CategoryList() {
  const {
    editingCategory,
    setEditingCategory,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    deletingCategoryId,
    setDeletingCategoryId,
    categories,
    categoryForEdit,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    deleteCategory,
    createCategory,
    updateCategory,
  } = useCategoryList();

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-end">
        <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">Badge Color</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {category.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {category.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.badge_color as any} className="font-normal">
                        {category.badge_color}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.status === "active" ? "active" : "inactive"}>
                        {category.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingCategory(category.id)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(category.id)}
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
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createCategory.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingCategory && categoryForEdit && (
        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={categoryForEdit}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCategory(null)}
              isLoading={updateCategory.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletingCategoryId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCategoryId(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Category?"
        description={
          deletingCategoryId
            ? `Are you sure you want to delete category "${categories.find((c) => c.id === deletingCategoryId)?.name || "this category"}"? This action cannot be undone.`
            : "Are you sure you want to delete this category? This action cannot be undone."
        }
        itemName="category"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}

