import {
  LayoutDashboard,
  ShoppingCart,
  Anchor,
  Warehouse,
  Receipt,
  Package,
  TrendingUp,
  FileBarChart,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Sales",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    title: "Purchases",
    href: "/purchases",
    icon: Anchor,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Warehouse,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    title: "Packing",
    href: "/packing",
    icon: Package,
  },
  {
    title: "Profit & Loss",
    href: "/profit-loss",
    icon: TrendingUp,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileBarChart,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
