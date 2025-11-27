"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "./product-form";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../hooks/useProducts";
import type { ProductStatus } from "../types/product";

export function ProductList() {
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [page, setPage] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useProducts({
    page,
    per_page: 20,
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products = data?.data ?? [];
  const pagination = data?.meta.pagination;

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleCreate = async (formData: Parameters<typeof createMutation.mutateAsync>[0]) => {
    await createMutation.mutateAsync(formData);
    setIsDialogOpen(false);
  };

  const handleUpdate = async (formData: Parameters<typeof updateMutation.mutateAsync>[0]["data"]) => {
    if (!selectedProductId) return;
    await updateMutation.mutateAsync({ id: selectedProductId, data: formData });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const resetDialogState = () => {
    setSelectedProductId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product catalog for healthcare and pharmaceutical sales.
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetDialogState();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={selectedProduct}
              onSubmit={selectedProduct ? handleUpdate : handleCreate}
              onCancel={() => {
                setIsDialogOpen(false);
                resetDialogState();
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, or barcode"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(event) => {
              const value = event.target.value as ProductStatus | "all";
              setStatusFilter(value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">SKU / Barcode</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Stock</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              )}

              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                    No products found. Try adjusting your filters or add a new product.
                  </td>
                </tr>
              )}

              {!isLoading &&
                products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="px-4 py-2 align-middle">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {product.description || "No description"}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <div className="text-xs">
                        <span className="font-medium">SKU:</span> {product.sku}
                      </div>
                      {product.barcode && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          <span className="font-medium">Barcode:</span> {product.barcode}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <div className="text-sm">
                        {product.category?.name ?? (
                          <span className="text-muted-foreground">Uncategorized</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-middle text-right whitespace-nowrap">
                      <div className="font-medium">
                        {product.price_formatted || `Rp ${(product.price / 100).toLocaleString("id-ID")}`}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-middle text-right">
                      <div className="font-medium">{product.stock}</div>
                    </td>
                    <td className="px-4 py-2 align-middle text-center">
                      <Badge
                        variant={product.status === "active" ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {product.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProductId(product.id);
                            setIsDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => void handleDelete(product.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <div>
              Page {pagination.page} of {pagination.total_pages} • Total {pagination.total} products
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!pagination.has_prev}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!pagination.has_next}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


