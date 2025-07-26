import nodemailer from "nodemailer"

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Welcome to Draprly!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Draprly, ${name}!</h1>
        <p>Thank you for joining our custom print-on-demand platform.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse thousands of customizable products</li>
          <li>Create your own designs with our canvas editor</li>
          <li>Start selling your own products</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" 
           style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
          Start Shopping
        </a>
        <p>Best regards,<br>The Draprly Team</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendPasswordResetEmail(email: string, name: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Reset Your Password - Draprly",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <a href="${resetUrl}" 
           style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Draprly Team</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendOrderConfirmationEmail(email: string, name: string, order: any) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for your order. Here are the details:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order #${order.orderNumber}</h3>
          <p><strong>Total:</strong> ₹${order.total}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>

        <h3>Items Ordered:</h3>
        ${order.items
          .map(
            (item: any) => `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <p><strong>${item.name}</strong></p>
            <p>Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}</p>
            <p>Price: ₹${item.price}</p>
          </div>
        `,
          )
          .join("")}

        <p>We'll send you another email when your order ships.</p>
        <p>Best regards,<br>The Draprly Team</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendOrderStatusEmail(email: string, name: string, order: any) {
  const statusMessages = {
    confirmed: "Your order has been confirmed and is being processed.",
    processing: "Your order is currently being processed.",
    printed: "Your order has been printed and is ready for shipping.",
    shipped: "Your order has been shipped!",
    delivered: "Your order has been delivered successfully.",
    cancelled: "Your order has been cancelled.",
  }

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Order Update - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Update</h1>
        <p>Hi ${name},</p>
        <p>${statusMessages[order.status as keyof typeof statusMessages]}</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order #${order.orderNumber}</h3>
          <p><strong>Status:</strong> ${order.status}</p>
          ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ""}
        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}" 
           style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
          View Order Details
        </a>

        <p>Best regards,<br>The Draprly Team</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendSupportTicketEmail(ticket: any) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: process.env.SUPPORT_EMAIL,
    subject: `New Support Ticket - ${ticket.ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Support Ticket</h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Ticket #${ticket.ticketNumber}</h3>
          <p><strong>From:</strong> ${ticket.user.name} (${ticket.user.email})</p>
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
        </div>

        <h3>Description:</h3>
        <p>${ticket.description}</p>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/support/${ticket._id}" 
           style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
          View Ticket
        </a>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
