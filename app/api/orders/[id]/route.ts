import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { resolveUserId } from "@/lib/auth-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Resolve user ID to ensure it's a valid MongoDB ObjectId
    const userId = await resolveUserId(session.user.id, session.user.email)

    const order = await Order.findById(params.id)
      .populate("items.product", "name images")
      .populate("user", "name email")

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Check if user owns the order or is admin/seller
    if (
      order.user._id.toString() !== userId &&
      session.user.role !== "admin" &&
      !order.items.some((item: any) => item.seller.toString() === userId)
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
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
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Resolve user ID to ensure it's a valid MongoDB ObjectId
    const userId = await resolveUserId(session.user.id, session.user.email)

    const order = await Order.findById(params.id)
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Check permissions
    const canUpdate =
      session.user.role === "admin" ||
      order.items.some((item: any) => item.seller.toString() === userId) ||
      (order.user.toString() === userId && ["pending", "confirmed"].includes(order.status))

    if (!canUpdate) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate("items.product", "name images")

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 })
  }
}
