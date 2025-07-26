import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "admin" && session.user.role !== "seller")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { quantity, type, reason, reference } = await request.json()

    const product = await Product.findById(params.productId)

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Check if seller owns the product
    if (session.user.role === "seller" && product.seller.toString() !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    let newStock = product.stock

    switch (type) {
      case "in":
        newStock += quantity
        break
      case "out":
        newStock = Math.max(0, newStock - quantity)
        break
      case "adjustment":
        newStock = quantity
        break
      default:
        return NextResponse.json({ message: "Invalid stock movement type" }, { status: 400 })
    }

    product.stock = newStock
    product.updatedAt = new Date()
    await product.save()

    // TODO: Create stock movement record
    // const stockMovement = new StockMovement({
    //   product: params.productId,
    //   type,
    //   quantity,
    //   reason,
    //   reference,
    //   user: session.user.id,
    //   previousStock: product.stock,
    //   newStock,
    // })
    // await stockMovement.save()

    return NextResponse.json({
      _id: product._id,
      product: {
        _id: product._id,
        name: product.name,
        images: product.images,
        category: product.category,
        price: product.price,
      },
      stock: product.stock,
      reserved: 0,
      available: product.stock,
      lowStockThreshold: 10,
      reorderPoint: 5,
      reorderQuantity: 50,
      updatedAt: product.updatedAt,
    })
  } catch (error) {
    console.error("Error updating stock:", error)
    return NextResponse.json({ message: "Failed to update stock" }, { status: 500 })
  }
}
