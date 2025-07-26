import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [String],
    isInternal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "order_issue",
        "payment_issue",
        "product_issue",
        "shipping_issue",
        "account_issue",
        "technical_issue",
        "general_inquiry",
        "complaint",
        "suggestion",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_for_customer", "resolved", "closed"],
      default: "open",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    messages: [messageSchema],
    attachments: [String],
    tags: [String],
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    resolution: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Generate ticket number before saving
supportTicketSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("SupportTicket").countDocuments()
    this.ticketNumber = `TKT-${Date.now()}-${(count + 1).toString().padStart(4, "0")}`
  }
  next()
})

supportTicketSchema.index({ user: 1 })
supportTicketSchema.index({ status: 1 })
supportTicketSchema.index({ priority: 1 })
supportTicketSchema.index({ category: 1 })
supportTicketSchema.index({ createdAt: -1 })
supportTicketSchema.index({ ticketNumber: 1 })

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model("SupportTicket", supportTicketSchema)
