"use client";

import React, { memo, useMemo, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Bell, HelpCircle, Search } from "lucide-react";

import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useUserPermissions } from "@/features/master-data/user-management/hooks/useUserPermissions";
import type { MenuWithActions } from "@/features/master-data/user-management/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ThemeToggleButton as ThemeToggle } from "@/components/ui/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getMenuIcon } from "@/lib/menu-icons";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useDashboardCommandPalette } from "@/features/layout/hooks/useDashboardCommandPalette";
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
  const locale = useLocale();
  const tSidebar = useTranslations("sidebar");
  const logout = useLogout();
  const pathname = usePathname();

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
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1 size-8" />
      <Separator orientation="vertical" />

      <div className="lg:flex-1">
        {/* Desktop search input */}
        <div className="relative hidden max-w-sm flex-1 lg:block">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search..."
            className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input h-9 w-full cursor-pointer rounded-md border bg-background/60 px-3 py-1 pr-4 pl-10 text-sm shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <div className="bg-muted text-muted-foreground absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-medium sm:flex">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>

        {/* Mobile search button */}
        <div className="block lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            type="button"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Open search</span>
          </Button>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8"
          type="button"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span className="bg-destructive absolute end-1 top-1 block size-2 rounded-full" />
          <span className="sr-only">Open notifications</span>
        </Button>

        {/* Theme toggle – now driven by internal minimal UI */}
        <ThemeToggle />

        {/* Language toggle (replaces settings) */}
        <Link
          href={pathname || "/dashboard"}
          locale={locale === "en" ? "id" : "en"}
          scroll={false}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-11 rounded-2xl bg-background/80 text-xs font-semibold shadow-sm hover:bg-accent/60"
            type="button"
          >
            {locale === "en" ? "ID" : "EN"}
          </Button>
        </Link>

        {/* Thin separator between lang toggle and avatar */}
        <div className="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-1/2 data-[orientation=vertical]:w-px mx-2 h-4 w-px" />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 items-center justify-center rounded-full p-0 hover:bg-muted transition-colors"
            >
              <Avatar className="h-8 w-8">
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
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="end">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              <div className="text-foreground text-sm font-medium">
                {userName}
              </div>
            </div>
            <Separator className="my-1" />
            <div className="flex flex-col gap-1">
              <Link
                href="/settings"
                locale={locale}
                className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                {tSidebar("settings")}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
              >
                Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>
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
  const commandPalette = useDashboardCommandPalette({
    menus: permissionsData?.data?.menus,
  });

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

      <Dialog open={commandPalette.isOpen} onOpenChange={commandPalette.toggle}>
        <DialogContent
          showCloseButton={false}
          className="p-0 shadow-2xl sm:max-w-xl"
        >
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No menu found.</CommandEmpty>
              {Object.entries(
                commandPalette.items.reduce<Record<string, typeof commandPalette.items>>(
                  (groups, item) => {
                    const group = item.group || "Menus";
                    if (!groups[group]) {
                      groups[group] = [];
                    }
                    groups[group].push(item);
                    return groups;
                  },
                  {}
                )
              ).map(([group, items]) => (
                <CommandGroup key={group} heading={group}>
                  {items.map((item) => (
                    <CommandItem
                      key={`${group}-${item.id}-${item.href}`}
                      value={item.name}
                      onSelect={() => commandPalette.onSelectItem(item.href)}
                    >
                      {getMenuIcon(item.icon)}
                      <span className="flex-1 truncate">{item.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {item.href}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
});

