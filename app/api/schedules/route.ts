import { type NextRequest, NextResponse } from "next/server"

interface MedicineSchedule {
  id: string
  medicineName: string
  dosage: string
  times: string[]
  slotNumber: number
  isActive: boolean
  frequency: "daily" | "weekly" | "as-needed"
  notes?: string
  deviceId?: string
  createdAt: string
  updatedAt: string
}

// In-memory storage for demo - use database in production
const schedules: MedicineSchedule[] = [
  {
    id: "1",
    medicineName: "Paracetamol",
    dosage: "2 tablets",
    times: ["08:00", "20:00"],
    slotNumber: 1,
    isActive: true,
    frequency: "daily",
    notes: "Take with food",
    deviceId: "ESP32_001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    medicineName: "Vitamin D",
    dosage: "1 tablet",
    times: ["12:00"],
    slotNumber: 2,
    isActive: true,
    frequency: "daily",
    deviceId: "ESP32_001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// GET /api/schedules - Fetch all schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("device_id")
    const activeOnly = searchParams.get("active_only") === "true"

    let filteredSchedules = schedules

    if (deviceId) {
      filteredSchedules = filteredSchedules.filter((s) => s.deviceId === deviceId)
    }

    if (activeOnly) {
      filteredSchedules = filteredSchedules.filter((s) => s.isActive)
    }

    return NextResponse.json({
      success: true,
      schedules: filteredSchedules,
      count: filteredSchedules.length,
    })
  } catch (error) {
    console.error("Get schedules error:", error)
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}

// POST /api/schedules - Create new schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { medicineName, dosage, times, slotNumber, frequency, notes, deviceId } = body

    // Validation
    if (!medicineName || !dosage || !times || !slotNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if slot is already in use
    const existingSlot = schedules.find((s) => s.slotNumber === slotNumber && s.isActive)
    if (existingSlot) {
      return NextResponse.json({ error: "Slot already in use" }, { status: 409 })
    }

    const newSchedule: MedicineSchedule = {
      id: Date.now().toString(),
      medicineName,
      dosage,
      times,
      slotNumber,
      isActive: true,
      frequency: frequency || "daily",
      notes,
      deviceId: deviceId || "ESP32_001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    schedules.push(newSchedule)

    // TODO: Send update to ESP32 device
    console.log(`[ESP32] New schedule added for slot ${slotNumber}:`, {
      medicine: medicineName,
      dosage,
      times,
      slot: slotNumber,
    })

    return NextResponse.json({
      success: true,
      schedule: newSchedule,
      message: "Schedule created successfully",
    })
  } catch (error) {
    console.error("Create schedule error:", error)
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 })
  }
}

// PUT /api/schedules - Update existing schedule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, medicineName, dosage, times, slotNumber, frequency, notes, isActive } = body

    const scheduleIndex = schedules.findIndex((s) => s.id === id)
    if (scheduleIndex === -1) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    // Check if new slot conflicts with existing schedules
    if (slotNumber !== schedules[scheduleIndex].slotNumber) {
      const existingSlot = schedules.find((s) => s.slotNumber === slotNumber && s.isActive && s.id !== id)
      if (existingSlot) {
        return NextResponse.json({ error: "Slot already in use" }, { status: 409 })
      }
    }

    const updatedSchedule = {
      ...schedules[scheduleIndex],
      medicineName: medicineName || schedules[scheduleIndex].medicineName,
      dosage: dosage || schedules[scheduleIndex].dosage,
      times: times || schedules[scheduleIndex].times,
      slotNumber: slotNumber || schedules[scheduleIndex].slotNumber,
      frequency: frequency || schedules[scheduleIndex].frequency,
      notes: notes !== undefined ? notes : schedules[scheduleIndex].notes,
      isActive: isActive !== undefined ? isActive : schedules[scheduleIndex].isActive,
      updatedAt: new Date().toISOString(),
    }

    schedules[scheduleIndex] = updatedSchedule

    // TODO: Send update to ESP32 device
    console.log(`[ESP32] Schedule updated for slot ${updatedSchedule.slotNumber}:`, {
      medicine: updatedSchedule.medicineName,
      dosage: updatedSchedule.dosage,
      times: updatedSchedule.times,
      slot: updatedSchedule.slotNumber,
      active: updatedSchedule.isActive,
    })

    return NextResponse.json({
      success: true,
      schedule: updatedSchedule,
      message: "Schedule updated successfully",
    })
  } catch (error) {
    console.error("Update schedule error:", error)
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 })
  }
}

// DELETE /api/schedules - Delete schedule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Schedule ID required" }, { status: 400 })
    }

    const scheduleIndex = schedules.findIndex((s) => s.id === id)
    if (scheduleIndex === -1) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    const deletedSchedule = schedules[scheduleIndex]
    schedules.splice(scheduleIndex, 1)

    // TODO: Send update to ESP32 device to clear slot
    console.log(`[ESP32] Schedule deleted for slot ${deletedSchedule.slotNumber}`)

    return NextResponse.json({
      success: true,
      message: "Schedule deleted successfully",
    })
  } catch (error) {
    console.error("Delete schedule error:", error)
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 })
  }
}
