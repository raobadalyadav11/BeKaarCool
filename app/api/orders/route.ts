import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"
import { Cart } from "@/models/Cart"
import { Product } from "@/models/Product"
import { User } from "@/models/User"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { createShipment } from "@/lib/shiprocket"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    const skip = (page - 1) * limit
    const filter: any = { user: session.user.id }

    if (status && status !== "all") {
      filter.status = status
    }

    const orders = await Order.find(filter)
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments(filter)

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { items, shippingAddress, paymentMethod, paymentId, total, subtotal, shipping, tax, discount, couponCode } =
      await request.json()

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.product)
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product?.name || "product"}` }, { status: 400 })
      }
    }

    // Create order
    const order = new Order({
      user: session.user.id,
      items,
      shippingAddress,
      paymentMethod,
      paymentId,
      total,
      subtotal,
      shipping,
      tax,
      discount,
      couponCode,
      status: paymentMethod === "cod" ? "confirmed" : "pending",
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    await order.save()

    // Update product stock and sales
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      })
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: session.user.id }, { items: [], total: 0, discount: 0, couponCode: null })

    // Get user details for email
    const user = await User.findById(session.user.id)

    // Send order confirmation email
    await sendOrderConfirmationEmail(user.email, user.name, order)

    // Create shipment if payment is confirmed
    if (paymentMethod !== "cod") {
      try {
        const shipmentData = await createShipment(order, shippingAddress)
        order.trackingNumber = shipmentData.awb_code
        await order.save()
      } catch (shipmentError) {
        console.error("Shipment creation error:", shipmentError)
      }
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
