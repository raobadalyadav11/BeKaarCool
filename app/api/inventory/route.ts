import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "seller")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const lowStock = searchParams.get("lowStock") === "true"
    const sellerId = session.user.role === "seller" ? session.user.id : searchParams.get("sellerId")

    const filter: any = {}
    if (sellerId) filter.seller = sellerId
    if (lowStock) filter.stock = { $lte: 10 } // Low stock threshold

    const products = await Product.find(filter).populate("seller", "name email").sort({ stock: 1 })

    const summary = await Product.aggregate([
      ...(sellerId ? [{ $match: { seller: sellerId } }] : []),
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          lowStockProducts: {
            $sum: { $cond: [{ $lte: ["$stock", 10] }, 1, 0] },
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
          },
        },
      },
    ])

    return NextResponse.json({
      products,
      summary: summary[0] || {
        totalProducts: 0,
        totalStock: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
      },
    })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "seller")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { productId, stock } = await request.json()

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user owns the product or is admin
    if (product.seller.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, { stock }, { new: true }).populate(
      "seller",
      "name email",
    )

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating inventory:", error)
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 })
  }
}
