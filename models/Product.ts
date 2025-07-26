import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      enum: ["T-Shirts", "Hoodies", "Accessories", "Mugs", "Posters", "Phone Cases"],
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
    sizes: [
      {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL", "One Size"],
      },
    ],
    colors: [
      {
        type: String,
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
    material: {
      type: String,
      default: "",
    },
    weight: {
      type: String,
      default: "",
    },
    care: {
      type: String,
      default: "",
    },
    dimensions: {
      length: String,
      width: String,
      height: String,
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
      enum: ["New", "Bestseller", "Limited", "Popular", "Eco-Friendly", "Customizable"],
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
    customizable: {
      type: Boolean,
      default: false,
    },
    printAreas: [
      {
        name: String,
        position: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
      },
    ],
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

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema)
