import mongoose from "mongoose"

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  price: Number,
  stock: Number,
  sku: String,
  images: [String],
})

const customizationAreaSchema = new mongoose.Schema({
  name: String,
  position: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
  },
  maxWidth: Number,
  maxHeight: Number,
  allowedTypes: [String], // text, image, shape
})

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    longDescription: {
      type: String,
      default: "",
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
    category: {
      type: String,
      required: true,
      enum: ["T-Shirts", "Hoodies", "Accessories", "Mugs", "Posters", "Phone Cases", "Bags", "Caps"],
    },
    subcategory: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    variants: [variantSchema],
    sizes: [
      {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"],
      },
    ],
    colors: [
      {
        name: String,
        hex: String,
        image: String,
      },
    ],
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
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    features: [
      {
        type: String,
      },
    ],
    specifications: {
      material: String,
      weight: String,
      care: String,
      origin: String,
      dimensions: {
        length: String,
        width: String,
        height: String,
      },
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    badge: {
      type: String,
      enum: ["New", "Bestseller", "Limited", "Popular", "Eco-Friendly", "Sale"],
      default: "",
    },
    seoTitle: {
      type: String,
      default: "",
    },
    seoDescription: {
      type: String,
      default: "",
    },
    seoKeywords: [String],
    customizable: {
      type: Boolean,
      default: false,
    },
    customizationAreas: [customizationAreaSchema],
    printingMethods: [
      {
        type: String,
        enum: ["DTG", "Screen Print", "Vinyl", "Embroidery", "Sublimation"],
      },
    ],
    qrCode: {
      data: String,
      image: String,
    },
    affiliateCommission: {
      type: Number,
      default: 5, // 5% affiliate commission
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
    },
    maxOrderQuantity: {
      type: Number,
      default: 100,
    },
    shippingInfo: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      shippingClass: {
        type: String,
        enum: ["standard", "express", "overnight"],
        default: "standard",
      },
    },
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "out_of_stock"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
)

productSchema.index({ name: "text", description: "text", tags: "text" })
productSchema.index({ category: 1 })
productSchema.index({ price: 1 })
productSchema.index({ seller: 1 })
productSchema.index({ featured: -1, createdAt: -1 })
productSchema.index({ averageRating: -1 })
productSchema.index({ slug: 1 })
productSchema.index({ isActive: 1, status: 1 })

// Generate slug before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
  next()
})

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema)
