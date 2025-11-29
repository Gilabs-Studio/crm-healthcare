"use client";

import { useTranslations } from "next-intl";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { Chatbot } from "@/features/ai/components/chatbot";

function AIChatbotPageContent() {
  const t = useTranslations("aiChatbot");

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>
        <Chatbot />
      </div>
    </div>
  );
}

export default function AIChatbotPage() {
  return (
    <AuthGuard>
      <AIChatbotPageContent />
    </AuthGuard>
  );
}
