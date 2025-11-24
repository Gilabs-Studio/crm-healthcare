"use client";

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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  readonly columns: readonly Column<T>[];
  readonly data: readonly T[];
  readonly isLoading?: boolean;
  readonly emptyMessage?: string;
  readonly pagination?: {
    readonly page: number;
    readonly per_page: number;
    readonly total: number;
    readonly total_pages: number;
    readonly has_next: boolean;
    readonly has_prev: boolean;
  };
  readonly onPageChange?: (page: number) => void;
  readonly onPerPageChange?: (perPage: number) => void;
  readonly itemName?: string; // e.g., "diagnosis", "procedure"
  readonly perPageOptions?: readonly number[]; // e.g., [10, 20, 50, 100]
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data found",
  pagination,
  onPageChange,
  onPerPageChange,
  itemName = "item",
  perPageOptions = [10, 20, 50, 100],
}: DataTableProps<T>) {
  const getPageNumbers = () => {
    if (!pagination) return [];

    const totalPages = pagination.total_pages;
    const currentPage = pagination.page;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
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
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(column.className)}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-muted-foreground py-8"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(column.className)}
                      >
                        {column.accessor(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pagination && (
            <div className="border-t bg-muted/30 px-6 py-4">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Rows per page selector */}
                {onPerPageChange && (
                  <div className="flex items-center gap-3 order-3 lg:order-1">
                    <Label htmlFor="rows-per-page" className="text-sm whitespace-nowrap">
                      Rows per page
                    </Label>
                    <Select
                      value={String(pagination.per_page)}
                      onValueChange={(value) => {
                        onPerPageChange?.(Number(value));
                        // Reset to page 1 when changing per page
                        onPageChange?.(1);
                      }}
                    >
                      <SelectTrigger
                        id="rows-per-page"
                        className="w-fit whitespace-nowrap h-9"
                      >
                        <SelectValue placeholder="Select rows" />
                      </SelectTrigger>
                      <SelectContent>
                        {perPageOptions.map((option) => (
                          <SelectItem key={option} value={String(option)}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Page number information */}
                <div className="flex grow justify-center lg:justify-end text-sm whitespace-nowrap text-muted-foreground order-2 lg:order-2">
                  <p className="text-sm whitespace-nowrap text-muted-foreground" aria-live="polite">
                    <span className="text-foreground font-semibold">
                      {(pagination.page - 1) * pagination.per_page + 1}-
                      {Math.min(
                        pagination.page * pagination.per_page,
                        pagination.total
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="text-foreground font-semibold">
                      {pagination.total}
                    </span>
                  </p>
                </div>

                {/* Pagination controls */}
                {pagination.total_pages > 1 && (
                  <div className="order-1 lg:order-3">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationFirst
                            onClick={() => onPageChange?.(1)}
                            disabled={!pagination.has_prev || isLoading}
                            className={cn(
                              (!pagination.has_prev || isLoading) &&
                                "pointer-events-none opacity-50 cursor-not-allowed"
                            )}
                            aria-disabled={!pagination.has_prev || isLoading}
                          />
                        </PaginationItem>

                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              onPageChange?.(Math.max(1, pagination.page - 1))
                            }
                            disabled={!pagination.has_prev || isLoading}
                            className={cn(
                              (!pagination.has_prev || isLoading) &&
                                "pointer-events-none opacity-50 cursor-not-allowed"
                            )}
                            aria-disabled={!pagination.has_prev || isLoading}
                          />
                        </PaginationItem>

                        {getPageNumbers().map((pageNum) => {
                          if (
                            pageNum === "ellipsis-start" ||
                            pageNum === "ellipsis-end"
                          ) {
                            return (
                              <PaginationItem key={`ellipsis-${pageNum}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }

                          const pageNumber = pageNum as number;
                          const isActive = pageNumber === pagination.page;

                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => onPageChange?.(pageNumber)}
                                disabled={isLoading}
                                isActive={isActive}
                                className={cn(
                                  isLoading &&
                                    "pointer-events-none opacity-50 cursor-not-allowed"
                                )}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => onPageChange?.(pagination.page + 1)}
                            disabled={!pagination.has_next || isLoading}
                            className={cn(
                              (!pagination.has_next || isLoading) &&
                                "pointer-events-none opacity-50 cursor-not-allowed"
                            )}
                            aria-disabled={!pagination.has_next || isLoading}
                          />
                        </PaginationItem>

                        <PaginationItem>
                          <PaginationLast
                            onClick={() =>
                              onPageChange?.(pagination.total_pages)
                            }
                            disabled={!pagination.has_next || isLoading}
                            className={cn(
                              (!pagination.has_next || isLoading) &&
                                "pointer-events-none opacity-50 cursor-not-allowed"
                            )}
                            aria-disabled={!pagination.has_next || isLoading}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

