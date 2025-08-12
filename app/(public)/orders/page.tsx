"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Search, Eye, Download, RefreshCw, Truck, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"

interface Order {
  _id: string
  orderNumber: string
  items: Array<{
    product: {
      _id: string
      name: string
      images: string[]
    }
    quantity: number
    price: number
    size: string
    color: string
  }>
  totalAmount: number
  status: string
  paymentStatus: string
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    if (session) {
      fetchOrders()
    }
  }, [session, pagination.page, statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/orders?${params}`)
      const data = await response.json()

      setOrders(data.orders || [])
      setPagination(data.pagination || pagination)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <RefreshCw className="h-4 w-4" />
      case "confirmed":
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
      case "refunded":
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.product.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your orders</h1>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({orders.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.status)).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({orders.filter((o) => o.status === "delivered").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                <Link href="/products">
                  <Button>Start Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                            <Image
                              src={item.product?.images?.[0] || "/placeholder.svg"}
                              alt={item.product?.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                            <p className="text-sm text-gray-600">
                              Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Total: <span className="font-medium text-gray-900">₹{order.totalAmount}</span>
                          </p>
                          {order.trackingNumber && (
                            <p className="text-sm text-gray-600">
                              Tracking: <span className="font-medium">{order.trackingNumber}</span>
                            </p>
                          )}
                          {order.estimatedDelivery && (
                            <p className="text-sm text-gray-600">
                              Estimated Delivery: {formatDate(order.estimatedDelivery)}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/orders/${order._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                          {order.trackingNumber && (
                            <Button variant="outline" size="sm">
                              <Truck className="mr-2 h-4 w-4" />
                              Track Order
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {filteredOrders
            .filter((order) => !["delivered", "cancelled", "refunded"].includes(order.status))
            .map((order) => (
              <Card key={order._id} className="hover:shadow-md transition-shadow">
                {/* Same order card content as above */}
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredOrders
            .filter((order) => order.status === "delivered")
            .map((order) => (
              <Card key={order._id} className="hover:shadow-md transition-shadow">
                {/* Same order card content as above */}
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={pagination.page === page ? "default" : "outline"}
              onClick={() => setPagination((prev) => ({ ...prev, page }))}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
