import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import mongoose from "mongoose"

const designSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productType: { type: String, required: true },
  elements: [
    {
      id: String,
      type: { type: String, enum: ["text", "shape", "image"] },
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      rotation: Number,
      content: String,
      fontSize: Number,
      fontFamily: String,
      color: String,
      backgroundColor: String,
      borderColor: String,
      borderWidth: Number,
      src: String,
      visible: Boolean,
      locked: Boolean,
    },
  ],
  canvasWidth: Number,
  canvasHeight: Number,
  thumbnail: String,
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Design = mongoose.models.Design || mongoose.model("Design", designSchema)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const productType = searchParams.get("productType")

    const skip = (page - 1) * limit
    const filter: any = { userId: session.user.id }

    if (productType) {
      filter.productType = productType
    }

    const designs = await Design.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit)

    const total = await Design.countDocuments(filter)

    return NextResponse.json({
      designs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching designs:", error)
    return NextResponse.json({ message: "Failed to fetch designs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { name, productType, elements, canvasWidth, canvasHeight, isPublic } = await request.json()

    if (!name || !productType || !elements) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const design = new Design({
      name,
      userId: session.user.id,
      productType,
      elements,
      canvasWidth,
      canvasHeight,
      isPublic: isPublic || false,
    })

    await design.save()

    return NextResponse.json(design, { status: 201 })
  } catch (error) {
    console.error("Error creating design:", error)
    return NextResponse.json({ message: "Failed to create design" }, { status: 500 })
  }
}
