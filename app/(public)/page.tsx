"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductCard } from "@/components/product/product-card"
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
  Play,
  CheckCircle,
  Gift,
  Sparkles,
  Timer,
  Crown,
  Target,
  Lightbulb,
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
  stock: number
  seller: {
    name: string
    avatar?: string
  }
}

interface Category {
  name: string
  count: number
  icon: any
  color: string
}

interface Stats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
}

interface Testimonial {
  _id: string
  name: string
  avatar: string
  rating: number
  comment: string
  product: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
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
      const [productsRes, categoriesRes, statsRes, testimonialsRes] = await Promise.all([
        fetch("/api/products?featured=true&limit=20"),
        fetch("/api/products/categories"),
        fetch("/api/analytics/stats"),
        fetch("/api/testimonials?limit=6"),
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        const categoryIcons: Record<string, { icon: any; color: string }> = {
          "T-Shirts": { icon: Shirt, color: "text-blue-600" },
          "Hoodies": { icon: Shirt, color: "text-purple-600" },
          "Mugs": { icon: Coffee, color: "text-orange-600" },
          "Mobile Covers": { icon: Smartphone, color: "text-green-600" },
          "Tote Bags": { icon: ShoppingBag, color: "text-pink-600" },
          "Accessories": { icon: Star, color: "text-yellow-600" },
        }

        const formattedCategories = categoriesData.map((cat: any) => ({
          ...cat,
          icon: categoryIcons[cat.name]?.icon || Package,
          color: categoryIcons[cat.name]?.color || "text-gray-600",
        }))
        setCategories(formattedCategories)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (testimonialsRes.ok) {
        const testimonialsData = await testimonialsRes.json()
        setTestimonials(testimonialsData.testimonials || [])
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
      const response = await fetch("/api/marketing/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: "Subscribed!",
          description: "Thank you for subscribing to our newsletter.",
        })
        setEmail("")
      } else {
        throw new Error("Failed to subscribe")
      }
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

  const featuredProducts = products.filter((p) => p.featured).slice(0, 8)
  const newestProducts = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8)
  const trendingProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 8)
  const bestSellerProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8)

  const platformStats = [
    { label: "Happy Customers", value: stats?.totalUsers ? `${Math.floor(stats.totalUsers / 1000)}K+` : "50K+", icon: Users, color: "text-blue-600" },
    { label: "Products Sold", value: stats?.totalOrders ? `${Math.floor(stats.totalOrders / 1000)}K+` : "200K+", icon: Package, color: "text-green-600" },
    { label: "Design Templates", value: stats?.totalProducts ? `${Math.floor(stats.totalProducts / 100)}00+` : "1K+", icon: Palette, color: "text-purple-600" },
    { label: "Revenue Generated", value: stats?.totalRevenue ? `₹${Math.floor(stats.totalRevenue / 100000)}L+` : "₹10L+", icon: Award, color: "text-yellow-600" },
  ]

  const features = [
    {
      icon: Palette,
      title: "Custom Design Studio",
      description: "Create unique designs with our advanced design tools and templates",
      color: "text-blue-600",
    },
    {
      icon: Shield,
      title: "Premium Quality",
      description: "High-quality materials and printing for lasting products",
      color: "text-green-600",
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Quick delivery to your doorstep with real-time tracking",
      color: "text-purple-600",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your needs",
      color: "text-orange-600",
    },
  ]

  const benefits = [
    { icon: Crown, title: "Premium Marketplace", description: "Curated selection of high-quality custom products" },
    { icon: Target, title: "Print on Demand", description: "No inventory risk - products printed when ordered" },
    { icon: Lightbulb, title: "Design Tools", description: "Professional design studio with templates and assets" },
    { icon: Gift, title: "Bulk Orders", description: "Special pricing for bulk and corporate orders" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative container py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                  <Sparkles className="mr-2 h-4 w-4" />
                  🎨 Design Studio Now Live
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  BeKaarCool
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Custom Products
                  </span>
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
                  Transform your creativity into premium custom products. Design, print, and sell with India's most innovative custom product marketplace.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/design">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg">
                    <Palette className="mr-2 h-5 w-5" />
                    Start Designing
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 bg-transparent px-8 py-4 text-lg"
                  >
                    Browse Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 text-sm">
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
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="relative group">
                    <Image
                      src="/placeholder.svg?height=250&width=200&text=Custom+T-Shirt"
                      alt="Custom T-Shirt"
                      width={200}
                      height={250}
                      className="w-full h-60 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-semibold">Custom T-Shirts</p>
                      <p className="text-sm opacity-90">Starting ₹299</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <Image
                      src="/placeholder.svg?height=180&width=200&text=Custom+Mug"
                      alt="Custom Mug"
                      width={200}
                      height={180}
                      className="w-full h-44 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-semibold">Custom Mugs</p>
                      <p className="text-sm opacity-90">Starting ₹199</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6 mt-12">
                  <div className="relative group">
                    <Image
                      src="/placeholder.svg?height=180&width=200&text=Custom+Hoodie"
                      alt="Custom Hoodie"
                      width={200}
                      height={180}
                      className="w-full h-44 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-semibold">Custom Hoodies</p>
                      <p className="text-sm opacity-90">Starting ₹799</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <Image
                      src="/placeholder.svg?height=250&width=200&text=Mobile+Cover"
                      alt="Mobile Cover"
                      width={200}
                      height={250}
                      className="w-full h-60 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-semibold">Mobile Covers</p>
                      <p className="text-sm opacity-90">Starting ₹149</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {platformStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center group">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors mb-4`}>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our wide range of customizable products across different categories
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.slice(0, 6).map((category, index) => {
                const Icon = category.icon || Package || Package
                return (
                  <Link key={index} href={`/products?category=${encodeURIComponent(category.name)}`}>
                    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200">
                      <CardContent className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 group-hover:bg-blue-50 transition-colors mb-4">
                          <Icon className={`h-8 w-8 ${category.color || 'text-gray-600'} group-hover:scale-110 transition-transform`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.count} products</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="outline" className="px-8">
                View All Categories
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Products Sections */}
      <section className="py-20 bg-white">
        <div className="container">
          <Tabs defaultValue="featured" className="w-full">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h2>
              <p className="text-xl text-gray-600 mb-8">Discover amazing custom products from our marketplace</p>
              
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="newest">New</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="bestseller">Best Seller</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="featured">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="newest">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {newestProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="trending">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="bestseller">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {bestSellerProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="px-8">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose BeKaarCool?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide the best platform for creating and selling custom products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 group-hover:bg-blue-50 transition-colors mb-6">
                      <Icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Built for Creators & Entrepreneurs</h2>
              <p className="text-xl text-gray-600 mb-8">
                Whether you're a designer, artist, or entrepreneur, BeKaarCool provides everything you need to turn your ideas into profitable products.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8">
                <Link href="/seller/register">
                  <Button size="lg" className="px-8">
                    Start Selling Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <div className="text-3xl font-bold mb-2">₹50L+</div>
                    <div className="text-blue-100">Revenue Generated</div>
                  </Card>
                  <Card className="p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white">
                    <div className="text-3xl font-bold mb-2">10K+</div>
                    <div className="text-green-100">Active Sellers</div>
                  </Card>
                </div>
                <div className="space-y-6 mt-8">
                  <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white">
                    <div className="text-3xl font-bold mb-2">95%</div>
                    <div className="text-orange-100">Satisfaction Rate</div>
                  </Card>
                  <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    <div className="text-3xl font-bold mb-2">24/7</div>
                    <div className="text-purple-100">Support Available</div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-xl text-gray-600">Real feedback from our amazing community</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial._id} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Image
                        src={testimonial.avatar || "/placeholder-user.jpg"}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 italic mb-4">"{testimonial.comment}"</p>
                    <p className="text-sm text-gray-500">Product: {testimonial.product}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Stay Updated with BeKaarCool</h2>
            <p className="text-xl text-blue-100 mb-8">
              Get the latest updates on new products, design trends, and exclusive offers
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                required
              />
              <Button
                type="submit"
                disabled={subscribing}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
              >
                {subscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>

            <p className="text-sm text-blue-100 mt-4">
              Join 50,000+ creators and entrepreneurs who trust BeKaarCool
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}