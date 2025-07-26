import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Coupon } from "@/models/Coupon"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const updateData = await request.json()

    const coupon = await Coupon.findByIdAndUpdate(params.id, { ...updateData, updatedAt: new Date() }, { new: true })

    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const coupon = await Coupon.findByIdAndDelete(params.id)
    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Coupon deleted successfully" })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
