"use client";

import { useState } from "react";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useCategories, useDeleteCategory, useCategory, useCreateCategory, useUpdateCategory } from "../hooks/useCategories";
import { CategoryForm } from "./category-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Category } from "../types/category";

interface CategoryListProps {
  readonly type: "diagnosis" | "procedure";
}

export function CategoryList({ type }: CategoryListProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const { data, isLoading } = useCategories({
    page,
    per_page: 20,
    type,
    status,
    search,
  });
  const { data: editingCategoryData } = useCategory(editingCategory || "");
  const deleteCategory = useDeleteCategory();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const categories = data?.data || [];
  const pagination = data?.meta?.pagination;

  const handleCreate = async (formData: { name: string; description?: string; status?: "active" | "inactive" }) => {
    try {
      await createCategory.mutateAsync({
        type,
        ...formData,
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  const handleUpdate = async (formData: { name?: string; description?: string; status?: "active" | "inactive" }) => {
    if (editingCategory) {
      try {
        await updateCategory.mutateAsync({ id: editingCategory, data: formData });
        setEditingCategory(null);
      } catch (error) {
        // Error already handled in api-client interceptor
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory.mutateAsync(id);
      } catch (error) {
        // Error already handled in api-client interceptor
      }
    }
  };

  const columns: Column<Category>[] = [
    {
      id: "name",
      header: "Name",
      accessor: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      id: "description",
      header: "Description",
      accessor: (row) => row.description || "-",
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
            onClick={() => setEditingCategory(row.id)}
            className="h-8 w-8"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(row.id)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      className: "w-[100px] text-right",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
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
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        emptyMessage="No categories found"
        pagination={pagination}
        onPageChange={setPage}
        itemName="category"
      />

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

      {editingCategory && editingCategoryData?.data && (
        <Dialog
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategoryData.data}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCategory(null)}
              isLoading={updateCategory.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

