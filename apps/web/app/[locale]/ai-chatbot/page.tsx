"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { PermissionGuard } from "@/features/auth/components/permission-guard";
import { Chatbot } from "@/features/ai/components/chatbot";

function AIChatbotPageContent() {
  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem-1rem)] -mx-4 -mb-4">
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
