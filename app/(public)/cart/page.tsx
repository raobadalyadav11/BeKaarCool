"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Tag,
  CheckCircle,
  ShoppingBag,
  Truck,
  Shield,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  _id: string
  product: {
    _id: string
    name: string
    price: number
    images: string[]
    category: string
    stock: number
  }
  quantity: number
  customization?: {
    design?: string
    text?: string
    color?: string
  }
}

interface CartData {
  items: CartItem[]
  total: number
  discount: number
  couponCode?: string
}

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [cart, setCart] = useState<CartData>({ items: [], total: 0, discount: 0 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  useEffect(() => {
    if (session) {
      fetchCart()
    } else {
      router.push("/auth/login?redirect=/cart")
    }
  }, [session, router])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCart(data)
      } else {
        throw new Error("Failed to fetch cart")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cart",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdating(itemId)
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        await fetchCart()
        toast({
          title: "Updated",
          description: "Cart updated successfully",
        })
      } else {
        throw new Error("Failed to update quantity")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (itemId: string) => {
    setUpdating(itemId)
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchCart()
        toast({
          title: "Removed",
          description: "Item removed from cart",
        })
      } else {
        throw new Error("Failed to remove item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return

    setApplyingCoupon(true)
    try {
      const response = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      })

      if (response.ok) {
        await fetchCart()
        toast({
          title: "Coupon Applied!",
          description: "Discount has been applied to your cart",
        })
        setCouponCode("")
      } else {
        const error = await response.json()
        toast({
          title: "Invalid Coupon",
          description: error.message || "Coupon code is not valid",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply coupon",
        variant: "destructive",
      })
    } finally {
      setApplyingCoupon(false)
    }
  }

  const removeCoupon = async () => {
    try {
      const response = await fetch("/api/cart/coupon", {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchCart()
        toast({
          title: "Coupon Removed",
          description: "Coupon has been removed from your cart",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove coupon",
        variant: "destructive",
      })
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const shipping = subtotal > 999 ? 0 : 99
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax - cart.discount

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <div className="space-y-4">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/design">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Create Custom Design
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Badge className="ml-4">{cart.items.length} items</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <img
                      src={item.product.images[0] || "/placeholder.svg"}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {item.product.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item._id)}
                          disabled={updating === item._id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {item.customization && (
                        <div className="mb-2 p-2 bg-blue-50 rounded text-sm">
                          <p className="text-blue-800 font-medium">Custom Design</p>
                          {item.customization.text && <p className="text-blue-600">Text: {item.customization.text}</p>}
                          {item.customization.color && (
                            <p className="text-blue-600">Color: {item.customization.color}</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updating === item._id}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock || updating === item._id}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">₹{item.product.price.toLocaleString()} each</p>
                        </div>
                      </div>

                      {item.product.stock < 10 && (
                        <p className="text-sm text-orange-600 mt-2">Only {item.product.stock} left in stock!</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Coupon Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Apply Coupon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.couponCode ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">{cart.couponCode}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-red-600">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <Button onClick={applyCoupon} disabled={applyingCoupon || !couponCode.trim()}>
                      {applyingCoupon ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    Shipping
                  </span>
                  <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>

                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{cart.discount.toLocaleString()}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                {shipping > 0 && (
                  <p className="text-sm text-gray-600">
                    Add ₹{(1000 - subtotal).toLocaleString()} more for FREE shipping
                  </p>
                )}

                <Link href="/checkout">
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                    <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                  </Button>
                </Link>

                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    Fast Delivery
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <Link href="/products">
              <Button variant="outline" className="w-full bg-transparent">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
