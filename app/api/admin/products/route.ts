import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const seller = searchParams.get("seller")

    const skip = (page - 1) * limit
    const filter: any = {}

    if (category && category !== "all") {
      filter.category = category
    }

    if (status) {
      switch (status) {
        case "active":
          filter.isActive = true
          break
        case "inactive":
          filter.isActive = false
          break
        case "featured":
          filter.featured = true
          break
        case "low-stock":
          filter.stock = { $lte: 10 }
          break
        case "out-of-stock":
          filter.stock = 0
          break
      }
    }

    if (seller) {
      filter.seller = seller
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const products = await Product.find(filter)
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Product.countDocuments(filter)

    // Calculate stats
    const stats = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          averagePrice: { $avg: "$price" },
          lowStockCount: {
            $sum: { $cond: [{ $lte: ["$stock", 10] }, 1, 0] },
          },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
          },
        },
      },
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: stats[0] || {
        totalProducts: 0,
        totalValue: 0,
        averagePrice: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 })
  }
}
