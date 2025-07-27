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

    // Get seller's products
    const products = await Product.find({ seller: session.user.id })
    const productIds = products.map((p) => p._id)

    // Get orders containing seller's products
    const orders = await Order.find({
      "items.product": { $in: productIds },
      status: { $ne: "cancelled" },
    })

    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => {
      const sellerItems = order.items.filter((item: any) => productIds.includes(item.product))
      return sum + sellerItems.reduce((itemSum: number, item: any) => itemSum + item.price * item.quantity, 0)
    }, 0)

    const totalProducts = products.length
    const totalOrders = orders.length
    const totalViews = products.reduce((sum, product) => sum + (product.views || 0), 0)
    const pendingOrders = orders.filter((order) => order.status === "pending").length
    const rating = products.reduce((sum, product) => sum + product.rating, 0) / products.length || 0

    return NextResponse.json({
      totalRevenue,
      totalProducts,
      totalOrders,
      totalViews,
      pendingOrders,
      rating,
    })
  } catch (error) {
    console.error("Error fetching seller stats:", error)
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 })
  }
}
