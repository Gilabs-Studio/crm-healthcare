"use client";

import { TaskList } from "./task-list";
import { TaskBoard } from "./task-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export function TaskManagement() {
  const t = useTranslations("taskManagement.page");

  return (
    <div className="space-y-6">
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


