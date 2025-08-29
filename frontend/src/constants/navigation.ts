import type React from "react"
import { BarChart, Box, Package, Settings, ShoppingCart, Users } from "lucide-react"

export type SubMenuItem = {
  title: string
  href: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export type MenuItem = {
  title: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  submenu?: SubMenuItem[]
}

export const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart,
  },
  {
    title: "Products & Services",
    href: "/dashboard/products",
    icon: Package,
    submenu: [
      {
        title: "Products",
        href: "/dashboard/products",
      },
      {
        title: "Services",
        href: "/dashboard/services",
      },
      {
        title: "Categories",
        href: "/dashboard/categories",
      },
    ],
  },
  {
    title: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Box,
    submenu: [
      {
        title: "Stock",
        href: "/dashboard/inventory/stock",
      },
      {
        title: "Suppliers",
        href: "/dashboard/inventory/suppliers",
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]
