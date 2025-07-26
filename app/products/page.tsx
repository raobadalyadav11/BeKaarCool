"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Filter, Search, Star, ShoppingCart, Heart, Grid3X3, List, SlidersHorizontal } from "lucide-react"
import Image from "next/image"

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("featured")

  const products = [
    {
      id: 1,
      name: "Premium Cotton T-Shirt",
      price: 599,
      originalPrice: 799,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.8,
      reviews: 124,
      badge: "Bestseller",
      category: "T-Shirts",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "White", "Navy", "Gray"],
    },
    {
      id: 2,
      name: "Custom Design Hoodie",
      price: 1299,
      originalPrice: 1599,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.9,
      reviews: 89,
      badge: "New",
      category: "Hoodies",
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Black", "Gray", "Navy"],
    },
    {
      id: 3,
      name: "Canvas Tote Bag",
      price: 399,
      originalPrice: 499,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.7,
      reviews: 156,
      badge: "Eco-Friendly",
      category: "Accessories",
      sizes: ["One Size"],
      colors: ["Natural", "Black", "Navy"],
    },
    {
      id: 4,
      name: "Vintage Style T-Shirt",
      price: 699,
      originalPrice: 899,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.6,
      reviews: 203,
      badge: "Limited",
      category: "T-Shirts",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Vintage White", "Heather Gray", "Olive"],
    },
    {
      id: 5,
      name: "Zip-Up Hoodie",
      price: 1499,
      originalPrice: 1799,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.8,
      reviews: 67,
      badge: "Popular",
      category: "Hoodies",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Black", "Gray", "Navy", "Maroon"],
    },
    {
      id: 6,
      name: "Phone Case Custom",
      price: 299,
      originalPrice: 399,
      image: "/placeholder.svg?height=400&width=400",
      rating: 4.5,
      reviews: 89,
      badge: "Customizable",
      category: "Accessories",
      sizes: ["iPhone", "Samsung", "OnePlus"],
      colors: ["Clear", "Black", "White"],
    },
  ]

  const categories = ["T-Shirts", "Hoodies", "Accessories"]
  const sizes = ["S", "M", "L", "XL", "XXL", "One Size"]

  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category)
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1]
    const sizeMatch = selectedSizes.length === 0 || product.sizes.some((size) => selectedSizes.includes(size))

    return categoryMatch && priceMatch && sizeMatch
  })

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category])
                  } else {
                    setSelectedCategories(selectedCategories.filter((c) => c !== category))
                  }
                }}
              />
              <label htmlFor={category} className="text-sm font-medium">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-3">
          <Slider value={priceRange} onValueChange={setPriceRange} max={2000} min={0} step={50} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="font-semibold mb-3">Sizes</h3>
        <div className="space-y-2">
          {sizes.map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={size}
                checked={selectedSizes.includes(size)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedSizes([...selectedSizes, size])
                  } else {
                    setSelectedSizes(selectedSizes.filter((s) => s !== size))
                  }
                }}
              />
              <label htmlFor={size} className="text-sm font-medium">
                {size}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-600">Discover our complete collection of custom products</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-64 space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              Filters
            </h2>
            <FilterContent />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Controls */}
          <div className="bg-white p-4 rounded-lg border mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search products..." className="pl-10" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden bg-transparent">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          {/* Products Grid/List */}
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            }`}
          >
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`group hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                <div className={`relative ${viewMode === "list" ? "w-48" : ""}`}>
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                      viewMode === "list" ? "w-48 h-48" : "w-full h-64"
                    }`}
                  />
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white">{product.badge}</Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className={viewMode === "list" ? "flex justify-between items-start" : ""}>
                    <div className={viewMode === "list" ? "flex-1" : ""}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({product.reviews})</span>
                      </div>

                      {viewMode === "list" && (
                        <div className="mb-4">
                          <p className="text-gray-600 mb-2">Available sizes: {product.sizes.join(", ")}</p>
                          <p className="text-gray-600">Colors: {product.colors.join(", ")}</p>
                        </div>
                      )}
                    </div>

                    <div className={`${viewMode === "list" ? "text-right" : "flex items-center justify-between"}`}>
                      <div className={viewMode === "list" ? "mb-4" : "flex items-center gap-2"}>
                        <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                        <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
                      </div>
                      <Button className={viewMode === "list" ? "w-full" : ""}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
