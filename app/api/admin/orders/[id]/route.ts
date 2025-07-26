import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendOrderStatusUpdateEmail } from "@/lib/email"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const order = await Order.findById(params.id)
      .populate("user", "name email phone")
      .populate("items.product", "name images price")
      .populate("items.seller", "name email")

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ message: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const updateData = await request.json()
    const { status, paymentStatus, trackingNumber, notes } = updateData

    const order = await Order.findById(params.id).populate("user", "name email")

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Update order fields
    if (status) order.status = status
    if (paymentStatus) order.paymentStatus = paymentStatus
    if (trackingNumber) order.trackingNumber = trackingNumber
    if (notes) order.notes = notes

    // Set timestamps based on status
    if (status === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date()
    } else if (status === "cancelled" && !order.cancelledAt) {
      order.cancelledAt = new Date()
    } else if (status === "refunded" && !order.refundedAt) {
      order.refundedAt = new Date()
    }

    order.updatedAt = new Date()
    await order.save()

    // Send status update email
    try {
      await sendOrderStatusUpdateEmail(order.user.email, order.user.name, order)
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError)
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 })
  }
}
