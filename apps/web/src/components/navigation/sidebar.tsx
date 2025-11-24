"use client";

import { useState, useMemo, memo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { 
  Search,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useUserPermissions } from "@/features/master-data/user-management/hooks/useUserPermissions";
import { getMenuIcon } from "@/lib/menu-icons";
import { cn } from "@/lib/utils";
import type { MenuWithActions } from "@/features/master-data/user-management/types";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

// Helper function to convert API menu structure to NavItem
function buildNavItemsFromMenus(menus: MenuWithActions[]): NavItem[] {
  return menus.map((menu) => {
    const children = menu.children && menu.children.length > 0 
      ? buildNavItemsFromMenus(menu.children) 
      : undefined;
    
    return {
      id: menu.id,
      label: menu.name,
      href: menu.url,
      icon: getMenuIcon(menu.icon),
      children,
    };
  });
}

// Fallback navigation for when permissions are not loaded
const fallbackNavSections: NavSection[] = [
  {
    id: "main",
    label: "Main",
    items: [
      { 
        id: "dashboard", 
        label: "Dashboard", 
        href: "/dashboard", 
        icon: <LayoutDashboard className="h-4 w-4" /> 
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { 
        id: "users", 
        label: "Users", 
        href: "/users", 
        icon: getMenuIcon("users")
      },
    ],
  },
];

// Helper to find all parent IDs for active path
function findActiveParentIds(items: NavItem[], activePath: string): string[] {
  const parentIds: string[] = [];
  
  const traverse = (navItems: NavItem[]): boolean => {
    for (const item of navItems) {
      if (activePath === item.href || activePath.startsWith(item.href + "/")) {
        return true;
      }
      if (item.children) {
        if (traverse(item.children)) {
          parentIds.push(item.id);
          return true;
        }
      }
    }
    return false;
  };
  
  traverse(items);
  return parentIds;
}

function SidebarComponent() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const { data: permissionsData } = useUserPermissions();

  // Build navigation from permissions or use fallback
  const navSections = useMemo(() => {
    if (permissionsData?.data?.menus && permissionsData.data.menus.length > 0) {
      // Build from API permissions
      const menuItems = buildNavItemsFromMenus(permissionsData.data.menus);
      
      // Group into sections (for now, put all in one section or group by parent)
      return [
        {
          id: "main",
          label: "Main",
          items: menuItems,
        },
      ];
    }
    
    // Fallback to default navigation
    return fallbackNavSections;
  }, [permissionsData]);

  // Calculate which items should be expanded based on active path
  const activeParentIds = useMemo(() => {
    if (navSections.length > 0 && navSections[0].items.length > 0) {
      return findActiveParentIds(navSections[0].items, pathname);
    }
    return [];
  }, [navSections, pathname]);

  // User-controlled expanded items
  const [userExpandedItems, setUserExpandedItems] = useState<string[]>([]);

  // Computed expanded items = user expanded + active parents
  const expandedItems = useMemo(() => {
    const combined = new Set([...userExpandedItems, ...activeParentIds]);
    return Array.from(combined);
  }, [userExpandedItems, activeParentIds]);

  const toggleExpand = (id: string) => {
    setUserExpandedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isParentActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    return item.children?.some((child) => isActive(child.href)) ?? false;
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getAvatarUrl = (userData: typeof user) => {
    if (userData?.avatar_url) {
      return userData.avatar_url;
    }
    // Always use dicebear with email as seed
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(userData?.email || "user")}`;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            className="pl-10 h-9 bg-background border-input"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.id} className="space-y-1">
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.label}
            </div>
            {section.items.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.includes(item.id);
              const active = isParentActive(item);

              return (
                <div key={item.id}>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      )}
                      onClick={(e) => {
                        if (hasChildren) {
                          e.preventDefault();
                          toggleExpand(item.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {hasChildren && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      )}
                    </div>
                  </Link>

                  {hasChildren && (
                    <AnimatePresence>
                      {isExpanded && (
                        <div className="pl-7 pt-1 space-y-1">
                          {item.children.map((child) => {
                            const hasGrandChildren = child.children && child.children.length > 0;
                            const isChildExpanded = expandedItems.includes(child.id);
                            const childActive = isParentActive(child);

                            return (
                              <div key={child.id}>
                                <Link href={child.href}>
                                  <div
                                    className={cn(
                                      "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                                      childActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "hover:bg-sidebar-accent/50"
                                    )}
                                    onClick={(e) => {
                                      if (hasGrandChildren) {
                                        e.preventDefault();
                                        toggleExpand(child.id);
                                      }
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      {child.icon}
                                      <span>{child.label}</span>
                                    </div>
                                    {hasGrandChildren && (
                                      <ChevronDown
                                        className={cn(
                                          "h-4 w-4 transition-transform",
                                          isChildExpanded && "rotate-180"
                                        )}
                                      />
                                    )}
                                  </div>
                                </Link>

                                {hasGrandChildren && (
                                  <AnimatePresence>
                                    {isChildExpanded && (
                                      <div className="pl-7 pt-1 space-y-1">
                                        {child.children?.map((grandChild) => (
                                          <Link key={grandChild.id} href={grandChild.href}>
                                            <div
                                              className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                                isActive(grandChild.href)
                                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                                  : "hover:bg-sidebar-accent/50"
                                              )}
                                            >
                                              {grandChild.icon}
                                              <span>{grandChild.label}</span>
                                            </div>
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </AnimatePresence>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Account Section - Modern Footer Design */}
      {user && (
        <div className="border-t border-sidebar-border bg-sidebar-accent/30 backdrop-blur-sm">
          {/* User Profile Card */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12 ring-2 ring-sidebar-accent ring-offset-2 ring-offset-sidebar">
                <AvatarImage src={getAvatarUrl(user)} alt={user.name} />
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user.name}
                </div>
                <div className="text-xs text-muted-foreground capitalize truncate">
                  {user.role}
                </div>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex-1 justify-center gap-2 h-9 text-sm text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
              <ThemeToggleButton
                variant="circle"
                start="bottom-left"
                className="size-9 bg-sidebar-accent hover:bg-sidebar-accent/80 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// Memoize Sidebar to prevent unnecessary rerenders on route changes
export const Sidebar = memo(SidebarComponent);
