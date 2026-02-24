import { supabase } from "./supabase"

// API client utilities for frontend


interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: any
  message?: string
}

class ApiClient {
  // Authentication
  async login(email: string, password: string): Promise<ApiResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return { success: false, error }
    return { success: true, data }
  }

  // Schedules
  async getSchedules(deviceId?: string, activeOnly?: boolean): Promise<ApiResponse> {
    let query = supabase.from("schedules").select("*")

    if (deviceId) {
      query = query.eq("device_id", deviceId)
    }
    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) return { success: false, error }
    return { success: true, data }
  }

  async createSchedule(schedule: any): Promise<ApiResponse> {
    const { data, error } = await supabase.from("schedules").insert([schedule])
    if (error) return { success: false, error }
    return { success: true, data }
  }

  async updateSchedule(schedule: any): Promise<ApiResponse> {
    const { data, error } = await supabase
      .from("schedules")
      .update(schedule)
      .eq("id", schedule.id)
    if (error) return { success: false, error }
    return { success: true, data }
  }

  async deleteSchedule(id: string): Promise<ApiResponse> {
    const { data, error } = await supabase.from("schedules").delete().eq("id", id)
    if (error) return { success: false, error }
    return { success: true, data }
  }

  // Device
  async getDeviceStatus(deviceId?: string): Promise<ApiResponse> {
    let query = supabase.from("device_status").select("*")
    if (deviceId) {
      query = query.eq("device_id", deviceId)
    }
    const { data, error } = await query.single()
    if (error) return { success: false, error }
    return { success: true, data }
  }

  async syncDevice(deviceId: string): Promise<ApiResponse> {
    // This might be a call to a Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("sync-device", {
      body: { deviceId },
    })
    if (error) return { success: false, error }
    return { success: true, data }
  }

  async manualDispense(dispenseData: { 
    deviceId: string;
    slotNumber: number;
    medicineName?: string;
    dosage?: string;
    reason?: string;
  }): Promise<ApiResponse> {
    const { data, error } = await supabase.functions.invoke("manual-dispense", {
      body: dispenseData,
    })
    if (error) return { success: false, error }
    return { success: true, data }
  }

  // Logs
  async getLogs(filters: any = {}): Promise<ApiResponse> {
    let query = supabase.from("logs").select("*")

    if (filters.deviceId) query = query.eq("device_id", filters.deviceId)
    if (filters.status) query = query.eq("status", filters.status)
    if (filters.startDate) query = query.gte("created_at", filters.startDate)
    if (filters.endDate) query = query.lte("created_at", filters.endDate)

    const { data, error } = await query.range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 10) - 1)

    if (error) return { success: false, error }
    return { success: true, data }
  }
}

export const apiClient = new ApiClient()
export type { ApiResponse }
