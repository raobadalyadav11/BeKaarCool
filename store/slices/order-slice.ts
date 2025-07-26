import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

interface OrderItem {
  _id: string
  product: {
    _id: string
    name: string
    images: string[]
    price: number
  }
  quantity: number
  size: string
  color: string
  price: number
  customization?: {
    design?: string
    text?: string
    position?: { x: number; y: number }
    font?: string
    textColor?: string
  }
}

interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  shippingAddress: {
    name: string
    phone: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  billingAddress?: {
    name: string
    phone: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  paymentId?: string
  paymentStatus: string
  total: number
  subtotal: number
  shipping: number
  tax: number
  discount: number
  couponCode?: string
  status: string
  trackingNumber?: string
  estimatedDelivery?: string
  deliveredAt?: string
  cancelledAt?: string
  refundedAt?: string
  refundAmount?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    status: string
    dateRange: {
      start: string
      end: string
    }
  }
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    status: "all",
    dateRange: {
      start: "",
      end: "",
    },
  },
}

// Async thunks
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
    })

    if (params.status && params.status !== "all") {
      searchParams.append("status", params.status)
    }

    const response = await fetch(`/api/orders?${searchParams}`)
    if (!response.ok) {
      throw new Error("Failed to fetch orders")
    }
    return response.json()
  },
)

export const fetchOrderById = createAsyncThunk("orders/fetchOrderById", async (orderId: string) => {
  const response = await fetch(`/api/orders/${orderId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch order")
  }
  return response.json()
})

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData: {
    items: OrderItem[]
    shippingAddress: any
    billingAddress?: any
    paymentMethod: string
    paymentId?: string
    total: number
    subtotal: number
    shipping: number
    tax: number
    discount: number
    couponCode?: string
    affiliateCode?: string
  }) => {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create order")
    }

    return response.json()
  },
)

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) => {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, notes }),
    })

    if (!response.ok) {
      throw new Error("Failed to update order status")
    }

    return response.json()
  },
)

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ orderId, reason }: { orderId: string; reason: string }) => {
    const response = await fetch(`/api/orders/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      throw new Error("Failed to cancel order")
    }

    return response.json()
  },
)

export const requestRefund = createAsyncThunk(
  "orders/requestRefund",
  async ({ orderId, reason, amount }: { orderId: string; reason: string; amount?: number }) => {
    const response = await fetch(`/api/orders/${orderId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason, amount }),
    })

    if (!response.ok) {
      throw new Error("Failed to request refund")
    }

    return response.json()
  },
)

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<OrderState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPagination: (state, action: PayloadAction<Partial<OrderState["pagination"]>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.orders
        state.pagination = action.payload.pagination
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch orders"
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch order"
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.orders.unshift(action.payload)
        state.currentOrder = action.payload
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to create order"
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((order) => order._id === action.payload._id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload
        }
      })
      // Cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex((order) => order._id === action.payload._id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload
        }
      })
      // Request refund
      .addCase(requestRefund.fulfilled, (state, action) => {
        const index = state.orders.findIndex((order) => order._id === action.payload._id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (state.currentOrder?._id === action.payload._id) {
          state.currentOrder = action.payload
        }
      })
  },
})

export const { setFilters, setPagination, clearCurrentOrder, clearError } = orderSlice.actions
export default orderSlice.reducer
