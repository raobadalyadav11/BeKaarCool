"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  _id: string
  product: {
    _id: string
    name: string
    images: string[]
    price: number
    stock: number
  }
  quantity: number
  size: string
  color: string
  price: number
}

interface Cart {
  _id: string
  items: CartItem[]
  total: number
  discount: number
  couponCode?: string
}

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  useEffect(() => {
    if (session) {
      fetchCart()
    }
  }, [session])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCart(data)
        setCouponCode(data.couponCode || "")
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        await fetchCart()
        toast({
          title: "Cart updated",
          description: "Item quantity has been updated.",
        })
      } else {
        throw new Error("Failed to update quantity")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item quantity.",
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
          title: "Item removed",
          description: "Item has been removed from your cart.",
        })
      } else {
        throw new Error("Failed to remove item")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchCart()
        toast({
          title: "Coupon applied",
          description: `You saved ₹${data.discount}!`,
        })
      } else {
        throw new Error(data.message || "Invalid coupon code")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to apply coupon.",
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
        setCouponCode("")
        toast({
          title: "Coupon removed",
          description: "Coupon has been removed from your cart.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove coupon.",
        variant: "destructive",
      })
    }
  }

  const proceedToCheckout = () => {
    router.push("/checkout")
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Please log in to view your cart.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <div className="h-24 w-24 bg-gray-200 rounded"></div>
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
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/products">
            <Button size="lg">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <Card key={item._id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-600">Size: {item.size}</p>
                            <p className="text-sm text-gray-600">Color: {item.color}</p>
                            <p className="text-sm text-gray-600">
                              Stock: {item.product.stock > 0 ? `${item.product.stock} available` : "Out of stock"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{item.price}</p>
                          <p className="text-sm text-gray-600">₹{item.product.price} each</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
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

                      {item.product.stock === 0 && (
                        <Alert className="mt-4">
                          <AlertDescription>This item is currently out of stock.</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coupon Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon Code</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={applyingCoupon}
                  />
                  {cart.couponCode ? (
                    <Button variant="outline" onClick={removeCoupon} disabled={applyingCoupon}>
                      Remove
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={applyCoupon} disabled={applyingCoupon || !couponCode.trim()}>
                      <Tag className="mr-2 h-4 w-4" />
                      Apply
                    </Button>
                  )}
                </div>
                {cart.couponCode && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{cart.couponCode}</Badge>
                    <span className="text-sm text-green-600">Coupon applied!</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{cart.total + cart.discount}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{cart.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{cart.total}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={proceedToCheckout}
                disabled={cart.items.some((item) => item.product.stock === 0)}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="text-center">
                <Link href="/products" className="text-sm text-blue-600 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
