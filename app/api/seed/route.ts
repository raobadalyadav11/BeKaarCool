import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Product } from '@/models/Product'
import { User } from '@/models/User'

const sampleProducts = [
  {
    name: "Custom T-Shirt",
    description: "High-quality cotton t-shirt perfect for custom designs and printing. Available in multiple sizes and colors.",
    price: 599,
    originalPrice: 799,
    images: ["/placeholder.jpg"],
    category: "clothing",
    tags: ["t-shirt", "custom", "cotton", "casual"],
    variations: {
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["White", "Black", "Navy", "Red", "Green"],
    },
    stock: 100,
    featured: true,
    customizable: true,
    slug: "custom-t-shirt",
  },
  {
    name: "Premium Hoodie",
    description: "Comfortable premium hoodie made from soft cotton blend. Perfect for casual wear and custom printing.",
    price: 1299,
    originalPrice: 1599,
    images: ["/placeholder.jpg"],
    category: "clothing",
    tags: ["hoodie", "premium", "cotton", "casual"],
    variations: {
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Black", "Gray", "Navy", "Maroon"],
    },
    stock: 50,
    featured: true,
    customizable: true,
    slug: "premium-hoodie",
  },
  {
    name: "Canvas Tote Bag",
    description: "Eco-friendly canvas tote bag perfect for shopping and daily use. Great for custom designs.",
    price: 399,
    originalPrice: 499,
    images: ["/placeholder.jpg"],
    category: "accessories",
    tags: ["bag", "canvas", "eco-friendly", "tote"],
    variations: {
      sizes: ["One Size"],
      colors: ["Natural", "Black", "Navy"],
    },
    stock: 75,
    featured: false,
    customizable: true,
    slug: "canvas-tote-bag",
  },
  {
    name: "Coffee Mug",
    description: "Ceramic coffee mug perfect for custom designs and personalization. Dishwasher safe.",
    price: 299,
    originalPrice: 399,
    images: ["/placeholder.jpg"],
    category: "accessories",
    tags: ["mug", "ceramic", "coffee", "custom"],
    variations: {
      sizes: ["11oz", "15oz"],
      colors: ["White", "Black"],
    },
    stock: 200,
    featured: false,
    customizable: true,
    slug: "coffee-mug",
  },
  {
    name: "Phone Case",
    description: "Protective phone case available for various phone models. Perfect for custom designs.",
    price: 499,
    originalPrice: 699,
    images: ["/placeholder.jpg"],
    category: "accessories",
    tags: ["phone", "case", "protective", "custom"],
    variations: {
      sizes: ["iPhone 14", "iPhone 15", "Samsung S23", "Samsung S24"],
      colors: ["Clear", "Black", "White"],
    },
    stock: 150,
    featured: true,
    customizable: true,
    slug: "phone-case",
  },
]

export async function POST() {
  try {
    await connectDB()
    
    // Find or create a default seller
    let seller = await User.findOne({ role: 'seller' })
    if (!seller) {
      seller = await User.findOne({ role: 'admin' })
    }
    if (!seller) {
      // Create a default seller
      seller = new User({
        name: 'Default Seller',
        email: 'seller@draprly.com',
        role: 'seller',
        isVerified: true,
      })
      await seller.save()
    }

    // Clear existing products (uncomment to reset)
    // await Product.deleteMany({})
    
    // Create products with seller ID
    const productsWithSeller = sampleProducts.map(product => ({
      ...product,
      seller: seller._id,
      seo: {
        title: product.name,
        description: product.description.substring(0, 160),
        keywords: product.tags,
      },
    }))

    const createdProducts = await Product.insertMany(productsWithSeller)
    
    return NextResponse.json({
      success: true,
      message: `Created ${createdProducts.length} sample products`,
      products: createdProducts.length
    })
    
  } catch (error) {
    console.error('Error seeding products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed products' },
      { status: 500 }
    )
  }
}