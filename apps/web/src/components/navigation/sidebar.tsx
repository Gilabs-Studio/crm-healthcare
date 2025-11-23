"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { 
  Home, 
  Star, 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  FileCheck, 
  FolderKanban, 
  FileText, 
  HelpCircle, 
  Settings,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
  { 
    id: "saved",
    label: "Saved", 
    href: "/saved",
    icon: <Star className="h-4 w-4" />,
    badge: 24
  },
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard/overview",
    icon: <LayoutDashboard className="h-4 w-4" />,
    children: [
      { id: "trends", label: "Trends", href: "/dashboard/trends", icon: <TrendingUp className="h-4 w-4" /> },
      { id: "analytics", label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 className="h-4 w-4" /> },
      { id: "historical", label: "Historical", href: "/dashboard/historical", icon: <FileCheck className="h-4 w-4" /> },
    ],
  },
  { id: "projects", label: "Projects", href: "/projects", icon: <FolderKanban className="h-4 w-4" /> },
  { id: "documents", label: "Documents", href: "/documents", icon: <FileText className="h-4 w-4" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["dashboard"]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
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

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border border-sidebar-border">
        <h1 className="font-bold text-lg">Logo</h1>
      </div>

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
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
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
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-sidebar-border text-xs">
                        {item.badge}
                      </span>
                    )}
                    {hasChildren && (
                      <svg
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </Link>

              {hasChildren && (
                <AnimatePresence>
                  {isExpanded && (
                    <div className="pl-7 pt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link key={child.id} href={child.href}>
                          <div
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                              isActive(child.href)
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "hover:bg-sidebar-accent/50"
                            )}
                          >
                            {child.icon}
                            <span>{child.label}</span>
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
      </nav>

      {/* Bottom Section */}
      <div className="border-t border border-sidebar-border p-4 space-y-1">
        <Link href="/support">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-sidebar-accent/50 transition-colors">
            <HelpCircle className="h-4 w-4" />
            <span>Support</span>
          </div>
        </Link>
        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-sidebar-accent/50 transition-colors">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
