"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { ProductCategoryList } from "@/features/sales-crm/product-management/components/product-category-list";

function ProductCategoriesPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <ProductCategoryList />
      </div>
    </DashboardLayout>
  );
}

export default function ProductCategoriesPage() {
  return (
    <AuthGuard>
      <ProductCategoriesPageContent />
    </AuthGuard>
  );
}



