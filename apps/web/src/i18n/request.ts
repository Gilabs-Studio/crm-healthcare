import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { Locale } from "@/features/dashboard/types";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  const [
    dashboardMessages,
    userManagementMessages,
    reportsMessages,
    accountManagementMessages,
    pipelineManagementMessages,
    productManagementMessages,
    taskManagementMessages,
    visitReportMessages,
    aiMessages,
    profileMessages,
    notificationMessages,
  ] = await Promise.all([
    import(`@/features/dashboard/i18n/messages/${locale}.json`),
    import(`@/features/master-data/user-management/i18n/messages/${locale}.json`),
    import(`@/features/reports/i18n/messages/${locale}.json`),
    import(`@/features/sales-crm/account-management/i18n/messages/${locale}.json`),
    import(`@/features/sales-crm/pipeline-management/i18n/messages/${locale}.json`),
    import(`@/features/sales-crm/product-management/i18n/messages/${locale}.json`),
    import(`@/features/sales-crm/task-management/i18n/messages/${locale}.json`),
    import(`@/features/sales-crm/visit-report/i18n/messages/${locale}.json`),
    import(`@/features/ai/i18n/messages/${locale}.json`),
    import(`@/features/profile/i18n/messages/${locale}.json`),
    import(`@/features/notifications/i18n/messages/${locale}.json`),
  ]);

  const messages = {
    ...dashboardMessages.default,
    ...userManagementMessages.default,
    ...reportsMessages.default,
    ...accountManagementMessages.default,
    ...pipelineManagementMessages.default,
    ...productManagementMessages.default,
    ...taskManagementMessages.default,
    ...visitReportMessages.default,
    ...aiMessages.default,
    ...profileMessages.default,
    ...notificationMessages.default,
  };

  return {
    locale,
    messages,
  };
});


