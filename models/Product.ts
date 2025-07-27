import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  images: [String],
  videos: [String],
  category: {
    type: String,
    required: true,
  },
  tags: [String],
  variations: {
    sizes: [String],
    colors: [String],
    priceModifiers: {
      type: Map,
      of: Number,
    },
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  sold: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  featured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seo: {
    title: String,
    description: String,
    keywords: [String],
  },
  customizable: {
    type: Boolean,
    default: false,
  },
  qrCode: String,
  slug: {
    type: String,
    unique: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

productSchema.index({ name: "text", description: "text", tags: "text" })
productSchema.index({ category: 1 })
productSchema.index({ price: 1 })
productSchema.index({ rating: -1 })
productSchema.index({ featured: -1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ seller: 1 })

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema)
