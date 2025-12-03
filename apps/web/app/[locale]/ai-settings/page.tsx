"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { AISettings } from "@/features/ai/components/ai-settings";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

function AISettingsPageContent() {
  const t = useTranslations("aiSettings");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("description")}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <AISettings />
      </motion.div>
    </motion.div>
  );
}

export default function AISettingsPage() {
  return (
    <AuthGuard>
      <PermissionGuard requiredPermission="VIEW_AI_SETTINGS">
        <AISettingsPageContent />
      </PermissionGuard>
    </AuthGuard>
  );
}

