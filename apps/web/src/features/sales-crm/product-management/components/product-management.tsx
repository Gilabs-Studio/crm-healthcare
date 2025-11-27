"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductList } from "./product-list";
import { ProductCategoryList } from "./product-category-list";
import { useTranslations } from "next-intl";

export function ProductManagement() {
  const t = useTranslations("productManagement.tabs");

  return (
    <div className="space-y-4">
      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">{t("products")}</TabsTrigger>
          <TabsTrigger value="categories">{t("categories")}</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4 space-y-4">
          <ProductList />
        </TabsContent>

        <TabsContent value="categories" className="mt-4 space-y-4">
          <ProductCategoryList />
        </TabsContent>
      </Tabs>
    </div>
  );
}


