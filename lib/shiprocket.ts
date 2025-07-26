interface ShiprocketAuth {
  token: string
  expiresAt: number
}

let authCache: ShiprocketAuth | null = null

async function getShiprocketToken(): Promise<string> {
  if (authCache && authCache.expiresAt > Date.now()) {
    return authCache.token
  }

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to authenticate with Shiprocket")
  }

  const data = await response.json()

  authCache = {
    token: data.token,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  }

  return data.token
}

export async function createShipment(order: any, shippingAddress: any) {
  const token = await getShiprocketToken()

  const shipmentData = {
    order_id: order.orderNumber,
    order_date: new Date().toISOString().split("T")[0],
    pickup_location: "Primary",
    billing_customer_name: shippingAddress.name,
    billing_last_name: "",
    billing_address: shippingAddress.street,
    billing_city: shippingAddress.city,
    billing_pincode: shippingAddress.zipCode,
    billing_state: shippingAddress.state,
    billing_country: shippingAddress.country || "India",
    billing_email: order.user.email,
    billing_phone: shippingAddress.phone,
    shipping_is_billing: true,
    order_items: order.items.map((item: any) => ({
      name: item.product.name,
      sku: item.product._id,
      units: item.quantity,
      selling_price: item.price,
    })),
    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: order.subtotal,
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5,
  }

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(shipmentData),
  })

  if (!response.ok) {
    throw new Error("Failed to create shipment")
  }

  return response.json()
}

export async function trackShipment(awbCode: string) {
  const token = await getShiprocketToken()

  const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to track shipment")
  }

  return response.json()
}

export async function getShippingRates(pickup_postcode: string, delivery_postcode: string, weight: number) {
  const token = await getShiprocketToken()

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/serviceability/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get shipping rates")
  }

  return response.json()
}
