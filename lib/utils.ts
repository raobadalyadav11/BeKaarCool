import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat("en-IN").format(number)
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
    case "delivered":
    case "paid":
    case "completed":
      return "bg-green-100 text-green-800"
    case "inactive":
    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-800"
    case "pending":
    case "processing":
      return "bg-yellow-100 text-yellow-800"
    case "shipped":
    case "in-transit":
      return "bg-blue-100 text-blue-800"
    case "draft":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `DR${timestamp.slice(-6)}${random}`
}

export function generateTrackingNumber(orderNumber: string) {
  return `${orderNumber}TRK`
}

export function calculateDiscount(
  price: number,
  discountType: "percentage" | "fixed",
  discountValue: number,
  maxDiscount?: number,
) {
  if (discountType === "percentage") {
    const discount = (price * discountValue) / 100
    return maxDiscount ? Math.min(discount, maxDiscount) : discount
  } else {
    return Math.min(discountValue, price)
  }
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string) {
  const phoneRegex = /^[+]?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

export function validatePincode(pincode: string) {
  const pincodeRegex = /^[1-9][0-9]{5}$/
  return pincodeRegex.test(pincode)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateSKU(category: string, brand: string, index: number) {
  const categoryCode = category.substring(0, 2).toUpperCase()
  const brandCode = brand.substring(0, 2).toUpperCase()
  const indexCode = index.toString().padStart(3, "0")
  return `${categoryCode}${brandCode}${indexCode}`
}

export function calculateShipping(weight: number, distance: number, zone: string) {
  const baseRate = 50
  const weightRate = weight * 10
  const distanceRate = distance * 0.5

  let zoneMultiplier = 1
  switch (zone.toLowerCase()) {
    case "metro":
      zoneMultiplier = 1
      break
    case "urban":
      zoneMultiplier = 1.2
      break
    case "rural":
      zoneMultiplier = 1.5
      break
    default:
      zoneMultiplier = 1
  }

  return Math.round((baseRate + weightRate + distanceRate) * zoneMultiplier)
}

export function getDeliveryEstimate(zone: string, shippingMethod: string) {
  const estimates = {
    metro: {
      standard: "2-3 days",
      express: "1-2 days",
      same_day: "Same day",
    },
    urban: {
      standard: "3-5 days",
      express: "2-3 days",
      same_day: "Not available",
    },
    rural: {
      standard: "5-7 days",
      express: "3-5 days",
      same_day: "Not available",
    },
  }

  return estimates[zone as keyof typeof estimates]?.[shippingMethod as keyof typeof estimates.metro] || "5-7 days"
}

export function isValidIndianPincode(pincode: string) {
  return /^[1-9][0-9]{5}$/.test(pincode)
}

export function getZoneFromPincode(pincode: string) {
  const firstDigit = Number.parseInt(pincode.charAt(0))

  // Metro cities (approximate)
  const metroPincodes = ["110", "400", "560", "600", "700", "500"]
  if (metroPincodes.some((metro) => pincode.startsWith(metro))) {
    return "metro"
  }

  // Urban areas (state capitals and major cities)
  if (firstDigit <= 4) {
    return "urban"
  }

  return "rural"
}

export function sanitizeHtml(html: string) {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
}

export function generateRandomString(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function isValidGST(gst: string) {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstRegex.test(gst)
}

export function isValidPAN(pan: string) {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  return panRegex.test(pan)
}

export function calculateTax(amount: number, taxRate = 18) {
  return (amount * taxRate) / 100
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getTimeAgo(date: string | Date) {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`

  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}
