"use client";

import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { VisitStatistics } from "@/features/dashboard/components/visit-statistics";
import { ActivityTrends } from "@/features/dashboard/components/activity-trends";
import { PipelineSummary } from "@/features/dashboard/components/pipeline-summary";
import { TopAccounts } from "@/features/dashboard/components/top-accounts";
import { TopSalesRep } from "@/features/dashboard/components/top-sales-rep";
import { RecentActivities } from "@/features/dashboard/components/recent-activities";

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
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

function DashboardContent() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-8"
      >
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.name}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <DashboardOverview />
        </motion.div>

        <motion.div variants={itemVariants}>
          <VisitStatistics />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ActivityTrends />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PipelineSummary />
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
          <TopAccounts />
          <TopSalesRep />
        </motion.div>

        <motion.div variants={itemVariants}>
          <RecentActivities />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
