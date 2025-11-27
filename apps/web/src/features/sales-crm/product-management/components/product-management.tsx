 "use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductList } from "./product-list";
import { ProductCategoryList } from "./product-category-list";

export function ProductManagement() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Product Categories</TabsTrigger>
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


