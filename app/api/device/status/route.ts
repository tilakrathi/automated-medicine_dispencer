import { type NextRequest, NextResponse } from "next/server"

interface DeviceStatus {
  deviceId: string
  isOnline: boolean
  batteryLevel: number
  lastSync: string
  currentSlot: number | null
  wifiSignal: number
  temperature: number
  humidity: number
  totalDispenses: number
  errors: string[]
}

// Mock device status - in production, this would come from ESP32 or database
let deviceStatus: DeviceStatus = {
  deviceId: "ESP32_001",
  isOnline: true,
  batteryLevel: 85,
  lastSync: new Date().toISOString(),
  currentSlot: null,
  wifiSignal: -45,
  temperature: 23.5,
  humidity: 45,
  totalDispenses: 127,
  errors: [],
}

// GET /api/device/status - Get device status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("device_id") || "ESP32_001"

    // Simulate some variation in status
    const now = new Date()
    const timeSinceLastSync = now.getTime() - new Date(deviceStatus.lastSync).getTime()

    // Mark offline if no sync for more than 5 minutes (for demo)
    const isOnline = timeSinceLastSync < 5 * 60 * 1000

    const currentStatus = {
      ...deviceStatus,
      deviceId,
      isOnline,
      batteryLevel: Math.max(0, deviceStatus.batteryLevel - Math.floor(timeSinceLastSync / (1000 * 60 * 60))), // Decrease 1% per hour
      lastSync: deviceStatus.lastSync,
    }

    return NextResponse.json({
      success: true,
      status: currentStatus,
    })
  } catch (error) {
    console.error("Get device status error:", error)
    return NextResponse.json({ error: "Failed to get device status" }, { status: 500 })
  }
}

// POST /api/device/status - Update device status (called by ESP32)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, batteryLevel, wifiSignal, temperature, humidity, currentSlot, errors } = body

    deviceStatus = {
      ...deviceStatus,
      deviceId: deviceId || deviceStatus.deviceId,
      batteryLevel: batteryLevel !== undefined ? batteryLevel : deviceStatus.batteryLevel,
      wifiSignal: wifiSignal !== undefined ? wifiSignal : deviceStatus.wifiSignal,
      temperature: temperature !== undefined ? temperature : deviceStatus.temperature,
      humidity: humidity !== undefined ? humidity : deviceStatus.humidity,
      currentSlot: currentSlot !== undefined ? currentSlot : deviceStatus.currentSlot,
      errors: errors || deviceStatus.errors,
      lastSync: new Date().toISOString(),
      isOnline: true,
    }

    console.log(`[ESP32] Status update from ${deviceId}:`, {
      battery: batteryLevel,
      wifi: wifiSignal,
      temp: temperature,
      slot: currentSlot,
    })

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
    })
  } catch (error) {
    console.error("Update device status error:", error)
    return NextResponse.json({ error: "Failed to update device status" }, { status: 500 })
  }
}
