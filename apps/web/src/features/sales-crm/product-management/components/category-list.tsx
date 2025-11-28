"use client";

import { Edit, Trash2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { useHasPermission } from "@/features/master-data/user-management/hooks/useHasPermission";

export function CategoryList() {
  const hasViewPermission = useHasPermission("VIEW_PRODUCT_CATEGORIES");
  const hasCreatePermission = useHasPermission("CREATE_PRODUCT_CATEGORIES");
  const hasEditPermission = useHasPermission("EDIT_PRODUCT_CATEGORIES");
  const hasDeletePermission = useHasPermission("DELETE_PRODUCT_CATEGORIES");

  const {
    editingCategory,
    setEditingCategory,
    deletingCategoryId,
    setDeletingCategoryId,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    categories,
    categoryForEdit,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryList();
  const t = useTranslations("productManagement.categoryList");

  if (!hasViewPermission) {
    return (
      <div className="text-center text-muted-foreground py-8">
        You don't have permission to view product categories.
      </div>
    );
  }

  const handleDeleteClick = (id: string) => {
    setDeletingCategoryId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deletingCategoryId) {
      await handleDelete(deletingCategoryId);
      setDeletingCategoryId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-end">
        {hasCreatePermission && (
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("addCategory")}
          </Button>
        )}
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
                <TableHead className="w-[200px]">{t("name")}</TableHead>
                <TableHead>{t("slug")}</TableHead>
                <TableHead>{t("description")}</TableHead>
                <TableHead className="w-[100px]">{t("status")}</TableHead>
                <TableHead className="w-[120px] text-right">
                  {t("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t("empty")}
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {category.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.status === "active" ? "active" : "inactive"}>
                        {category.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {hasEditPermission && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditingCategory(category.id)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {hasDeletePermission && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteClick(category.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
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
      {hasCreatePermission && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("createTitle")}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={async (data) => {
                await handleCreate(data as any);
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={createCategory.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {hasEditPermission && editingCategory && categoryForEdit && (
        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t("editTitle")}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={categoryForEdit}
              onSubmit={async (data) => {
                await handleUpdate(data as any);
              }}
              onCancel={() => setEditingCategory(null)}
              isLoading={updateCategory.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      {hasDeletePermission && (
        <DeleteDialog
          open={!!deletingCategoryId}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingCategoryId(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
          title={t("deleteTitle")}
          description={
            deletingCategoryId
              ? t("deleteDescriptionWithName", {
                  name:
                    categories.find((c) => c.id === deletingCategoryId)?.name ??
                    t("deleteDescription"),
                })
              : t("deleteDescription")
          }
          itemName="category"
          isLoading={deleteCategory.isPending}
        />
      )}
    </div>
  );
}

