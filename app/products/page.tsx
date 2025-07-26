"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Filter, Search, Grid3X3, List, SlidersHorizontal, Loader2 } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import { useDebounce } from "@/hooks/use-debounce"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("featured")
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  })

  const debouncedSearch = useDebounce(searchQuery, 500)

  const categories = ["T-Shirts", "Hoodies", "Accessories", "Mugs", "Posters"]
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"]

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: sortBy,
      })

      if (debouncedSearch) params.append("search", debouncedSearch)
      if (selectedCategories.length > 0) params.append("category", selectedCategories.join(","))
      if (priceRange[0] > 0) params.append("minPrice", priceRange[0].toString())
      if (priceRange[1] < 5000) params.append("maxPrice", priceRange[1].toString())

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      setProducts(data.products || [])
      setPagination(data.pagination || pagination)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [pagination.page, sortBy, debouncedSearch, selectedCategories, priceRange])

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
              <label htmlFor={category} className="text-sm font-medium cursor-pointer">
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
          <Slider value={priceRange} onValueChange={setPriceRange} max={5000} min={0} step={100} className="w-full" />
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
              <label htmlFor={size} className="text-sm font-medium cursor-pointer">
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
          <div className="bg-white p-6 rounded-lg border sticky top-24">
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
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
              Showing {products.length} of {pagination.total} products
            </p>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} viewMode={viewMode} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
