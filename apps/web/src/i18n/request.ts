import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { Locale } from "@/features/dashboard/types";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  const [dashboardMessages] = await Promise.all([
    import(`@/features/dashboard/i18n/messages/${locale}.json`),
  ]);

  const messages = {
    ...dashboardMessages.default,
  };

  return {
    locale,
    messages,
  };
});


