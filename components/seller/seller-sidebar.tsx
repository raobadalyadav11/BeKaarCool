"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  Store,
  Palette,
  DollarSign,
  MessageSquare,
  FileText,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Dashboard",
    href: "/seller/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/seller/products",
    icon: Package,
    badge: "12",
  },
  {
    name: "Orders",
    href: "/seller/orders",
    icon: ShoppingCart,
    badge: "3",
  },
  {
    name: "Analytics",
    href: "/seller/analytics",
    icon: BarChart3,
  },
  {
    name: "Customers",
    href: "/seller/customers",
    icon: Users,
  },
  {
    name: "Designs",
    href: "/seller/designs",
    icon: Palette,
  },
  {
    name: "Revenue",
    href: "/seller/revenue",
    icon: DollarSign,
  },
  {
    name: "Messages",
    href: "/seller/messages",
    icon: MessageSquare,
    badge: "2",
  },
  {
    name: "Reports",
    href: "/seller/reports",
    icon: FileText,
  },
  {
    name: "Marketing",
    href: "/seller/marketing",
    icon: TrendingUp,
  },
  {
    name: "Settings",
    href: "/seller/settings",
    icon: Settings,
  },
]

export function SellerSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Seller Panel</h2>
              <p className="text-xs text-gray-600">Manage your store</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed ? "px-2" : "px-3",
                  isActive && "bg-blue-600 text-white hover:bg-blue-700",
                )}
              >
                <item.icon className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && (
                      <Badge variant={isActive ? "secondary" : "outline"} className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        {!collapsed && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Boost Sales</span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Upgrade to premium to unlock advanced analytics and marketing tools.
            </p>
            <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
