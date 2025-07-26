"use client"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">D</span>
              </div>
              <span className="font-bold text-xl">Draprly</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Create, customize, and sell premium custom clothing and accessories with our advanced design tools.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/products" className="block text-sm text-muted-foreground hover:text-foreground">
                {t("nav.products")}
              </Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">
                {t("nav.about")}
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">
                {t("nav.contact")}
              </Link>
              <Link href="/faq" className="block text-sm text-muted-foreground hover:text-foreground">
                FAQ
              </Link>
              <Link href="/support" className="block text-sm text-muted-foreground hover:text-foreground">
                Support
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Service</h3>
            <div className="space-y-2">
              <Link href="/shipping" className="block text-sm text-muted-foreground hover:text-foreground">
                Shipping Info
              </Link>
              <Link href="/returns" className="block text-sm text-muted-foreground hover:text-foreground">
                Returns & Exchanges
              </Link>
              <Link href="/size-guide" className="block text-sm text-muted-foreground hover:text-foreground">
                Size Guide
              </Link>
              <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Connected</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@draprly.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 12345 67890</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Mumbai, India</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Subscribe to our newsletter</p>
              <div className="flex space-x-2">
                <Input placeholder="Enter your email" className="flex-1" />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">© 2024 Draprly. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link href="/seller/register" className="text-sm text-muted-foreground hover:text-foreground">
              Become a Seller
            </Link>
            <Link href="/affiliate" className="text-sm text-muted-foreground hover:text-foreground">
              Affiliate Program
            </Link>
            <Link href="/api-docs" className="text-sm text-muted-foreground hover:text-foreground">
              API Documentation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
