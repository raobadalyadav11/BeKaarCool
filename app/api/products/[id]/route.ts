import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    const { id } = await params

    // Validate ObjectId format
    if (!id || id === 'undefined' || id === 'null' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    const product = await Product.findById(id)
      .populate("seller", "name email avatar")
      .populate("reviews", "rating comment user createdAt")

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Increment view count
    await Product.findByIdAndUpdate(id, { $inc: { views: 1 } })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 })
  }
}