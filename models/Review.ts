import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    size: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

reviewSchema.index({ product: 1 })
reviewSchema.index({ user: 1, product: 1 }, { unique: true })
reviewSchema.index({ rating: -1 })

export const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema)
