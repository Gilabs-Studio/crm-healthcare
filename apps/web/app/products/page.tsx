"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { ProductManagement } from "@/features/sales-crm/product-management/components/product-management";

function ProductsPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <ProductManagement />
      </div>
    </DashboardLayout>
  );
}

export default function ProductsPage() {
  return (
    <AuthGuard>
      <ProductsPageContent />
    </AuthGuard>
  );
}


