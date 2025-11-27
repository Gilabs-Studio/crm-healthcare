"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProducts } from "../hooks/useProducts";
import type { Product } from "../types/product";

interface ProductSelectorProps {
  readonly value?: Product | null;
  readonly onChange: (product: Product | null) => void;
  readonly label?: string;
}

export function ProductSelector({ value, onChange, label = "Product" }: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState<string>("");

  const { data, isLoading } = useProducts({
    page: 1,
    per_page: 50,
    search: search || undefined,
    status: "active",
  });

  const products = useMemo(() => data?.data ?? [], [data]);

  const handleSelect = (product: Product) => {
    onChange(product);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium leading-none">{label}</div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex flex-col items-start">
              {value ? (
                <>
                  <span className="font-medium text-sm">{value.name}</span>
                  <span className="text-xs text-muted-foreground">
                    SKU: {value.sku} • {value.price_formatted}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Select product</span>
              )}
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-8"
              />
            </div>

            <div className="max-h-80 overflow-y-auto rounded-md border">
              {isLoading && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Loading products...
                </div>
              )}

              {!isLoading && products.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No products found.
                </div>
              )}

              {!isLoading &&
                products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelect(product)}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-muted/70 border-b last:border-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          SKU: {product.sku} • {product.price_formatted}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {product.category?.name && (
                          <Badge variant="outline" className="text-xs">
                            {product.category.name}
                          </Badge>
                        )}
                        <div className="text-xs text-muted-foreground">Stock: {product.stock}</div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start text-xs text-muted-foreground"
                onClick={() => onChange(null)}
              >
                Clear selection
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


