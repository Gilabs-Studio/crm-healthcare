"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";
import { useIsMobile } from "@/hooks/use-mobile";

export function Breadcrumb() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { toggleMobileOpen } = useSidebar();

  // Skip breadcrumb on auth pages
  const NO_BREADCRUMB_ROUTES = ["/", "/login", "/forgot-password", "/reset-password"];
  if (NO_BREADCRUMB_ROUTES.includes(pathname)) {
    return null;
  }

  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  
  const breadcrumbItems = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home,
      key: "home",
    },
    ...pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      // Special handling for dashboard
      const label = segment === "dashboard" 
        ? "Dashboard"
        : segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
      
      return {
        label,
        href,
        isLast: index === pathSegments.length - 1,
        key: `segment-${index}-${segment}`,
      };
    }),
  ];

  return (
    <nav className="flex items-center gap-2 px-4 md:px-6 py-3 text-sm text-muted-foreground border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Mobile menu toggle */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 mr-1"
          onClick={(e) => {
            e.stopPropagation();
            toggleMobileOpen();
          }}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const Icon = item.icon;

        return (
          <div key={item.key || item.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground flex items-center gap-1.5">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 hover:text-foreground transition-colors",
                  Icon && "text-muted-foreground"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

