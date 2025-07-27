"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Download, ArrowLeft, Phone, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils"

interface OrderDetails {
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
    customization?: {
      text?: string
      design?: string
    }
  }>
  shippingAddress: {
    name: string
    phone: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  paymentStatus: string
  paymentId?: string
  total: number
  subtotal: number
  shipping: number
  tax: number
  discount: number
  couponCode?: string
  status: string
  trackingNumber?: string
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailsPage({ params }: OrderPageProps) {
  const { data: session } = useSession()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setOrderId(id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (session && orderId) {
      fetchOrderDetails()
    }
  }, [session, orderId])

  const fetchOrderDetails = async () => {
    if (!orderId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`)

      if (!response.ok) {
        throw new Error("Order not found")
      }

      const data = await response.json()
      setOrder(data)
    } catch (error: any) {
      setError(error.message || "Failed to fetch order details")
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

  const getOrderTimeline = () => {
    if (!order) return []

    const timeline = [
      {
        status: "Order Placed",
        date: order.createdAt,
        completed: true,
        icon: <Package className="h-4 w-4" />,
      },
      {
        status: "Order Confirmed",
        date: order.status !== "pending" ? order.updatedAt : null,
        completed: order.status !== "pending",
        icon: <CheckCircle className="h-4 w-4" />,
      },
      {
        status: "Processing",
        date: ["processing", "shipped", "delivered"].includes(order.status) ? order.updatedAt : null,
        completed: ["processing", "shipped", "delivered"].includes(order.status),
        icon: <Clock className="h-4 w-4" />,
      },
      {
        status: "Shipped",
        date: ["shipped", "delivered"].includes(order.status) ? order.updatedAt : null,
        completed: ["shipped", "delivered"].includes(order.status),
        icon: <Truck className="h-4 w-4" />,
      },
      {
        status: "Delivered",
        date: order.deliveredAt,
        completed: order.status === "delivered",
        icon: <CheckCircle className="h-4 w-4" />,
      },
    ]

    return timeline
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Please log in to view order details.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || "Order not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/orders">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/orders">
          <Button variant="outline" className="mb-4 bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={getStatusColor(order.status)}>
              <span className="capitalize">{order.status}</span>
            </Badge>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getOrderTimeline().map((step, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${step.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                    >
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-500"}`}>
                        {step.status}
                      </p>
                      {step.date && <p className="text-sm text-gray-500">{formatDate(step.date)}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {order.trackingNumber && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">Tracking Number</p>
                      <p className="text-blue-700">{order.trackingNumber}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Truck className="mr-2 h-4 w-4" />
                      Track Package
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden bg-gray-100">
                      <Image
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                        <p className="text-sm text-gray-600">Color: {item.color}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        {item.customization && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Customization:</p>
                            {item.customization.text && (
                              <p className="text-sm text-gray-600">Text: "{item.customization.text}"</p>
                            )}
                            {item.customization.design && (
                              <p className="text-sm text-gray-600">Custom Design Applied</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{item.price}</p>
                      <p className="text-sm text-gray-600">₹{item.price / item.quantity} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>₹{order.shipping}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>₹{order.tax}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium capitalize">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <Badge
                  className={
                    order.paymentStatus === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.paymentId && (
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-mono text-sm">{order.paymentId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                <div className="pt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    {order.shippingAddress.phone}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Have questions about your order? Our support team is here to help.
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
