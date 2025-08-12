"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw, 
  Palette,
  Plus,
  Minus,
  ArrowLeft,
  Zap
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch } from "@/store"
import { addToCart } from "@/store/slices/cart-slice"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

interface Product {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  tags: string[]
  variations: {
    sizes: string[]
    colors: string[]
  }
  stock: number
  sold: number
  rating: number
  reviews: any[]
  featured: boolean
  customizable: boolean
  seller: {
    _id: string
    name: string
  }
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const dispatch = useAppDispatch()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [productId, setProductId] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setProductId(id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    if (!productId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (!response.ok) {
        throw new Error("Product not found")
      }
      const data = await response.json()
      setProduct(data)
      
      // Set default selections
      if (data.variations?.sizes?.length > 0) {
        setSelectedSize(data.variations.sizes[0])
      }
      if (data.variations?.colors?.length > 0) {
        setSelectedColor(data.variations.colors[0])
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (product.variations?.sizes?.length > 0 && !selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size",
        variant: "destructive",
      })
      return
    }

    if (product.variations?.colors?.length > 0 && !selectedColor) {
      toast({
        title: "Color Required", 
        description: "Please select a color",
        variant: "destructive",
      })
      return
    }

    setAddingToCart(true)
    try {
      await dispatch(addToCart({
        productId: product._id,
        quantity,
        size: selectedSize || "M",
        color: selectedColor || "Default",
      })).unwrap()

      toast({
        title: "Added to Cart!",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return

    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to purchase",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (product.variations?.sizes?.length > 0 && !selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size",
        variant: "destructive",
      })
      return
    }

    if (product.variations?.colors?.length > 0 && !selectedColor) {
      toast({
        title: "Color Required",
        description: "Please select a color", 
        variant: "destructive",
      })
      return
    }

    try {
      // Add to cart first
      await dispatch(addToCart({
        productId: product._id,
        quantity,
        size: selectedSize || "M",
        color: selectedColor || "Default",
      })).unwrap()

      // Redirect to checkout
      router.push("/checkout")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to proceed to checkout",
        variant: "destructive",
      })
    }
  }

  const handleCustomize = () => {
    if (!product) return
    router.push(`/design?product=${product._id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/products">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-900">Products</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.originalPrice && (
              <Badge className="absolute top-4 left-4 bg-red-500">
                {discount}% OFF
              </Badge>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative overflow-hidden rounded border-2 transition-colors ${
                    selectedImage === index ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({product.reviews?.length || 0} reviews)
                </span>
              </div>
              <Badge variant="outline">{product.category}</Badge>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Variations */}
          <div className="space-y-4">
            {product.variations?.sizes?.length > 0 && (
              <div>
                <Label className="text-base font-medium mb-3 block">Size</Label>
                <div className="flex flex-wrap gap-2">
                  {product.variations.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {product.variations?.colors?.length > 0 && (
              <div>
                <Label className="text-base font-medium mb-3 block">Color</Label>
                <div className="flex flex-wrap gap-2">
                  {product.variations.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-base font-medium mb-3 block">Quantity</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min="1"
                  max={product.stock}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {product.stock} available
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                onClick={handleBuyNow}
                size="lg"
                className="flex-1"
                disabled={product.stock === 0}
              >
                <Zap className="mr-2 h-5 w-5" />
                Buy Now
              </Button>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="flex-1"
                disabled={addingToCart || product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {addingToCart ? "Adding..." : "Add to Cart"}
              </Button>
            </div>

            {product.customizable && (
              <Button
                onClick={handleCustomize}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Palette className="mr-2 h-5 w-5" />
                Customize This Product
              </Button>
            )}

            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">
                <Heart className="mr-2 h-4 w-4" />
                Add to Wishlist
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Free Shipping</p>
                <p className="text-xs text-gray-600">On orders above ₹999</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Quality Guarantee</p>
                <p className="text-xs text-gray-600">100% satisfaction</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-xs text-gray-600">7-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews?.length || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  
                  {product.tags?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Product Details</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Category:</dt>
                        <dd className="font-medium">{product.category}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Stock:</dt>
                        <dd className="font-medium">{product.stock} units</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Sold:</dt>
                        <dd className="font-medium">{product.sold} units</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Customizable:</dt>
                        <dd className="font-medium">{product.customizable ? "Yes" : "No"}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  {product.variations && (
                    <div>
                      <h4 className="font-medium mb-3">Available Options</h4>
                      <dl className="space-y-2">
                        {product.variations.sizes?.length > 0 && (
                          <div>
                            <dt className="text-gray-600 mb-1">Sizes:</dt>
                            <dd className="font-medium">{product.variations.sizes.join(", ")}</dd>
                          </div>
                        )}
                        {product.variations.colors?.length > 0 && (
                          <div>
                            <dt className="text-gray-600 mb-1">Colors:</dt>
                            <dd className="font-medium">{product.variations.colors.join(", ")}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                  <Button className="mt-4" variant="outline">
                    Write a Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}