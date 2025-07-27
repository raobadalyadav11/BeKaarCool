import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Truck, Shield, Palette, Users, TrendingUp, Heart, Zap, Award, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ProductCard } from "@/components/product/product-card"

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/featured`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

async function getNewestProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?sort=newest&limit=8`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    console.error("Error fetching newest products:", error)
    return []
  }
}

async function getTrendingProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?sort=trending&limit=8`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    console.error("Error fetching trending products:", error)
    return []
  }
}

async function getRecommendedProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?sort=recommended&limit=8`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    console.error("Error fetching recommended products:", error)
    return []
  }
}

export default async function HomePage() {
  const [featuredProducts, newestProducts, trendingProducts, recommendedProducts] = await Promise.all([
    getFeaturedProducts(),
    getNewestProducts(),
    getTrendingProducts(),
    getRecommendedProducts(),
  ])

  const features = [
    {
      icon: Palette,
      title: "Custom Design Studio",
      description: "Create unique designs with our advanced editor and canvas tools",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Quick delivery with real-time tracking via Shiprocket integration",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Multiple payment options with SSL encryption and security",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Users,
      title: "Marketplace",
      description: "Join thousands of sellers and buyers in our growing community",
      color: "bg-orange-100 text-orange-600",
    },
  ]

  const stats = [
    { icon: Users, label: "Happy Customers", value: "50,000+", color: "text-blue-600" },
    { icon: Package, label: "Products Sold", value: "200,000+", color: "text-green-600" },
    { icon: Award, label: "5-Star Reviews", value: "25,000+", color: "text-yellow-600" },
    { icon: Zap, label: "Orders Delivered", value: "180,000+", color: "text-purple-600" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-10"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-4 py-2">
                  🎨 Print-on-Demand Platform
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Create, Customize &<br />
                  <span className="text-yellow-300">Sell</span> with
                  <span className="text-pink-300"> Draprly</span>
                </h1>
                <p className="text-xl text-white/90 max-w-lg leading-relaxed">
                  Transform your ideas into premium custom clothing and accessories. Design, print, and sell with our
                  all-in-one e-commerce platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/design">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
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
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Browse Products
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white"></div>
                    ))}
                  </div>
                  <span>50,000+ Happy Customers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="Draprly Design Studio"
                  width={500}
                  height={500}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-yellow-400 to-pink-400 rounded-2xl opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-full h-full bg-gradient-to-br from-green-400 to-blue-400 rounded-2xl opacity-15"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center ${stat.color}`}
                >
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Draprly?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, customize, and sell premium products online
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="space-y-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${feature.color}`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-xl text-gray-600">Handpicked designs from our top creators</p>
            </div>
            <Link href="/products?filter=featured">
              <Button variant="outline" className="hidden sm:flex bg-transparent">
                View All Featured
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newest Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                <span className="flex items-center">
                  <Zap className="h-8 w-8 mr-3 text-blue-600" />
                  Newest Arrivals
                </span>
              </h2>
              <p className="text-xl text-gray-600">Fresh designs just added to our collection</p>
            </div>
            <Link href="/products?sort=newest">
              <Button variant="outline" className="hidden sm:flex bg-transparent">
                View All New
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {newestProducts.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                <span className="flex items-center">
                  <TrendingUp className="h-8 w-8 mr-3 text-green-600" />
                  Trending Now
                </span>
              </h2>
              <p className="text-xl text-gray-600">Most popular products this week</p>
            </div>
            <Link href="/products?sort=trending">
              <Button variant="outline" className="hidden sm:flex bg-transparent">
                View All Trending
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingProducts.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                <span className="flex items-center">
                  <Heart className="h-8 w-8 mr-3 text-red-600" />
                  Recommended for You
                </span>
              </h2>
              <p className="text-xl text-gray-600">Curated picks based on your interests</p>
            </div>
            <Link href="/products?sort=recommended">
              <Button variant="outline" className="hidden sm:flex bg-transparent">
                View All Recommended
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendedProducts.slice(0, 4).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8 opacity-90">
              Get the latest designs, exclusive offers, and design tips delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3">Subscribe</Button>
            </div>
            <p className="text-sm opacity-75 mt-4">No spam, unsubscribe at any time. We respect your privacy.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Start Your Design Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of creators who trust Draprly for their custom printing needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 bg-transparent px-8 py-4 text-lg"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
