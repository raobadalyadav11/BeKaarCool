import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendOrderStatusEmail } from "@/lib/email"
import { trackShipment } from "@/lib/shiprocket"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const order = await Order.findById(params.id)
      .populate("items.product", "name images price")
      .populate("user", "name email")

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user owns the order or is admin/seller
    if (
      order.user._id.toString() !== session.user.id &&
      session.user.role !== "admin" &&
      session.user.role !== "seller"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get tracking info if available
    let trackingInfo = null
    if (order.trackingNumber) {
      try {
        trackingInfo = await trackShipment(order.trackingNumber)
      } catch (error) {
        console.error("Tracking error:", error)
      }
    }

    return NextResponse.json({ ...order.toObject(), trackingInfo })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "seller")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { status, trackingNumber, notes } = await request.json()

    const order = await Order.findById(params.id).populate("user", "name email")
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (trackingNumber) updateData.trackingNumber = trackingNumber
    if (notes) updateData.notes = notes

    if (status === "delivered") {
      updateData.deliveredAt = new Date()
    }

    const updatedOrder = await Order.findByIdAndUpdate(params.id, updateData, { new: true })

    // Send status update email
    if (status) {
      await sendOrderStatusEmail(order.user.email, order.user.name, updatedOrder)
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
