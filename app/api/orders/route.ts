import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"
import { Cart } from "@/models/Cart"
import { Product } from "@/models/Product"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const orders = await Order.find({ user: session.user.id })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })

    return NextResponse.json(orders)
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

    const { items, shippingAddress, paymentMethod, paymentId, total, subtotal, shipping, tax } = await request.json()

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
      status: "pending",
    })

    await order.save()

    // Clear cart after successful order
    await Cart.findOneAndUpdate({ user: session.user.id }, { items: [], total: 0 })

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, sold: item.quantity } })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
