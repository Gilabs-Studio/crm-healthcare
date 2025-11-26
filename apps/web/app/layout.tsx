import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppLayout } from "@/components/layouts/app-layout";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const headingFont = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CRM Healthcare Platform",
  description: "CRM Healthcare/Pharmaceutical Platform",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${headingFont.variable} antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ReactQueryProvider>
              <AppLayout>{children}</AppLayout>
              <Toaster position="top-right" richColors />
            </ReactQueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
