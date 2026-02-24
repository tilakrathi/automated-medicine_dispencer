import { type NextRequest, NextResponse } from "next/server"

interface MedicationLog {
  id: string
  medicineName: string
  dosage: string
  scheduledTime: string
  actualTime?: string
  slotNumber: number
  status: "taken" | "missed" | "late" | "manual"
  acknowledged: boolean
  patientId?: string
  deviceId: string
  notes?: string
  timestamp: string
}

// In-memory storage for demo - use database in production
const logs: MedicationLog[] = [
  {
    id: "1",
    medicineName: "Paracetamol",
    dosage: "2 tablets",
    scheduledTime: "08:00",
    actualTime: "08:05",
    slotNumber: 1,
    status: "taken",
    acknowledged: true,
    deviceId: "ESP32_001",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    notes: "Taken with breakfast",
  },
  {
    id: "2",
    medicineName: "Vitamin D",
    dosage: "1 tablet",
    scheduledTime: "12:00",
    actualTime: "12:15",
    slotNumber: 2,
    status: "late",
    acknowledged: true,
    deviceId: "ESP32_001",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    medicineName: "Blood Pressure Med",
    dosage: "1 tablet",
    scheduledTime: "18:00",
    slotNumber: 3,
    status: "missed",
    acknowledged: false,
    deviceId: "ESP32_001",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notes: "Patient was not available",
  },
]

// GET /api/logs - Fetch medication logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("device_id")
    const status = searchParams.get("status")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let filteredLogs = logs

    // Filter by device
    if (deviceId) {
      filteredLogs = filteredLogs.filter((log) => log.deviceId === deviceId)
    }

    // Filter by status
    if (status) {
      filteredLogs = filteredLogs.filter((log) => log.status === status)
    }

    // Filter by date range
    if (startDate) {
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) >= new Date(startDate))
    }
    if (endDate) {
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) <= new Date(endDate))
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      logs: paginatedLogs,
      total: filteredLogs.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Get logs error:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}

// POST /api/logs - Create new log entry (called by ESP32)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { medicineName, dosage, scheduledTime, actualTime, slotNumber, status, acknowledged, deviceId, notes } = body

    // Validation
    if (!medicineName || !dosage || !scheduledTime || !slotNumber || !status || !deviceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newLog: MedicationLog = {
      id: Date.now().toString(),
      medicineName,
      dosage,
      scheduledTime,
      actualTime,
      slotNumber,
      status,
      acknowledged: acknowledged || false,
      deviceId,
      notes,
      timestamp: new Date().toISOString(),
    }

    logs.push(newLog)

    console.log(`[ESP32] New log entry from ${deviceId}:`, {
      medicine: medicineName,
      slot: slotNumber,
      status,
      time: actualTime || scheduledTime,
    })

    // TODO: Send notifications if missed or late
    if (status === "missed") {
      console.log(`[NOTIFICATION] Missed medication: ${medicineName} at ${scheduledTime}`)
    }

    return NextResponse.json({
      success: true,
      log: newLog,
      message: "Log entry created successfully",
    })
  } catch (error) {
    console.error("Create log error:", error)
    return NextResponse.json({ error: "Failed to create log entry" }, { status: 500 })
  }
}
