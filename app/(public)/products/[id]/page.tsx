"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import { ProductCard } from "@/components/product/product-card"
import { ReviewSection } from "@/components/product/review-section"
import { ShareDialog } from "@/components/product/share-dialog"

interface ProductPageProps {
  params: { id: string }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [copied, setCopied] = useState(false)

  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    fetchProduct()
    fetchRelatedProducts()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()
      setProduct(data)
      if (data.sizes?.length > 0) setSelectedSize(data.sizes[0])
      if (data.colors?.length > 0) setSelectedColor(data.colors[0])
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`/api/products?category=${product?.category}&limit=4`)
      const data = await response.json()
      setRelatedProducts(data.products?.filter((p: any) => p._id !== params.id) || [])
    } catch (error) {
      console.error("Error fetching related products:", error)
    }
  }

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: "Please select size and color",
        variant: "destructive",
      })
      return
    }

    try {
      await addToCart({
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      })

      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    // Redirect to checkout
    window.location.href = "/checkout"
  }

  const shareProduct = async (platform: string) => {
    const url = window.location.href
    const text = `Check out this amazing product: ${product.name}`

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
        )
        break
      case "instagram":
        // Instagram doesn't support direct sharing, copy link instead
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({ title: "Link copied to clipboard!" })
        break
      case "copy":
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({ title: "Link copied to clipboard!" })
        break
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600">
            Products
          </Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-blue-600">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.badge && <Badge className="absolute top-4 left-4 bg-red-500 text-white">{product.badge}</Badge>}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative overflow-hidden rounded border-2 transition-colors ${
                    selectedImage === index ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
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
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowShareDialog(true)}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.averageRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.reviews?.length || 0} reviews)</span>
              <span className="text-sm text-gray-600">{product.views || 0} views</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                  <Badge variant="destructive">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Product Options */}
          <div className="space-y-4">
            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size: <span className="font-bold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color: <span className="font-bold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        selectedColor === color
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  disabled={quantity >= (product.stock || 10)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 ml-4">{product.stock || 0} in stock</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={handleAddToCart} className="flex-1" disabled={!product.stock || product.stock === 0}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="flex-1 bg-transparent"
                disabled={!product.stock || product.stock === 0}
              >
                Buy Now
              </Button>
            </div>

            {(!product.stock || product.stock === 0) && (
              <p className="text-red-600 text-sm text-center">Out of stock</p>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Free Shipping</p>
              <p className="text-xs text-gray-600">On orders over ₹999</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Secure Payment</p>
              <p className="text-xs text-gray-600">100% secure checkout</p>
            </div>
            <div className="text-center">
              <RotateCcw className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-gray-600">30-day return policy</p>
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
                  <p className="text-gray-700 leading-relaxed">{product.longDescription || product.description}</p>

                  {product.features && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Features</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {product.features.map((feature: string, index: number) => (
                          <li key={index} className="text-gray-700">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Product Details</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Category:</dt>
                        <dd className="font-medium">{product.category}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Material:</dt>
                        <dd className="font-medium">{product.material || "Cotton Blend"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Weight:</dt>
                        <dd className="font-medium">{product.weight || "200g"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Care:</dt>
                        <dd className="font-medium">{product.care || "Machine wash cold"}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Dimensions</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Length:</dt>
                        <dd className="font-medium">{product.dimensions?.length || "Varies by size"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Width:</dt>
                        <dd className="font-medium">{product.dimensions?.width || "Varies by size"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Available Sizes:</dt>
                        <dd className="font-medium">{product.sizes?.join(", ") || "One Size"}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ReviewSection productId={product._id} reviews={product.reviews || []} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct: any) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        product={product}
        onShare={shareProduct}
        copied={copied}
      />
    </div>
  )
}
