import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "seller")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const filter: any = {}

    // If seller, only show their products
    if (session.user.role === "seller") {
      filter.seller = session.user.id
    }

    const stats = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          lowStockCount: {
            $sum: { $cond: [{ $and: [{ $lte: ["$stock", 10] }, { $gt: ["$stock", 0] }] }, 1, 0] },
          },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
          },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
    ])

    return NextResponse.json(
      stats[0] || {
        totalProducts: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalValue: 0,
      },
    )
  } catch (error) {
    console.error("Error fetching inventory stats:", error)
    return NextResponse.json({ message: "Failed to fetch inventory stats" }, { status: 500 })
  }
}
