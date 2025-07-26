const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external"

let authToken: string | null = null
let tokenExpiry = 0

async function getAuthToken() {
  if (authToken && Date.now() < tokenExpiry) {
    return authToken
  }

  const response = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  })

  const data = await response.json()
  authToken = data.token
  tokenExpiry = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

  return authToken
}

export async function createShipment(order: any, shippingAddress: any) {
  const token = await getAuthToken()

  const shipmentData = {
    order_id: order.orderNumber,
    order_date: order.createdAt,
    pickup_location: "Primary",
    billing_customer_name: shippingAddress.name,
    billing_last_name: "",
    billing_address: shippingAddress.street,
    billing_city: shippingAddress.city,
    billing_pincode: shippingAddress.zipCode,
    billing_state: shippingAddress.state,
    billing_country: shippingAddress.country,
    billing_email: shippingAddress.email,
    billing_phone: shippingAddress.phone,
    shipping_is_billing: true,
    order_items: order.items.map((item: any) => ({
      name: item.name,
      sku: item.product,
      units: item.quantity,
      selling_price: item.price,
    })),
    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: order.subtotal,
    length: 10,
    breadth: 10,
    height: 5,
    weight: 0.5,
  }

  const response = await fetch(`${SHIPROCKET_API_URL}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(shipmentData),
  })

  return response.json()
}

export async function trackShipment(awbCode: string) {
  const token = await getAuthToken()

  const response = await fetch(`${SHIPROCKET_API_URL}/courier/track/awb/${awbCode}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.json()
}

export async function getShippingRates(pickup_postcode: string, delivery_postcode: string, weight: number) {
  const token = await getAuthToken()

  const response = await fetch(
    `${SHIPROCKET_API_URL}/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response.json()
}
