import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sort = searchParams.get("sort") || "createdAt"

    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = { isActive: true }

    if (category && category !== "all") {
      filter.category = category
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number.parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = Number.parseFloat(maxPrice)
    }

    // Build sort object
    let sortObj: any = {}
    switch (sort) {
      case "price-low":
        sortObj = { price: 1 }
        break
      case "price-high":
        sortObj = { price: -1 }
        break
      case "rating":
        sortObj = { averageRating: -1 }
        break
      case "newest":
        sortObj = { createdAt: -1 }
        break
      default:
        sortObj = { featured: -1, createdAt: -1 }
    }

    const products = await Product.find(filter).sort(sortObj).skip(skip).limit(limit).populate("seller", "name email")

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
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const product = new Product(body)
    await product.save()

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
