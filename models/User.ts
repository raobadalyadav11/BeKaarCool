import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["customer", "seller", "admin"],
    default: "customer",
  },
  avatar: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  preferences: {
    language: {
      type: String,
      default: "en",
    },
    currency: {
      type: String,
      default: "INR",
    },
    newsletter: {
      type: Boolean,
      default: true,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      default: "light",
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetToken: String,
  resetTokenExpiry: Date,
  lastLogin: Date,
  affiliateCode: String,
  affiliateEarnings: {
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

userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ affiliateCode: 1 })

export const User = mongoose.models.User || mongoose.model("User", userSchema)
