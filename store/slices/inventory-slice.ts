import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

interface InventoryItem {
  _id: string
  product: {
    _id: string
    name: string
    images: string[]
    category: string
    price: number
  }
  stock: number
  reserved: number
  available: number
  lowStockThreshold: number
  reorderPoint: number
  reorderQuantity: number
  supplier?: {
    name: string
    contact: string
    email: string
  }
  location?: {
    warehouse: string
    shelf: string
    bin: string
  }
  lastRestocked?: string
  createdAt: string
  updatedAt: string
}

interface StockMovement {
  _id: string
  product: string
  type: "in" | "out" | "adjustment"
  quantity: number
  reason: string
  reference?: string
  user: {
    _id: string
    name: string
  }
  createdAt: string
}

interface InventoryState {
  items: InventoryItem[]
  movements: StockMovement[]
  lowStockItems: InventoryItem[]
  outOfStockItems: InventoryItem[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    category: string
    status: string
    warehouse: string
  }
  stats: {
    totalProducts: number
    lowStockCount: number
    outOfStockCount: number
    totalValue: number
  }
}

const initialState: InventoryState = {
  items: [],
  movements: [],
  lowStockItems: [],
  outOfStockItems: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filters: {
    category: "all",
    status: "all",
    warehouse: "all",
  },
  stats: {
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0,
  },
}

// Async thunks
export const fetchInventory = createAsyncThunk(
  "inventory/fetchInventory",
  async (params: { page?: number; limit?: number; category?: string; status?: string; warehouse?: string }) => {
    const searchParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
    })

    if (params.category && params.category !== "all") {
      searchParams.append("category", params.category)
    }
    if (params.status && params.status !== "all") {
      searchParams.append("status", params.status)
    }
    if (params.warehouse && params.warehouse !== "all") {
      searchParams.append("warehouse", params.warehouse)
    }

    const response = await fetch(`/api/inventory?${searchParams}`)
    if (!response.ok) {
      throw new Error("Failed to fetch inventory")
    }
    return response.json()
  },
)

export const fetchInventoryStats = createAsyncThunk("inventory/fetchStats", async () => {
  const response = await fetch("/api/inventory/stats")
  if (!response.ok) {
    throw new Error("Failed to fetch inventory stats")
  }
  return response.json()
})

export const fetchStockMovements = createAsyncThunk(
  "inventory/fetchMovements",
  async (params: { page?: number; limit?: number; productId?: string }) => {
    const searchParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
    })

    if (params.productId) {
      searchParams.append("productId", params.productId)
    }

    const response = await fetch(`/api/inventory/movements?${searchParams}`)
    if (!response.ok) {
      throw new Error("Failed to fetch stock movements")
    }
    return response.json()
  },
)

export const updateStock = createAsyncThunk(
  "inventory/updateStock",
  async ({
    productId,
    quantity,
    type,
    reason,
    reference,
  }: {
    productId: string
    quantity: number
    type: "in" | "out" | "adjustment"
    reason: string
    reference?: string
  }) => {
    const response = await fetch(`/api/inventory/${productId}/stock`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity, type, reason, reference }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update stock")
    }

    return response.json()
  },
)

export const updateInventorySettings = createAsyncThunk(
  "inventory/updateSettings",
  async ({
    productId,
    lowStockThreshold,
    reorderPoint,
    reorderQuantity,
    supplier,
    location,
  }: {
    productId: string
    lowStockThreshold?: number
    reorderPoint?: number
    reorderQuantity?: number
    supplier?: any
    location?: any
  }) => {
    const response = await fetch(`/api/inventory/${productId}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lowStockThreshold,
        reorderPoint,
        reorderQuantity,
        supplier,
        location,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update inventory settings")
    }

    return response.json()
  },
)

export const bulkUpdateStock = createAsyncThunk(
  "inventory/bulkUpdateStock",
  async (
    updates: Array<{ productId: string; quantity: number; type: "in" | "out" | "adjustment"; reason: string }>,
  ) => {
    const response = await fetch("/api/inventory/bulk-update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates }),
    })

    if (!response.ok) {
      throw new Error("Failed to bulk update stock")
    }

    return response.json()
  },
)

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<InventoryState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPagination: (state, action: PayloadAction<Partial<InventoryState["pagination"]>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = action.payload.pagination
        state.lowStockItems = action.payload.lowStockItems || []
        state.outOfStockItems = action.payload.outOfStockItems || []
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch inventory"
      })
      // Fetch stats
      .addCase(fetchInventoryStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      // Fetch movements
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.movements = action.payload.movements
      })
      // Update stock
      .addCase(updateStock.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.product._id === action.payload.product._id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // Update settings
      .addCase(updateInventorySettings.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.product._id === action.payload.product._id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // Bulk update
      .addCase(bulkUpdateStock.fulfilled, (state, action) => {
        action.payload.forEach((updatedItem: InventoryItem) => {
          const index = state.items.findIndex((item) => item.product._id === updatedItem.product._id)
          if (index !== -1) {
            state.items[index] = updatedItem
          }
        })
      })
  },
})

export const { setFilters, setPagination, clearError } = inventorySlice.actions
export default inventorySlice.reducer
