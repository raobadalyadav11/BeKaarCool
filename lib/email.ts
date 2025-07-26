import nodemailer from "nodemailer"

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
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
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a>
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
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>You requested a password reset for your Draprly account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
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
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Order #${order.orderNumber}</h3>
          <p><strong>Total:</strong> ₹${order.total}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>
        <p>We'll send you another email when your order ships.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Order</a>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendOrderStatusEmail(email: string, name: string, order: any) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `Order Update - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Status Update</h1>
        <p>Hi ${name},</p>
        <p>Your order status has been updated:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Order #${order.orderNumber}</h3>
          <p><strong>Status:</strong> ${order.status}</p>
          ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ""}
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Order</a>
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
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Ticket #${ticket.ticketNumber}</h3>
          <p><strong>From:</strong> ${ticket.user.name} (${ticket.user.email})</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><strong>Description:</strong></p>
          <p>${ticket.description}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/support/${ticket._id}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
