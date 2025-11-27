"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { VisitStatistics } from "@/features/dashboard/components/visit-statistics";
import { ActivityTrends } from "@/features/dashboard/components/activity-trends";
import { PipelineSummary } from "@/features/dashboard/components/pipeline-summary";
import { TopAccounts } from "@/features/dashboard/components/top-accounts";
import { TopSalesRep } from "@/features/dashboard/components/top-sales-rep";
import { RecentActivities } from "@/features/dashboard/components/recent-activities";
import { LeadsBySource } from "@/features/dashboard/components/leads-by-source";
import { UpcomingTasks } from "@/features/dashboard/components/upcoming-tasks";
import { LeadsTable } from "@/features/dashboard/components/leads-table";

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

function DashboardContent() {
  const t = useTranslations("dashboard");
  const { user } = useAuthStore();

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
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("welcomeBack", { name: user?.name ?? "" })}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardOverview />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
        <LeadsBySource />
        <UpcomingTasks />
        <PipelineSummary />
      </motion.div>

      <motion.div variants={itemVariants}>
        <LeadsTable />
      </motion.div>

      <motion.div variants={itemVariants}>
        <VisitStatistics />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ActivityTrends />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
        <TopAccounts />
        <TopSalesRep />
      </motion.div>

      <motion.div variants={itemVariants}>
        <RecentActivities />
      </motion.div>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}


