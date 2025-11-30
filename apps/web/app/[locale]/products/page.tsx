"use client";

import { useTranslations } from "next-intl";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { ProductManagement } from "@/features/sales-crm/product-management/components/product-management";

function ProductsPageContent() {
  const t = useTranslations("productManagement.page");

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>
        <ProductManagement />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <AuthGuard>
      <PermissionGuard requiredPermission="VIEW_PRODUCTS">
        <ProductsPageContent />
      </PermissionGuard>
    </AuthGuard>
  );
}



