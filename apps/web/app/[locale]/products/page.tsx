"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { ProductManagement } from "@/features/sales-crm/product-management/components/product-management";

function ProductsPageContent() {
  return (
      <div className="container mx-auto py-6 px-4">
        <ProductManagement />
      </div>
  );
}

export default function ProductsPage() {
  return (
    <AuthGuard>
      <ProductsPageContent />
    </AuthGuard>
  );
}



