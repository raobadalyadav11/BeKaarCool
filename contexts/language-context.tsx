"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.design": "Design Studio",
    "nav.about": "About",
    "nav.contact": "Contact",
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.total": "Total",
    "cart.checkout": "Checkout",
    "product.addToCart": "Add to Cart",
    "product.buyNow": "Buy Now",
    "product.outOfStock": "Out of Stock",
    "order.placed": "Order Placed Successfully",
    "order.tracking": "Track Order",
  },
  hi: {
    "nav.home": "होम",
    "nav.products": "उत्पाद",
    "nav.design": "डिज़ाइन स्टूडियो",
    "nav.about": "हमारे बारे में",
    "nav.contact": "संपर्क",
    "cart.title": "शॉपिंग कार्ट",
    "cart.empty": "आपका कार्ट खाली है",
    "cart.total": "कुल",
    "cart.checkout": "चेकआउट",
    "product.addToCart": "कार्ट में जोड़ें",
    "product.buyNow": "अभी खरीदें",
    "product.outOfStock": "स्टॉक में नहीं",
    "order.placed": "ऑर्डर सफलतापूर्वक दिया गया",
    "order.tracking": "ऑर्डर ट्रैक करें",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
