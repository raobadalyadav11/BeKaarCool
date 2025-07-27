import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"
import { Product } from "@/models/Product"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "seller") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    // Get seller's products
    const products = await Product.find({ seller: session.user.id })
    const productIds = products.map((p) => p._id)

    const skip = (page - 1) * limit
    const filter: any = {
      "items.product": { $in: productIds },
    }

    if (status && status !== "all") {
      filter.status = status
    }

    const orders = await Order.find(filter)
      .populate("customer", "name email")
      .populate("items.product", "name images price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Order.countDocuments(filter)

    // Filter orders to only include seller's items
    const filteredOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.filter((item: any) => productIds.includes(item.product._id)),
    }))

    return NextResponse.json({
      orders: filteredOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching seller orders:", error)
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 })
  }
}
