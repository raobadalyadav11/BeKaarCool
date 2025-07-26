import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save reset token to user
    await User.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry,
    })

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken)
    } catch (emailError) {
      console.error("Password reset email error:", emailError)
      return NextResponse.json({ message: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Password reset email sent successfully",
      token: resetToken, // Only for development, remove in production
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
