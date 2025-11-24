"use client";

import { Edit, Trash2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { useProcedureList } from "../hooks/useProcedureList";
import { ProcedureForm } from "./procedure-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Procedure } from "../types";

export function ProcedureList() {
  const {
    page,
    setPage,
    setPerPage,
    search,
    setSearch,
    status,
    setStatus,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingProcedure,
    setEditingProcedure,
    procedures,
    pagination,
    editingProcedureData,
    isLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    createProcedure,
    updateProcedure,
  } = useProcedureList();

  const formatPrice = (price?: number) => {
    if (!price) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const columns: Column<Procedure>[] = [
    {
      id: "code",
      header: "Code",
      accessor: (row) => (
        <span className="font-medium">{row.code}</span>
      ),
      className: "w-[120px]",
    },
    {
      id: "name",
      header: "Name",
      accessor: (row) => row.name,
    },
    {
      id: "category",
      header: "Category",
      accessor: (row) => row.category?.name || "-",
    },
    {
      id: "price",
      header: "Price",
      accessor: (row) => formatPrice(row.price),
      className: "w-[120px]",
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
            onClick={() => setEditingProcedure(row.id)}
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
              placeholder="Search by code, name, category, or description..."
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
          Add Procedure
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={procedures}
        isLoading={isLoading}
        emptyMessage="No procedures found"
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
        itemName="procedure"
        perPageOptions={[10, 20, 50, 100]}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Procedure</DialogTitle>
          </DialogHeader>
          <ProcedureForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createProcedure.isPending}
          />
        </DialogContent>
      </Dialog>

      {editingProcedure && editingProcedureData?.data && (
        <Dialog
          open={!!editingProcedure}
          onOpenChange={(open) => !open && setEditingProcedure(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Procedure</DialogTitle>
            </DialogHeader>
            <ProcedureForm
              procedure={editingProcedureData.data}
              onSubmit={handleUpdate}
              onCancel={() => setEditingProcedure(null)}
              isLoading={updateProcedure.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
