import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { Review } from "@/models/Review"
import { User } from "@/models/User"
import { Order } from "@/models/Order"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    
    // Ensure models are registered
    Review
    User
    Order

    const product = await Product.findById(params.id)
      .populate("seller", "name email avatar phone")
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          select: "name avatar",
        },
        options: { sort: { createdAt: -1 } },
      })

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Increment view count
    await Product.findByIdAndUpdate(params.id, { $inc: { views: 1 } })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const product = await Product.findById(params.id)
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Check if user owns the product or is admin
    if (product.seller.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Update SEO if name or description changed
    if (body.name || body.description) {
      body.seo = {
        ...product.seo,
        title: body.seoTitle || body.name || product.seo.title,
        description:
          body.seoDescription || (body.description && body.description.substring(0, 160)) || product.seo.description,
        keywords: body.seoKeywords || body.tags || product.seo.keywords,
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate("seller", "name email avatar")

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const product = await Product.findById(params.id)
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Check if user owns the product or is admin
    if (product.seller.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await Product.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 })
  }
}
