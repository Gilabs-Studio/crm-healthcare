"use client";

import { Building2, Tag, UserCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AccountList } from "./account-list";
import { CategoryList } from "./category-list";
import { ContactRoleList } from "./contact-role-list";
import { useHasPermission } from "@/features/master-data/user-management/hooks/useHasPermission";
import { useTranslations } from "next-intl";

export function AccountManagement() {
  const hasCategoryPermission = useHasPermission("CATEGORY");
  const hasRolePermission = useHasPermission("ROLE");
  const tPage = useTranslations("accountManagement.page");
  const tTabs = useTranslations("accountManagement.tabs");

  // Determine default tab - use first available tab
  const defaultTab = "accounts";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{tPage("title")}</h1>
        <p className="text-muted-foreground mt-2">
          {tPage("description")}
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="accounts" className="gap-2">
            <Building2 className="h-4 w-4" />
            {tTabs("accounts")}
          </TabsTrigger>
          {hasCategoryPermission && (
            <TabsTrigger value="categories" className="gap-2">
              <Tag className="h-4 w-4" />
              {tTabs("categories")}
            </TabsTrigger>
          )}
          {hasRolePermission && (
            <TabsTrigger value="contact-roles" className="gap-2">
              <UserCircle className="h-4 w-4" />
              {tTabs("contactRoles")}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="accounts" className="mt-6">
          <AccountList />
        </TabsContent>

        {hasCategoryPermission && (
          <TabsContent value="categories" className="mt-6">
            <CategoryList />
          </TabsContent>
        )}

        {hasRolePermission && (
          <TabsContent value="contact-roles" className="mt-6">
            <ContactRoleList />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}


