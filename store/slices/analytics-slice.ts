import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

interface SalesData {
  date: string
  revenue: number
  orders: number
  customers: number
}

interface ProductAnalytics {
  _id: string
  name: string
  category: string
  revenue: number
  orders: number
  views: number
  conversionRate: number
  averageRating: number
}

interface CustomerAnalytics {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  averageOrderValue: number
  customerLifetimeValue: number
  topCustomers: Array<{
    _id: string
    name: string
    email: string
    totalOrders: number
    totalSpent: number
  }>
}

interface TrafficAnalytics {
  totalViews: number
  uniqueVisitors: number
  bounceRate: number
  averageSessionDuration: number
  topPages: Array<{
    page: string
    views: number
    uniqueViews: number
  }>
  trafficSources: Array<{
    source: string
    visitors: number
    percentage: number
  }>
}

interface AnalyticsState {
  salesData: SalesData[]
  productAnalytics: ProductAnalytics[]
  customerAnalytics: CustomerAnalytics | null
  trafficAnalytics: TrafficAnalytics | null
  loading: boolean
  error: string | null
  dateRange: {
    start: string
    end: string
  }
  dashboardStats: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    averageOrderValue: number
    revenueGrowth: number
    orderGrowth: number
    customerGrowth: number
  }
}

const initialState: AnalyticsState = {
  salesData: [],
  productAnalytics: [],
  customerAnalytics: null,
  trafficAnalytics: null,
  loading: false,
  error: null,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    end: new Date().toISOString().split("T")[0], // today
  },
  dashboardStats: {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0,
  },
}

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  "analytics/fetchDashboardStats",
  async (dateRange: { start: string; end: string }) => {
    const response = await fetch(`/api/analytics/dashboard?start=${dateRange.start}&end=${dateRange.end}`)
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats")
    }
    return response.json()
  },
)

export const fetchSalesData = createAsyncThunk(
  "analytics/fetchSalesData",
  async (params: { start: string; end: string; interval?: string }) => {
    const searchParams = new URLSearchParams({
      start: params.start,
      end: params.end,
      interval: params.interval || "day",
    })

    const response = await fetch(`/api/analytics/sales?${searchParams}`)
    if (!response.ok) {
      throw new Error("Failed to fetch sales data")
    }
    return response.json()
  },
)

export const fetchProductAnalytics = createAsyncThunk(
  "analytics/fetchProductAnalytics",
  async (params: { start: string; end: string; limit?: number }) => {
    const searchParams = new URLSearchParams({
      start: params.start,
      end: params.end,
      limit: (params.limit || 10).toString(),
    })

    const response = await fetch(`/api/analytics/products?${searchParams}`)
    if (!response.ok) {
      throw new Error("Failed to fetch product analytics")
    }
    return response.json()
  },
)

export const fetchCustomerAnalytics = createAsyncThunk(
  "analytics/fetchCustomerAnalytics",
  async (dateRange: { start: string; end: string }) => {
    const response = await fetch(`/api/analytics/customers?start=${dateRange.start}&end=${dateRange.end}`)
    if (!response.ok) {
      throw new Error("Failed to fetch customer analytics")
    }
    return response.json()
  },
)

export const fetchTrafficAnalytics = createAsyncThunk(
  "analytics/fetchTrafficAnalytics",
  async (dateRange: { start: string; end: string }) => {
    const response = await fetch(`/api/analytics/traffic?start=${dateRange.start}&end=${dateRange.end}`)
    if (!response.ok) {
      throw new Error("Failed to fetch traffic analytics")
    }
    return response.json()
  },
)

export const generateReport = createAsyncThunk(
  "analytics/generateReport",
  async (params: { type: string; start: string; end: string; format: string }) => {
    const response = await fetch("/api/analytics/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error("Failed to generate report")
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${params.type}-report-${params.start}-to-${params.end}.${params.format}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return { success: true }
  },
)

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
      state.dateRange = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardStats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch dashboard stats"
      })
      // Sales data
      .addCase(fetchSalesData.fulfilled, (state, action) => {
        state.salesData = action.payload
      })
      // Product analytics
      .addCase(fetchProductAnalytics.fulfilled, (state, action) => {
        state.productAnalytics = action.payload
      })
      // Customer analytics
      .addCase(fetchCustomerAnalytics.fulfilled, (state, action) => {
        state.customerAnalytics = action.payload
      })
      // Traffic analytics
      .addCase(fetchTrafficAnalytics.fulfilled, (state, action) => {
        state.trafficAnalytics = action.payload
      })
      // Generate report
      .addCase(generateReport.rejected, (state, action) => {
        state.error = action.error.message || "Failed to generate report"
      })
  },
})

export const { setDateRange, clearError } = analyticsSlice.actions
export default analyticsSlice.reducer
