"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  ArrowRight,
  Star,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Zap,
  Heart,
  Palette,
  Shirt,
  Coffee,
  Smartphone,
  ShoppingBag,
  Award,
  Shield,
  Truck,
  Headphones,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  rating: number
  sold: number
  featured: boolean
  createdAt: string
}

interface Category {
  name: string
  count: number
  icon: any
  color: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [subscribing, setSubscribing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products?featured=true&limit=20"),
        fetch("/api/products/categories"),
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        const categoryIcons = {
          "T-Shirts": { icon: Shirt, color: "text-blue-600" },
          Hoodies: { icon: Shirt, color: "text-purple-600" },
          Mugs: { icon: Coffee, color: "text-orange-600" },
          "Mobile Covers": { icon: Smartphone, color: "text-green-600" },
          "Tote Bags": { icon: ShoppingBag, color: "text-pink-600" },
          Accessories: { icon: Star, color: "text-yellow-600" },
        }

        const formattedCategories = categoriesData.map((cat: any) => ({
          ...cat,
          ...categoryIcons[cat.name as keyof typeof categoryIcons],
        }))
        setCategories(formattedCategories)
      }
    } catch (error) {
      console.error("Error fetching home data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubscribing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      })
      setEmail("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubscribing(false)
    }
  }

  const addToCart = async (product: Product) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      })

      if (response.ok) {
        toast({
          title: "Added to cart!",
          description: `${product.name} has been added to your cart.`,
        })
      } else {
        throw new Error("Failed to add to cart")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Please login to add items to cart.",
        variant: "destructive",
      })
    }
  }

  const featuredProducts = products.filter((p) => p.featured)
  const newestProducts = products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const trendingProducts = products.sort((a, b) => b.sold - a.sold)
  const recommendedProducts = products.sort((a, b) => b.rating - a.rating)

  const stats = [
    { label: "Happy Customers", value: "50,000+", icon: Users },
    { label: "Products Sold", value: "200,000+", icon: Package },
    { label: "Design Templates", value: "1,000+", icon: Palette },
    { label: "Countries Served", value: "25+", icon: Award },
  ]

  const features = [
    {
      icon: Palette,
      title: "Custom Design Studio",
      description: "Create unique designs with our advanced design tools",
    },
    {
      icon: Shield,
      title: "Premium Quality",
      description: "High-quality materials and printing for lasting products",
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Quick delivery to your doorstep with tracking",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your needs",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30">🎨 Design Studio Now Live</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  BeKaarCool
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Custom Products
                  </span>
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Transform your creativity into premium custom products with BeKaarCool. Design, print, and sell
                  with India's coolest custom product marketplace.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/design">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                    <Palette className="mr-2 h-5 w-5" />
                    Start Designing
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 bg-transparent"
                  >
                    Browse Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-300 fill-current" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Secure Platform</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="/placeholder.svg?height=200&width=200&text=Custom+T-Shirt"
                    alt="Custom T-Shirt"
                    className="w-full h-48 object-cover rounded-lg shadow-2xl"
                  />
                  <img
                    src="/placeholder.svg?height=150&width=200&text=Custom+Mug"
                    alt="Custom Mug"
                    className="w-full h-36 object-cover rounded-lg shadow-2xl"
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <img
                    src="/placeholder.svg?height=150&width=200&text=Custom+Hoodie"
                    alt="Custom Hoodie"
                    className="w-full h-36 object-cover rounded-lg shadow-2xl"
                  />
                  <img
                    src="/placeholder.svg?height=200&width=200&text=Mobile+Cover"
                    alt="Mobile Cover"
                    className="w-full h-48 object-cover rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Discover our wide range of customizable products</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link key={index} href={`/products?category=${encodeURIComponent(category.name)}`}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
{category.icon ? (
  <category.icon className={`h-8 w-8 ${category.color}`} />
) : (
  <div className="h-8 w-8 text-gray-400">?</div>
)}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.count} products</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose BeKaarCool?</h2>
            <p className="text-xl text-gray-600">Everything you need to create and sell custom products</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Explore Our Products</h2>
            <p className="text-xl text-gray-600">Discover trending designs and create your own</p>
          </div>

          <Tabs defaultValue="featured" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="featured" className="flex items-center">
                <Star className="mr-2 h-4 w-4" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="newest" className="flex items-center">
                <Zap className="mr-2 h-4 w-4" />
                Newest
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="recommended" className="flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                Recommended
              </TabsTrigger>
            </TabsList>

            <TabsContent value="featured">
              <ProductGrid products={featuredProducts} loading={loading} onAddToCart={addToCart} />
            </TabsContent>

            <TabsContent value="newest">
              <ProductGrid products={newestProducts} loading={loading} onAddToCart={addToCart} />
            </TabsContent>

            <TabsContent value="trending">
              <ProductGrid products={trendingProducts} loading={loading} onAddToCart={addToCart} />
            </TabsContent>

            <TabsContent value="recommended">
              <ProductGrid products={recommendedProducts} loading={loading} onAddToCart={addToCart} />
            </TabsContent>
          </Tabs>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="outline">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProductGrid({
  products,
  loading,
  onAddToCart,
}: {
  products: Product[]
  loading: boolean
  onAddToCart: (product: Product) => void
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.slice(0, 8).map((product) => (
        <Card key={product._id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="relative aspect-square overflow-hidden rounded-t-lg">
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.originalPrice && product.originalPrice > product.price && (
              <Badge className="absolute top-2 left-2 bg-red-500">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </Badge>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <Button
                onClick={() => onAddToCart(product)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">{product.category}</Badge>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="ml-1 text-sm text-gray-600">{product.rating.toFixed(1)}</span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <span className="text-sm text-gray-600">{product.sold} sold</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
