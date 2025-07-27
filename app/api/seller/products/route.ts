import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
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
    const sort = searchParams.get("sort") || "createdAt"
    const category = searchParams.get("category")

    const skip = (page - 1) * limit
    const filter: any = { seller: session.user.id }

    if (category) {
      filter.category = category
    }

    let sortOption: any = { createdAt: -1 }
    if (sort === "popular") {
      sortOption = { sold: -1 }
    } else if (sort === "rating") {
      sortOption = { rating: -1 }
    } else if (sort === "price") {
      sortOption = { price: 1 }
    }

    const products = await Product.find(filter).sort(sortOption).skip(skip).limit(limit)

    const total = await Product.countDocuments(filter)

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching seller products:", error)
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "seller") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { name, description, price, originalPrice, category, tags, stock, images, featured, isActive } =
      await request.json()

    if (!name || !description || !price || !category || !stock) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category,
      tags: tags || [],
      stock,
      images: images || [],
      featured: featured || false,
      isActive: isActive !== undefined ? isActive : true,
      seller: session.user.id,
      rating: 0,
      sold: 0,
      views: 0,
    })

    await product.save()
    await product.populate("seller", "name email")

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 })
  }
}
