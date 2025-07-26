"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Truck, MapPin, User, Phone, Mail, Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
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

interface ShippingAddress {
  name: string
  phone: string
  email: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Review

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  })

  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  })

  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("razorpay")
  const [orderNotes, setOrderNotes] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)

  useEffect(() => {
    if (session) {
      fetchCart()
      // Pre-fill user data
      if (session.user) {
        setShippingAddress((prev) => ({
          ...prev,
          name: session.user.name || "",
          email: session.user.email || "",
        }))
        setBillingAddress((prev) => ({
          ...prev,
          name: session.user.name || "",
          email: session.user.email || "",
        }))
      }
    }
  }, [session])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCart(data)

        if (!data || data.items.length === 0) {
          router.push("/cart")
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
      toast({
        title: "Error",
        description: "Failed to load cart data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateShippingAddress = () => {
    const required = ["name", "phone", "street", "city", "state", "zipCode"]
    return required.every((field) => shippingAddress[field as keyof ShippingAddress]?.trim())
  }

  const validateBillingAddress = () => {
    if (sameAsShipping) return true
    const required = ["name", "phone", "street", "city", "state", "zipCode"]
    return required.every((field) => billingAddress[field as keyof ShippingAddress]?.trim())
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateShippingAddress()) {
        toast({
          title: "Incomplete Address",
          description: "Please fill in all required shipping address fields",
          variant: "destructive",
        })
        return
      }
      if (!validateBillingAddress()) {
        toast({
          title: "Incomplete Address",
          description: "Please fill in all required billing address fields",
          variant: "destructive",
        })
        return
      }
    }

    if (step === 2) {
      if (!paymentMethod) {
        toast({
          title: "Payment Method Required",
          description: "Please select a payment method",
          variant: "destructive",
        })
        return
      }
    }

    setStep(step + 1)
  }

  const handlePreviousStep = () => {
    setStep(step - 1)
  }

  const calculateShipping = () => {
    // Free shipping for orders over ₹999
    return cart && cart.total >= 999 ? 0 : 99
  }

  const calculateTax = () => {
    // 18% GST
    return cart ? Math.round(cart.total * 0.18) : 0
  }

  const calculateTotal = () => {
    if (!cart) return 0
    const shipping = calculateShipping()
    const tax = calculateTax()
    return cart.total + shipping + tax
  }

  const initiateRazorpayPayment = async (orderData: any) => {
    try {
      // Create Razorpay order
      const response = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: calculateTotal(),
          currency: "INR",
          receipt: `order_${Date.now()}`,
        }),
      })

      const { orderId, amount, currency, key } = await response.json()

      const options = {
        key,
        amount,
        currency,
        name: "Draprly",
        description: "Order Payment",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (verifyResponse.ok) {
              // Create order
              await createOrder({
                ...orderData,
                paymentId: response.razorpay_payment_id,
              })
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error) {
            toast({
              title: "Payment Error",
              description: "Payment verification failed. Please contact support.",
              variant: "destructive",
            })
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: "#3B82F6",
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Razorpay payment error:", error)
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const createOrder = async (orderData: any) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const order = await response.json()
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${order.orderNumber} has been placed.`,
        })
        router.push(`/orders/${order._id}`)
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to create order")
      }
    } catch (error: any) {
      toast({
        title: "Order Error",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePlaceOrder = async () => {
    if (!acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to proceed",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    try {
      const orderData = {
        items:
          cart?.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.price,
            sellerId: item.product._id, // This should be the actual seller ID
          })) || [],
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        total: calculateTotal(),
        subtotal: cart?.total || 0,
        shipping: calculateShipping(),
        tax: calculateTax(),
        discount: cart?.discount || 0,
        couponCode: cart?.couponCode,
        notes: orderNotes,
      }

      if (paymentMethod === "razorpay") {
        await initiateRazorpayPayment(orderData)
      } else if (paymentMethod === "cod") {
        await createOrder(orderData)
      }
    } catch (error) {
      console.error("Order placement error:", error)
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to proceed with checkout.</AlertDescription>
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
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
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
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Your cart is empty. Please add items before checkout.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/cart">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center space-x-4">
          {[
            { number: 1, title: "Shipping", icon: Truck },
            { number: 2, title: "Payment", icon: CreditCard },
            { number: 3, title: "Review", icon: CheckCircle },
          ].map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= stepItem.number ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"
                }`}
              >
                {step > stepItem.number ? <CheckCircle className="h-5 w-5" /> : <stepItem.icon className="h-5 w-5" />}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${step >= stepItem.number ? "text-blue-600" : "text-gray-400"}`}
              >
                {stepItem.title}
              </span>
              {index < 2 && <div className="w-12 h-px bg-gray-300 mx-4"></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Textarea
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress((prev) => ({ ...prev, street: e.target.value }))}
                      placeholder="Enter your street address"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress((prev) => ({ ...prev, state: e.target.value }))}
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress((prev) => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="Enter ZIP code"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={shippingAddress.country}
                      onValueChange={(value) => setShippingAddress((prev) => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="USA">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sameAsShipping"
                      checked={sameAsShipping}
                      onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                    />
                    <Label htmlFor="sameAsShipping">Same as shipping address</Label>
                  </div>

                  {!sameAsShipping && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingName">Full Name *</Label>
                          <Input
                            id="billingName"
                            value={billingAddress.name}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingPhone">Phone Number *</Label>
                          <Input
                            id="billingPhone"
                            value={billingAddress.phone}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billingStreet">Street Address *</Label>
                        <Textarea
                          id="billingStreet"
                          value={billingAddress.street}
                          onChange={(e) => setBillingAddress((prev) => ({ ...prev, street: e.target.value }))}
                          placeholder="Enter street address"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="billingCity">City *</Label>
                          <Input
                            id="billingCity"
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, city: e.target.value }))}
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingState">State *</Label>
                          <Input
                            id="billingState"
                            value={billingAddress.state}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, state: e.target.value }))}
                            placeholder="Enter state"
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingZipCode">ZIP Code *</Label>
                          <Input
                            id="billingZipCode"
                            value={billingAddress.zipCode}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, zipCode: e.target.value }))}
                            placeholder="Enter ZIP code"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="razorpay" id="razorpay" />
                      <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Credit/Debit Card, UPI, Net Banking</p>
                            <p className="text-sm text-gray-600">Powered by Razorpay</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Lock className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Secure</span>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-gray-600">Pay when you receive your order</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="mt-6">
                  <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
                  <Textarea
                    id="orderNotes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Any special instructions for your order..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {cart.items.map((item) => (
                        <div key={item._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.product.images[0] || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">
                              Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{item.price}</p>
                            <p className="text-sm text-gray-600">₹{item.product.price} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Address */}
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">{shippingAddress.name}</p>
                      <p>{shippingAddress.street}</p>
                      <p>
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                      </p>
                      <p>{shippingAddress.country}</p>
                      <p className="mt-2">
                        <Phone className="inline h-4 w-4 mr-1" />
                        {shippingAddress.phone}
                      </p>
                      {shippingAddress.email && (
                        <p>
                          <Mail className="inline h-4 w-4 mr-1" />
                          {shippingAddress.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">
                        {paymentMethod === "razorpay" ? "Credit/Debit Card, UPI, Net Banking" : "Cash on Delivery"}
                      </p>
                      {paymentMethod === "razorpay" && <p className="text-sm text-gray-600">Powered by Razorpay</p>}
                    </div>
                  </div>

                  {orderNotes && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Order Notes</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p>{orderNotes}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={handlePreviousStep}>
                Previous
              </Button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <Button onClick={handleNextStep}>Next</Button>
              ) : (
                <Button onClick={handlePlaceOrder} disabled={processing || !acceptTerms} className="min-w-[200px]">
                  {processing ? "Processing..." : `Place Order - ₹${calculateTotal()}`}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items Summary */}
              <div className="space-y-2">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cart.total}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{cart.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={calculateShipping() === 0 ? "text-green-600" : ""}>
                    {calculateShipping() === 0 ? "Free" : `₹${calculateShipping()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST)</span>
                  <span>₹{calculateTax()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>

              {/* Free Shipping Notice */}
              {calculateShipping() > 0 && (
                <Alert>
                  <Truck className="h-4 w-4" />
                  <AlertDescription>Add ₹{999 - cart.total} more for free shipping!</AlertDescription>
                </Alert>
              )}

              {/* Security Notice */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 pt-4">
                <Lock className="h-4 w-4" />
                <span>Secure checkout powered by SSL encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  )
}
