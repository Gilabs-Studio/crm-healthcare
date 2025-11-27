"use client";

import { motion } from "framer-motion";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { ReportGenerator } from "@/features/reports/components/report-generator";

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

function ReportsPageContent() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-8"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground mt-1">
              Generate and view system reports
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ReportGenerator />
      </motion.div>
    </motion.div>
  );
}

export default function ReportsPage() {
  return (
    <AuthGuard>
      <ReportsPageContent />
    </AuthGuard>
  );
}

"use client";

import ReportsPage from "@/app/reports/page";

export default ReportsPage;


