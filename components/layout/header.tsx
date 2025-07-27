"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useLanguage } from "@/contexts/language-context"
import { useCurrency } from "@/contexts/currency-context"
import { Search, ShoppingCart, User, Menu, Globe, DollarSign, Sun, Moon, Palette, Store } from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { language, setLanguage, t } = useLanguage()
  const { currency, setCurrency } = useCurrency()
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [cartCount, setCartCount] = useState(0)

  const currencies = [
    { code: "INR", symbol: "₹", rate: 1 },
    { code: "USD", symbol: "$", rate: 0.012 },
    { code: "EUR", symbol: "€", rate: 0.011 },
    { code: "GBP", symbol: "£", rate: 0.0095 },
  ]

  useEffect(() => {
    if (session) {
      fetchCartCount()
    }
  }, [session])

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        const count = data.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0
        setCartCount(count)
      }
    } catch (error) {
      console.error("Error fetching cart count:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Draprly
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search products, designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
            Products
          </Link>
          <Link href="/design" className="text-sm font-medium hover:text-primary transition-colors flex items-center">
            <Palette className="h-4 w-4 mr-1" />
            Design
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage("en")}>English {language === "en" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("hi")}>हिंदी {language === "hi" && "✓"}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Currency Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <DollarSign className="h-4 w-4" />
                <span className="ml-1">{currency.code}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {currencies.map((curr) => (
                <DropdownMenuItem key={curr.code} onClick={() => setCurrency(curr)}>
                  {curr.symbol} {curr.code} {currency.code === curr.code && "✓"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="hidden sm:flex"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600">
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Menu */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-20 truncate">{session.user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                {session.user?.role === "seller" && (
                  <DropdownMenuItem asChild>
                    <Link href="/seller/dashboard" className="flex items-center">
                      <Store className="mr-2 h-4 w-4" />
                      Seller Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {session.user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center">
                      <Store className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </form>

                {/* Mobile Navigation */}
                <Link href="/products" className="text-lg font-medium py-2">
                  Products
                </Link>
                <Link href="/design" className="text-lg font-medium py-2 flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Design Studio
                </Link>
                <Link href="/about" className="text-lg font-medium py-2">
                  About
                </Link>
                <Link href="/contact" className="text-lg font-medium py-2">
                  Contact
                </Link>

                {/* Mobile User Actions */}
                {session ? (
                  <div className="pt-4 border-t space-y-2">
                    <Link href="/profile" className="block text-lg font-medium py-2">
                      Profile
                    </Link>
                    <Link href="/orders" className="block text-lg font-medium py-2">
                      My Orders
                    </Link>
                    {session.user?.role === "seller" && (
                      <Link href="/seller/dashboard" className="block text-lg font-medium py-2">
                        Seller Dashboard
                      </Link>
                    )}
                    {session.user?.role === "admin" && (
                      <Link href="/admin" className="block text-lg font-medium py-2">
                        Admin Dashboard
                      </Link>
                    )}
                    <Button onClick={handleSignOut} variant="outline" className="w-full mt-4 bg-transparent">
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t space-y-2">
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full bg-transparent">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
