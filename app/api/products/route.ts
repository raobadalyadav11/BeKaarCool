import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { Review } from "@/models/Review"
import { User } from "@/models/User"
import { Order } from "@/models/Order"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateQRCode } from "@/lib/qr-code"

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
    const featured = searchParams.get("featured")
    const sellerId = searchParams.get("sellerId")

    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = { isActive: true }

    if (category && category !== "all") {
      filter.category = category
    }

    if (sellerId) {
      filter.seller = sellerId
    }

    if (featured === "true") {
      filter.featured = true
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { "seo.keywords": { $in: [new RegExp(search, "i")] } },
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
        sortObj = { rating: -1 }
        break
      case "newest":
        sortObj = { createdAt: -1 }
        break
      case "popular":
        sortObj = { views: -1, sold: -1 }
        break
      case "name":
        sortObj = { name: 1 }
        break
      default:
        sortObj = { featured: -1, createdAt: -1 }
    }

    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate("seller", "name email avatar")
      .populate({
        path: "reviews",
        select: "rating comment user createdAt",
        populate: {
          path: "user",
          select: "name avatar",
        },
        options: { sort: { createdAt: -1 }, limit: 5 },
      })

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
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "seller" && session.user.role !== "admin")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.description || !body.price || !body.category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Generate product slug
    const slug = body.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    // Generate QR code for product
    const productUrl = `${process.env.NEXT_PUBLIC_APP_URL}/products/${slug}`
    const qrCodeData = await generateQRCode(productUrl)

    const product = new Product({
      ...body,
      seller: session.user.id,
      slug,
      qrCode: qrCodeData,
      seo: {
        title: body.seoTitle || body.name,
        description: body.seoDescription || body.description.substring(0, 160),
        keywords: body.seoKeywords || body.tags || [],
      },
      views: 0,
      sold: 0,
      rating: 0,
      reviews: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await product.save()
    await product.populate("seller", "name email avatar")

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 })
  }
}
