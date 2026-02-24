"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Heart, Shield, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let error = null
      if (isSignup) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role } },
        })
        error = signUpError
        if (!error) {
          alert("Check your email inbox to verify your account before logging in.")
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        error = signInError
        if (!signInError && signInData.user) {
          const userInfo = {
            id: signInData.user.id,
            email: signInData.user.email,
            role: (signInData.user.user_metadata?.role as string) || "patient",
            deviceId: "ESP32_001",
          }
          localStorage.setItem("user", JSON.stringify(userInfo))
        }
      }

      if (error) {
        console.error(error.message)
        alert(error.message) // Using alert for now, can be replaced with a toast
        setIsLoading(false)
        return
      }

      if (!isSignup) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Authentication error:", error)
      alert("An unexpected error occurred.")
      setIsLoading(false)
    } finally {
      if (isSignup) {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary rounded-2xl p-4">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">MediCare Dispenser</h1>
          <p className="text-muted-foreground text-lg">
            Smart medication management for better health
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">{isSignup ? "Create Account" : "Welcome Back"}</CardTitle>
            <CardDescription className="text-base">
              {isSignup
                ? "Sign up to start managing your health securely."
                : "Sign in to access your medication schedule."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="role">I am a...</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="caregiver">Caregiver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                className="w-full btn-large"
                disabled={isLoading || !email || !password || (isSignup && !role)}
              >
                {isLoading ? (isSignup ? "Signing Up..." : "Signing In...") : isSignup ? "Sign Up Securely" : "Sign In"}
              </Button>
            </form>

            <div className="text-center mt-4 text-sm">
              {isSignup ? (
                <p>
                  Already have an account?{" "}
                  <button className="underline" onClick={() => setIsSignup(false)}>
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don’t have an account?{" "}
                  <button className="underline" onClick={() => setIsSignup(true)}>
                    Sign Up
                  </button>
                </p>
              )}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Your health data is encrypted and secure.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
