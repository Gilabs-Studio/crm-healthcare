"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard,
  Users,
  UserCircle,
  Calendar,
  FileText,
  Pill,
  Package,
  ShoppingCart,
  Receipt,
  Database,
  BarChart3,
  Settings,
  Search,
  LogOut,
  ChevronDown,
  Activity,
  Stethoscope,
  ClipboardList,
  Warehouse,
  Truck,
  FolderTree,
  MapPin,
  Building2,
  Ruler,
  Store,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { cn } from "@/lib/utils";

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

const navSections: NavSection[] = [
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
    id: "healthcare",
    label: "Healthcare",
    items: [
      { 
        id: "patients", 
        label: "Patients", 
        href: "/patients", 
        icon: <UserCircle className="h-4 w-4" /> 
      },
      { 
        id: "doctors", 
        label: "Doctors", 
        href: "/doctors", 
        icon: <Stethoscope className="h-4 w-4" /> 
      },
      { 
        id: "appointments", 
        label: "Appointments", 
        href: "/appointments", 
        icon: <Calendar className="h-4 w-4" /> 
      },
      { 
        id: "medical-records", 
        label: "Medical Records", 
        href: "/medical-records", 
        icon: <FileText className="h-4 w-4" /> 
      },
      { 
        id: "prescriptions", 
        label: "Prescriptions", 
        href: "/prescriptions", 
        icon: <Pill className="h-4 w-4" /> 
      },
    ],
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    items: [
      { 
        id: "medications", 
        label: "Medications", 
        href: "/medications", 
        icon: <Package className="h-4 w-4" /> 
      },
      {
        id: "inventory",
        label: "Inventory",
        href: "/inventory",
        icon: <Warehouse className="h-4 w-4" />,
        children: [
          { id: "inventory-stock", label: "Stock", href: "/inventory/stock", icon: <Package className="h-4 w-4" /> },
          { id: "inventory-movements", label: "Movements", href: "/inventory/movements", icon: <Activity className="h-4 w-4" /> },
          { id: "inventory-adjustments", label: "Adjustments", href: "/inventory/adjustments", icon: <ClipboardList className="h-4 w-4" /> },
          { id: "inventory-transfers", label: "Transfers", href: "/inventory/transfers", icon: <Truck className="h-4 w-4" /> },
          { id: "inventory-alerts", label: "Alerts", href: "/inventory/alerts", icon: <Activity className="h-4 w-4" /> },
        ],
      },
      { 
        id: "purchases", 
        label: "Purchases", 
        href: "/purchases", 
        icon: <ShoppingCart className="h-4 w-4" /> 
      },
    ],
  },
  {
    id: "transactions",
    label: "Transactions",
    items: [
      { 
        id: "transactions", 
        label: "Transactions", 
        href: "/transactions", 
        icon: <Receipt className="h-4 w-4" /> 
      },
    ],
  },
  {
    id: "master-data",
    label: "Master Data",
    items: [
      {
        id: "master-data",
        label: "Master Data",
        href: "/master-data",
        icon: <Database className="h-4 w-4" />,
        children: [
          { id: "master-diagnosis", label: "Diagnosis", href: "/master-data/diagnosis", icon: <FileText className="h-4 w-4" /> },
          { id: "master-procedures", label: "Procedures", href: "/master-data/procedures", icon: <Activity className="h-4 w-4" /> },
          { id: "master-insurance", label: "Insurance Providers", href: "/master-data/insurance-providers", icon: <Building2 className="h-4 w-4" /> },
          { id: "master-locations", label: "Locations", href: "/master-data/locations", icon: <MapPin className="h-4 w-4" /> },
          { id: "master-categories", label: "Categories", href: "/master-data/categories", icon: <FolderTree className="h-4 w-4" /> },
          { id: "master-units", label: "Units", href: "/master-data/units", icon: <Ruler className="h-4 w-4" /> },
          { id: "master-suppliers", label: "Suppliers", href: "/master-data/suppliers", icon: <Store className="h-4 w-4" /> },
        ],
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
        icon: <Users className="h-4 w-4" /> 
      },
      { 
        id: "reports", 
        label: "Reports", 
        href: "/reports", 
        icon: <BarChart3 className="h-4 w-4" /> 
      },
      { 
        id: "settings", 
        label: "Settings", 
        href: "/settings", 
        icon: <Settings className="h-4 w-4" /> 
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState<string[]>(["inventory", "master-data"]);

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

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
          </div>
        ))}
      </nav>

      {/* Account Section */}
      <div className="border-t border border-sidebar-border">
        {/* User Account */}
        {user && (
          <div className="p-4 border-b border border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </div>
                <div className="text-xs text-muted-foreground capitalize truncate">
                  {user.role}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex-1 justify-start gap-2 h-9 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
          <ThemeToggleButton
            variant="circle"
            start="bottom-left"
            className="size-9 bg-sidebar-accent hover:bg-sidebar-accent/80"
          />
        </div>
      </div>
    </aside>
  );
}
