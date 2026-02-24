import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"


export const metadata = {
  title: "MediCare Dispenser - Smart Medicine Management",
  description: "Intelligent medication dispensing system for patients and caregivers",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans text-foreground">{children}</body>
    </html>
  )
}
