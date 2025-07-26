import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Cart } from "@/models/Cart"
import { Coupon } from "@/models/Coupon"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { couponCode } = await request.json()

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() },
    })

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit exceeded" }, { status: 400 })
    }

    const cart = await Cart.findOne({ user: session.user.id })
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && cart.total < coupon.minOrderAmount) {
      return NextResponse.json({ error: `Minimum order amount of ₹${coupon.minOrderAmount} required` }, { status: 400 })
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === "percentage") {
      discount = (cart.total * coupon.discountValue) / 100
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount)
      }
    } else {
      discount = coupon.discountValue
    }

    // Update cart with coupon
    cart.couponCode = couponCode.toUpperCase()
    cart.discount = discount
    await cart.save()

    // Update coupon usage
    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } })

    return NextResponse.json({
      discount,
      couponCode: couponCode.toUpperCase(),
      message: "Coupon applied successfully",
    })
  } catch (error) {
    console.error("Error applying coupon:", error)
    return NextResponse.json({ error: "Failed to apply coupon" }, { status: 500 })
  }
}
