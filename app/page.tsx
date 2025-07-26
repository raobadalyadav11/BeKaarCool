import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Truck, Shield, Palette, Users } from "lucide-react"
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

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  const features = [
    {
      icon: Palette,
      title: "Custom Design Studio",
      description: "Create unique designs with our advanced editor and canvas tools",
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Quick delivery with real-time tracking via Shiprocket integration",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Multiple payment options with SSL encryption and security",
    },
    {
      icon: Users,
      title: "Marketplace",
      description: "Join thousands of sellers and buyers in our growing community",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  🎨 Print-on-Demand Platform
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Create, Customize &<span className="text-yellow-300"> Sell</span> with
                  <span className="text-pink-300"> Draprly</span>
                </h1>
                <p className="text-xl text-white/90 max-w-lg">
                  Transform your ideas into premium custom clothing and accessories. Design, print, and sell with our
                  all-in-one e-commerce platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/design">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
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
                  <span>10,000+ Happy Customers</span>
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
            </div>
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
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <feature.icon className="h-8 w-8 text-blue-600" />
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
              <p className="text-xl text-gray-600">Discover our most popular custom designs</p>
            </div>
            <Link href="/products">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
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
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
