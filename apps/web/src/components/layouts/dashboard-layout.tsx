"use client";

import React, { memo, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";

import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useUserPermissions } from "@/features/master-data/user-management/hooks/useUserPermissions";
import type { MenuWithActions } from "@/features/master-data/user-management/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton as ThemeToggle } from "@/components/ui/theme-toggle";
import { getMenuIcon } from "@/lib/menu-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  group: string;
}

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
}

const Header = memo(function Header({
  userName,
  avatarUrl,
  fallbackAvatarUrl,
}: {
  userName: string;
  avatarUrl?: string;
  fallbackAvatarUrl: string;
}) {
  const [currentSrc, setCurrentSrc] = React.useState<string | undefined>(
    avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : fallbackAvatarUrl
  );

  // Sync local image src when avatar url from store changes (e.g. after rehydration/refresh)
  React.useEffect(() => {
    if (avatarUrl && avatarUrl.trim() !== "") {
      setCurrentSrc(avatarUrl);
    } else {
      setCurrentSrc(fallbackAvatarUrl);
    }
  }, [avatarUrl, fallbackAvatarUrl]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="ml-2 flex flex-col">
        <span className="text-sm font-semibold">Healthcare CRM</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle className="size-8" />
        <Button
          variant="ghost"
          className="flex items-center gap-2 rounded-full p-1 hover:bg-muted transition-colors"
        >
          <Avatar>
            <AvatarImage
              src={currentSrc}
              alt={userName}
              onError={() => {
                if (currentSrc !== fallbackAvatarUrl) {
                  setCurrentSrc(fallbackAvatarUrl);
                }
              }}
            />
            {avatarUrl && (
              <AvatarFallback className="bg-primary/10 text-primary font-medium" />
            )}
          </Avatar>
        </Button>
      </div>
    </header>
  );
});

const AppSidebar = memo(function AppSidebar({
  items,
}: {
  items: NavigationItem[];
}) {
  const pathname = usePathname();
  const { state } = useSidebar();

  const grouped = useMemo(() => {
    const groups: Record<string, NavigationItem[]> = {};
    for (const item of items) {
      if (!groups[item.group]) {
        groups[item.group] = [];
      }
      groups[item.group].push(item);
    }
    return groups;
  }, [items]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Healthcare CRM">
              <Link href="/dashboard">
                {state === "collapsed" ? (
                  <div className="flex items-center justify-center w-full">
                    <span className="text-primary text-xl font-bold">HC</span>
                  </div>
                ) : (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-primary text-base">
                      Healthcare
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      CRM Platform
                    </span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {Object.entries(grouped).map(([group, groupItems]) => (
          <SidebarGroup key={group}>
            {group !== "Main" && (
              <SidebarGroupLabel>{group}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {groupItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.name}
                      >
                        <Link href={item.href}>
                          {item.icon}
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <div className="mt-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="pb-6">
                  <SidebarMenuButton asChild tooltip="Help Center">
                    <Link href="/help">
                      <HelpCircle className="h-4 w-4" />
                      {state !== "collapsed" && <span>Help Center</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
});

const AutoCollapseSidebar = memo(function AutoCollapseSidebar() {
  const isMobile = useIsMobile();
  const { setOpen } = useSidebar();

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile, setOpen]);

  return null;
});

export const DashboardLayout = memo(function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const { data: permissionsData, error } = useUserPermissions();

  const userName = user?.name ?? "User";
  const primaryAvatarUrl =
    user?.avatar_url && user.avatar_url.trim() !== ""
      ? user.avatar_url
      : undefined;
  const fallbackAvatarUrl = "/avatar-placeholder.svg";

  const navigationItems: NavigationItem[] = useMemo(() => {
    const menus = permissionsData?.data?.menus;

    const fallback: NavigationItem[] = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: getMenuIcon("layout-dashboard"),
        group: "Main",
      },
    ];

    if (!menus || menus.length === 0) {
      return fallback;
    }

    const items: NavigationItem[] = [];

    const walkChildren = (children: MenuWithActions[], group: string) => {
      children.forEach((child) => {
        if (child.url) {
          items.push({
            name: child.name,
            href: child.url,
            icon: getMenuIcon(child.icon),
            group,
          });
        }
        if (child.children && child.children.length > 0) {
          walkChildren(child.children, group);
        }
      });
    };

    menus.forEach((menu) => {
      // Special-case: dashboard root without children
      if (menu.url == "/dashboard") {
        items.push({
          name: menu.name,
          href: menu.url,
          icon: getMenuIcon(menu.icon),
          group: "Main",
        });
        return;
      }

      if (menu.children && menu.children.length > 0) {
        // Use root menu name as group label (e.g., CRM, Analytics, System)
        walkChildren(menu.children, menu.name);
      } else if (menu.url != "") {
        // Orphan root item, group by its own name
        items.push({
          name: menu.name,
          href: menu.url,
          icon: getMenuIcon(menu.icon),
          group: menu.name,
        });
      }
    });

    if (items.length === 0) {
      return fallback;
    }

    return items;
  }, [permissionsData]);

  return (
    <SidebarProvider>
      <AutoCollapseSidebar />
      <div className="flex min-h-screen w-full bg-sidebar">
        <AppSidebar items={navigationItems} />
        <SidebarInset className="overflow-x-hidden">
          <Header
            userName={userName}
            avatarUrl={primaryAvatarUrl}
            fallbackAvatarUrl={fallbackAvatarUrl}
          />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {error && (
              <div className="mb-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                Failed to load menu permissions. Showing minimal navigation.
              </div>
            )}
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
});

