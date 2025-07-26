"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface CurrencyContextType {
  currency: string
  setCurrency: (currency: string) => void
  formatPrice: (price: number) => string
  convertPrice: (price: number) => number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const exchangeRates = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
}

const currencySymbols = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("INR")

  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency")
    if (savedCurrency) {
      setCurrency(savedCurrency)
    }
  }, [])

  const handleSetCurrency = (newCurrency: string) => {
    setCurrency(newCurrency)
    localStorage.setItem("currency", newCurrency)
  }

  const convertPrice = (price: number): number => {
    const rate = exchangeRates[currency as keyof typeof exchangeRates]
    return Math.round(price * rate * 100) / 100
  }

  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price)
    const symbol = currencySymbols[currency as keyof typeof currencySymbols]
    return `${symbol}${convertedPrice.toLocaleString()}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
