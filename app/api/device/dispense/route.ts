import { type NextRequest, NextResponse } from "next/server"

// POST /api/device/dispense - Manual dispense command
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, slotNumber, medicineName, dosage, reason } = body

    // Validation
    if (!deviceId || !slotNumber) {
      return NextResponse.json({ error: "Device ID and slot number required" }, { status: 400 })
    }

    // TODO: Send dispense command to ESP32 device
    console.log(`[ESP32] Manual dispense command to ${deviceId}:`, {
      slot: slotNumber,
      medicine: medicineName,
      dosage,
      reason: reason || "Manual dispense",
    })

    // Create log entry for manual dispense
    const logResponse = await fetch(`${request.nextUrl.origin}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicineName: medicineName || "Unknown Medicine",
        dosage: dosage || "Unknown Dosage",
        scheduledTime: new Date().toTimeString().slice(0, 5),
        actualTime: new Date().toTimeString().slice(0, 5),
        slotNumber,
        status: "manual",
        acknowledged: true,
        deviceId,
        notes: reason || "Manually dispensed by caregiver",
      }),
    })

    if (!logResponse.ok) {
      console.error("Failed to create log entry for manual dispense")
    }

    return NextResponse.json({
      success: true,
      message: `Manual dispense command sent to slot ${slotNumber}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Manual dispense error:", error)
    return NextResponse.json({ error: "Failed to send dispense command" }, { status: 500 })
  }
}
