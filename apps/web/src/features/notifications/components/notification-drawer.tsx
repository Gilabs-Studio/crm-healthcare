"use client";

import { Drawer } from "@/components/ui/drawer";
import { NotificationList } from "./notification-list";
import { useTranslations } from "next-intl";

interface NotificationDrawerProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
  const t = useTranslations("notifications.page");

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      description={t("description")}
      side="right"
      defaultWidth={480}
      minWidth={320}
      maxWidth={800}
    >
      <NotificationList />
    </Drawer>
  );
}

