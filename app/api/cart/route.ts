import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Cart } from "@/models/Cart"
import { Product } from "@/models/Product"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    let cart = await Cart.findOne({ user: session.user.id }).populate({
      path: "items.product",
      select: "name price originalPrice images stock seller",
      populate: {
        path: "seller",
        select: "name",
      },
    })

    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [], total: 0 })
      await cart.save()
    }

    return NextResponse.json(cart)
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

    const { productId, quantity, size, color, customization } = await request.json()

    const product = await Product.findById(productId).populate("seller", "name")
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    let cart = await Cart.findOne({ user: session.user.id })
    if (!cart) {
      cart = new Cart({ user: session.user.id, items: [], total: 0 })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId && item.size === size && item.color === color,
    )

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity
    } else {
      cart.items.push({
        product: productId,
        quantity,
        size,
        color,
        customization,
        price: product.price,
      })
    }

    // Calculate total
    await cart.populate({
      path: "items.product",
      select: "price",
    })

    cart.total = cart.items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0)

    await cart.save()

    // Populate for response
    await cart.populate({
      path: "items.product",
      select: "name price originalPrice images stock seller",
      populate: {
        path: "seller",
        select: "name",
      },
    })

    return NextResponse.json(cart)
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    await Cart.findOneAndUpdate({ user: session.user.id }, { items: [], total: 0, couponCode: null, discount: 0 })

    return NextResponse.json({ message: "Cart cleared successfully" })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 })
  }
}
