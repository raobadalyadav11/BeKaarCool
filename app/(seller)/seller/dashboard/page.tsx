"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Package, ShoppingCart, TrendingUp, Eye, Plus, BarChart3, Calendar, Star } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalViews: 0,
    pendingOrders: 0,
    rating: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch seller stats
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch("/api/seller/stats"),
        fetch("/api/seller/orders?limit=5"),
        fetch("/api/seller/products?sort=popular&limit=5"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setRecentOrders(ordersData.orders || [])
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setTopProducts(productsData.products || [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Product Views",
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">Manage your products and track your performance</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/seller/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
          <Link href="/seller/analytics">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/seller/products/new">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                <Plus className="h-6 w-6" />
                <span>Add New Product</span>
              </Button>
            </Link>
            <Link href="/seller/orders">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                <ShoppingCart className="h-6 w-6" />
                <span>Manage Orders</span>
              </Button>
            </Link>
            <Link href="/seller/analytics">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 bg-transparent">
                <TrendingUp className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Orders</span>
                  <Badge variant={stats.pendingOrders > 0 ? "destructive" : "secondary"}>{stats.pendingOrders}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm font-medium">{stats.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-sm font-medium text-green-600">+12.5%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Orders</span>
                  <span className="text-sm font-medium">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="text-sm font-medium">₹45,230</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Products Sold</span>
                  <span className="text-sm font-medium">156</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "default"
                              : order.status === "shipped"
                                ? "secondary"
                                : order.status === "processing"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No products yet</p>
                  <Link href="/seller/products/new">
                    <Button className="mt-4">Add Your First Product</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product: any) => (
                    <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {product.sold} sold • {product.views} views
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{product.price.toLocaleString()}</p>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-sm">{product.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
