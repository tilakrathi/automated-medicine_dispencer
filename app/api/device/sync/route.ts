import { type NextRequest, NextResponse } from "next/server"

// POST /api/device/sync - Sync schedules with ESP32 device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId } = body

    // Fetch active schedules for this device
    const schedulesResponse = await fetch(
      `${request.nextUrl.origin}/api/schedules?device_id=${deviceId}&active_only=true`,
    )
    const schedulesData = await schedulesResponse.json()

    if (!schedulesData.success) {
      throw new Error("Failed to fetch schedules")
    }

    // Format schedules for ESP32
    const esp32Schedules = schedulesData.schedules.map((schedule: any) => ({
      slot_number: schedule.slotNumber,
      medicine_name: schedule.medicineName,
      dosage: schedule.dosage,
      times: schedule.times,
      frequency: schedule.frequency,
      notes: schedule.notes || "",
    }))

    // TODO: Send to ESP32 device via HTTP/MQTT
    console.log(`[ESP32] Syncing ${esp32Schedules.length} schedules to device ${deviceId}:`)
    esp32Schedules.forEach((schedule: any) => {
      console.log(`  Slot ${schedule.slot_number}: ${schedule.medicine_name} at ${schedule.times.join(", ")}`)
    })

    // Update device last sync time
    const statusResponse = await fetch(`${request.nextUrl.origin}/api/device/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    })

    return NextResponse.json({
      success: true,
      schedules: esp32Schedules,
      syncTime: new Date().toISOString(),
      message: `Synced ${esp32Schedules.length} schedules to device`,
    })
  } catch (error) {
    console.error("Device sync error:", error)
    return NextResponse.json({ error: "Failed to sync with device" }, { status: 500 })
  }
}
