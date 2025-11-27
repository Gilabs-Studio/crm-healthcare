"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
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
import { ProductCategoryForm } from "./product-category-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useState } from "react";
import { toast } from "sonner";
import {
  useProductCategories,
  useProductCategory,
  useCreateProductCategory,
  useUpdateProductCategory,
  useDeleteProductCategory,
} from "../hooks/useProductCategories";
import type {
  CreateProductCategoryFormData,
  UpdateProductCategoryFormData,
} from "../schemas/category.schema";

export function ProductCategoryList() {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const { data, isLoading } = useProductCategories();
  const categories = data?.data ?? [];

  const { data: editingCategory } = useProductCategory(editingCategoryId || "");
  const createMutation = useCreateProductCategory();
  const updateMutation = useUpdateProductCategory();
  const deleteMutation = useDeleteProductCategory();

  const handleCreate = async (formData: CreateProductCategoryFormData) => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      toast.success("Product category created successfully");
    } catch {
      // handled by api-client interceptor
    }
  };

  const handleUpdate = async (formData: UpdateProductCategoryFormData) => {
    if (!editingCategoryId) return;
    try {
      await updateMutation.mutateAsync({ id: editingCategoryId, data: formData });
      setEditingCategoryId(null);
      toast.success("Product category updated successfully");
    } catch {
      // handled by api-client interceptor
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategoryId) return;
    try {
      await deleteMutation.mutateAsync(deletingCategoryId);
      setDeletingCategoryId(null);
      toast.success("Product category deleted successfully");
    } catch {
      // handled by api-client interceptor
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Product Categories</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage product categories for grouping products (e.g., Prescription, OTC, Devices).
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="border rounded-lg">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={`sk-${index}`} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No product categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {category.slug || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {category.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={category.status === "active" ? "active" : "inactive"}
                      >
                        {category.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8"
                          onClick={() => setEditingCategoryId(category.id)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingCategoryId(category.id)}
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Product Category</DialogTitle>
          </DialogHeader>
          <ProductCategoryForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingCategoryId && editingCategory && (
        <Dialog
          open={!!editingCategoryId}
          onOpenChange={(open) => {
            if (!open) setEditingCategoryId(null);
          }}
        >
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Product Category</DialogTitle>
            </DialogHeader>
            <ProductCategoryForm
              category={editingCategory}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCategoryId(null)}
              isLoading={updateMutation.isPending}
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
        title="Delete Product Category?"
        description={
          deletingCategoryId
            ? `Are you sure you want to delete product category "${
                categories.find((c) => c.id === deletingCategoryId)?.name || "this category"
              }"? This action cannot be undone.`
            : "Are you sure you want to delete this product category? This action cannot be undone."
        }
        itemName="product category"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}


