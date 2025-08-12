"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch } from "@/store"
import { addToCart } from "@/store/slices/cart-slice"

interface ProductCardProps {
  product: any
  viewMode?: "grid" | "list"
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await dispatch(addToCart({
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0] || "M",
        color: product.colors?.[0] || "Black",
      })).unwrap()

      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      })
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

  return (
    <Link href={`/products/${product._id}`} className="block">
      <Card
        className={`group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${
          viewMode === "list" ? "flex" : ""
        }`}
      >
        <div className={`relative ${viewMode === "list" ? "w-48" : ""}`}>
          <Image
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            width={400}
            height={400}
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
              viewMode === "list" ? "w-48 h-48" : "w-full h-64"
            }`}
          />

          {product.badge && <Badge className="absolute top-4 left-4 bg-red-500 text-white">{product.badge}</Badge>}

          {product.originalPrice && product.originalPrice > product.price && (
            <Badge className="absolute top-4 right-4 bg-green-500 text-white">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Badge>
          )}

          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
            <Button size="sm" variant="secondary" onClick={handleWishlist} className="w-10 h-10 p-0">
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button size="sm" variant="secondary" className="w-10 h-10 p-0">
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <CardContent className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
          <div className={viewMode === "list" ? "flex justify-between items-start" : ""}>
            <div className={viewMode === "list" ? "flex-1" : ""}>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>

              <div className="flex items-center gap-2 mb-3">
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
                <span className="text-sm text-gray-600">({product.reviewCount || 0})</span>
                {product.views && <span className="text-sm text-gray-500">• {product.views} views</span>}
              </div>

              {viewMode === "list" && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{product.description}</p>
                  {product.sizes && product.sizes.length > 0 && (
                    <p className="text-gray-600 text-sm mb-1">Sizes: {product.sizes.join(", ")}</p>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <p className="text-gray-600 text-sm">Colors: {product.colors.join(", ")}</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
                )}
              </div>

              {product.seller && (
                <p className="text-sm text-gray-600 mb-4">
                  by <span className="font-medium">{product.seller.name}</span>
                </p>
              )}
            </div>

            <div className={`${viewMode === "list" ? "text-right ml-4" : "flex items-center justify-between"}`}>
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={viewMode === "list" ? "w-full" : ""}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
