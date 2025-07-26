import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const users = await User.find({})
      .select("name email phone role isActive isVerified createdAt lastLogin")
      .sort({ createdAt: -1 })

    // Convert to CSV
    const csvHeaders = ["Name", "Email", "Phone", "Role", "Status", "Verified", "Joined", "Last Login"]
    const csvRows = users.map((user) => [
      user.name,
      user.email,
      user.phone || "",
      user.role,
      user.isActive ? "Active" : "Inactive",
      user.isVerified ? "Yes" : "No",
      new Date(user.createdAt).toLocaleDateString(),
      user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never",
    ])

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting users:", error)
    return NextResponse.json({ message: "Failed to export users" }, { status: 500 })
  }
}
