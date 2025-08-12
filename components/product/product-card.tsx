"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Eye, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: any
  viewMode?: "grid" | "list"
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock === 0) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          size: product.variations?.sizes?.[0] || "M",
          color: product.variations?.colors?.[0] || "Black",
        }),
      })

      if (response.ok) {
        toast({
          title: "Added to cart!",
          description: `${product.name} has been added to your cart.`,
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to add to cart")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Please login to add items to cart.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)

    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`,
    })
  }

  const discountPercentage = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <Link href={`/products/${product._id}`} className="block">
      <Card
        className={`group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border hover:border-primary/20 shadow-sm hover:shadow-2xl hover:-translate-y-1 ${
          viewMode === "list" ? "flex" : ""
        }`}
      >
        <div className={`relative ${viewMode === "list" ? "w-48" : ""}`}>
          <div className="relative overflow-hidden">
            <Image
              src={product.images?.[0] || "/placeholder.svg"}
              alt={product.name}
              width={400}
              height={400}
              className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
                viewMode === "list" ? "w-48 h-48" : "w-full h-64"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Featured Badge */}
          {product.featured && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
              {discountPercentage}% OFF
            </Badge>
          )}

          {/* Hover Actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 space-y-2">
            {!discountPercentage && (
              <>
                <Button size="sm" variant="secondary" onClick={handleWishlist} className="w-10 h-10 p-0 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border">
                  <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"}`} />
                </Button>
                <Button size="sm" variant="secondary" className="w-10 h-10 p-0 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm border">
                  <Eye className="h-4 w-4 text-gray-600 hover:text-primary" />
                </Button>
              </>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Customizable Badge */}
          {product.customizable && (
            <Badge className="absolute bottom-3 left-3 bg-blue-500 text-white border-0">
              Customizable
            </Badge>
          )}
        </div>

        <CardContent className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
          <div className={viewMode === "list" ? "flex justify-between items-start" : ""}>
            <div className={viewMode === "list" ? "flex-1" : ""}>
              {/* Product Name */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                {product.name}
              </h3>

              {/* Rating and Stats */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviews?.length || 0})</span>
                {product.sold > 0 && (
                  <span className="text-sm text-green-600 font-medium">{product.sold} sold</span>
                )}
              </div>

              {/* Description for List View */}
              {viewMode === "list" && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{product.description}</p>
                  {product.variations?.sizes && product.variations.sizes.length > 0 && (
                    <p className="text-gray-600 text-sm mb-1">Sizes: {product.variations.sizes.join(", ")}</p>
                  )}
                  {product.variations?.colors && product.variations.colors.length > 0 && (
                    <p className="text-gray-600 text-sm">Colors: {product.variations.colors.join(", ")}</p>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
                )}
              </div>

              {/* Seller Info */}
              {product.seller && (
                <p className="text-sm text-gray-600 mb-4">
                  by <span className="font-medium text-blue-600">{product.seller.name}</span>
                </p>
              )}

              {/* Category and Tags */}
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
                {product.brand && (
                  <Badge variant="outline" className="text-xs">
                    {product.brand}
                  </Badge>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className={`${viewMode === "list" ? "text-right ml-4" : ""}`}>
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isLoading}
                className={`${viewMode === "list" ? "w-full" : "w-full"} bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105`}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
