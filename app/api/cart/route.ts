import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Cart } from "@/models/Cart"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const cart = await Cart.findOne({ user: session.user.id }).populate("items.product", "name price images")

    return NextResponse.json(cart || { items: [], total: 0 })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { productId, quantity = 1, size, color } = await request.json()

    let cart = await Cart.findOne({ user: session.user.id })

    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [] })
    }

    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId && item.size === size && item.color === color,
    )

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity
    } else {
      cart.items.push({ product: productId, quantity, size, color })
    }

    await cart.save()
    await cart.populate("items.product", "name price images")

    return NextResponse.json(cart)
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}
