"use client";

import { Activity, FolderTree } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProcedureList } from "./procedure-list";
import { CategoryList } from "./category-list";
import { useCategoryPermission } from "../hooks/useCategoryPermission";

export function ProcedureManagement() {
  const { hasCategoryPermission } = useCategoryPermission("procedure");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Procedure Master Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage medical procedure codes and their details.
        </p>
      </div>

      <Tabs defaultValue="procedures" className="w-full">
        <TabsList>
          <TabsTrigger value="procedures" className="gap-2">
            <Activity className="h-4 w-4" />
            Procedures
          </TabsTrigger>
          {hasCategoryPermission && (
            <TabsTrigger value="categories" className="gap-2">
              <FolderTree className="h-4 w-4" />
              Categories
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="procedures" className="mt-6">
          <ProcedureList />
        </TabsContent>

        {hasCategoryPermission && (
          <TabsContent value="categories" className="mt-6">
            <CategoryList type="procedure" />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

