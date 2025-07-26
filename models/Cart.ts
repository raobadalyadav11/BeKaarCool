import mongoose from "mongoose"

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: {
    type: String,
    default: "M",
  },
  color: {
    type: String,
    default: "Default",
  },
  price: {
    type: Number,
    required: true,
  },
  customization: {
    design: String,
    text: String,
    position: {
      x: Number,
      y: Number,
    },
    font: String,
    textColor: String,
  },
})

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0,
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  shipping: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  couponCode: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

cartSchema.index({ user: 1 })

export const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema)
