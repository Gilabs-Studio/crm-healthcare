"use client";

import { TaskList } from "./task-list";
import { TaskBoard } from "./task-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export function TaskManagement() {
  const t = useTranslations("taskManagement.page");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">{t("viewBoard")}</TabsTrigger>
          <TabsTrigger value="list">{t("viewList")}</TabsTrigger>
        </TabsList>
        <TabsContent value="board" className="mt-4">
          <TaskBoard />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <TaskList />
        </TabsContent>
      </Tabs>
    </div>
  );
}


