import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const { status, trackingNumber } = await request.json()

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status, trackingNumber, updatedAt: new Date() },
      { new: true },
    ).populate("userId", "name email")

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const order = await Order.findById(params.id).populate("userId", "name email")
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
