"use client";

import { ClipboardList, FolderTree } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DiagnosisList } from "./diagnosis-list";
import { CategoryList } from "./category-list";
import { useCategoryPermission } from "../hooks/useCategoryPermission";

export function DiagnosisManagement() {
  const { hasCategoryPermission } = useCategoryPermission("diagnosis");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Diagnosis Master Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage ICD-10 diagnosis codes and their details.
        </p>
      </div>

      <Tabs defaultValue="diagnosis" className="w-full">
        <TabsList>
          <TabsTrigger value="diagnosis" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Diagnosis
          </TabsTrigger>
          {hasCategoryPermission && (
            <TabsTrigger value="categories" className="gap-2">
              <FolderTree className="h-4 w-4" />
              Categories
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="diagnosis" className="mt-6">
          <DiagnosisList />
        </TabsContent>

        {hasCategoryPermission && (
          <TabsContent value="categories" className="mt-6">
            <CategoryList type="diagnosis" />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

