import { type NextRequest, NextResponse } from "next/server"

interface LoginRequest {
  email: string
  password: string
  role: "patient" | "caregiver"
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password, role } = body

    // Demo authentication - in production, validate against database
    const validCredentials = [
      { email: "patient@demo.com", password: "demo123", role: "patient" },
      { email: "caregiver@demo.com", password: "demo123", role: "caregiver" },
    ]

    const user = validCredentials.find(
      (cred) => cred.email === email && cred.password === password && cred.role === role,
    )

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // In production, generate JWT token and set secure cookies
    const userSession = {
      id: Date.now().toString(),
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      user: userSession,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
