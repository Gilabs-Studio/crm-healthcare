"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { Chatbot } from "@/features/ai/components/chatbot";

function AIChatbotPageContent() {
  return (
    <div className="h-screen w-full overflow-hidden relative">
      <Chatbot />
    </div>
  );
}

export default function AIChatbotPage() {
  return (
    <AuthGuard>
      <PermissionGuard requiredPermission="VIEW_AI_CHATBOT">
        <AIChatbotPageContent />
      </PermissionGuard>
    </AuthGuard>
  );
}