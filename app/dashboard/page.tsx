"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/layout/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  Pill,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Calendar,
  Activity,
  Heart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"

interface MedicineSchedule {
  id: string
  medicineName: string
  dosage: string
  time: string
  slotNumber: number
  status: "upcoming" | "dispensed" | "missed" | "idle"
  acknowledged: boolean
}

interface DispenserStatus {
  isOnline: boolean
  lastSync: string
  batteryLevel: number
  currentSlot: number | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [dispenserStatus, setDispenserStatus] = useState<DispenserStatus | null>(null)
  const [todaySchedule, setTodaySchedule] = useState<MedicineSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchDashboardData(parsedUser.deviceId)
  }, [])

  const fetchDashboardData = async (deviceId: string) => {
    setIsLoading(true)
    const [statusRes, scheduleRes] = await Promise.all([
      apiClient.getDeviceStatus(deviceId),
      apiClient.getSchedules(deviceId, true),
    ])

    if (statusRes.success) {
      setDispenserStatus(statusRes.data)
    }

    if (scheduleRes.success) {
      setTodaySchedule(scheduleRes.data)
    }
    setIsLoading(false)
  }

  const handleSyncDevice = async () => {
    if (!user?.deviceId) return
    setIsSyncing(true)
    const res = await apiClient.syncDevice(user.deviceId)
    if (res.success) {
      // Re-fetch status to get updated sync time
      const statusRes = await apiClient.getDeviceStatus(user.deviceId)
      if (statusRes.success) {
        setDispenserStatus(statusRes.data)
      }
    }
    setIsSyncing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "dispensed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "missed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "dispensed":
        return <CheckCircle className="h-4 w-4" />
      case "missed":
        return <AlertCircle className="h-4 w-4" />
      case "upcoming":
        return <Clock className="h-4 w-4" />
      default:
        return <Pill className="h-4 w-4" />
    }
  }

  const completedMeds = todaySchedule.filter((med) => med.status === "dispensed").length
  const totalMeds = todaySchedule.length
  const completionPercentage = totalMeds > 0 ? (completedMeds / totalMeds) * 100 : 0

  if (isLoading) {
    return <div>Loading dashboard...</div>
  }

  if (!user || !dispenserStatus) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}!
          </h1>
          <p className="text-lg text-muted-foreground">
            {user.role === "caregiver" ? "Managing medication schedules" : "Your medication dashboard"}
          </p>
        </div>

        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Dispenser Status */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Device Status</CardTitle>
                {dispenserStatus.isOnline ? (
                  <Wifi className="h-5 w-5 text-green-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-600" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connection</span>
                <Badge variant={dispenserStatus.isOnline ? "default" : "destructive"}>
                  {dispenserStatus.isOnline ? "Online" : "Offline"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Battery</span>
                  <span className="font-medium">{dispenserStatus.batteryLevel}%</span>
                </div>
                <Progress value={dispenserStatus.batteryLevel} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="font-medium">
                  {new Date(dispenserStatus.lastSync).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <Button
                onClick={handleSyncDevice}
                disabled={isSyncing}
                className="w-full btn-large bg-transparent"
                variant="outline"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Device
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Today's Progress */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Today's Progress</CardTitle>
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {completedMeds}/{totalMeds}
                </div>
                <p className="text-sm text-muted-foreground">Medications taken</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{Math.round(completionPercentage)}%</span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">{completedMeds}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">{totalMeds - completedMeds}</div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full btn-large justify-start bg-transparent" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>

              <Button className="w-full btn-large justify-start bg-transparent" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Emergency Contact
              </Button>

              <Button className="w-full btn-large justify-start bg-transparent" variant="outline">
                <Pill className="h-4 w-4 mr-2" />
                Manual Dispense
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Today's Medication Schedule</CardTitle>
                <CardDescription className="text-base mt-1">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                {todaySchedule.length} medications
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.map((medicine) => (
                <div
                  key={medicine.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                    medicine.status === "upcoming" &&
                      "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
                    medicine.status === "dispensed" &&
                      "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20",
                    medicine.status === "missed" &&
                      "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", getStatusColor(medicine.status))}>
                      {getStatusIcon(medicine.status)}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{medicine.medicineName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{medicine.dosage}</span>
                        <span>•</span>
                        <span>Slot {medicine.slotNumber}</span>
                        <span>•</span>
                        <span className="font-medium">{medicine.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(medicine.status)}>
                      {medicine.status.charAt(0).toUpperCase() + medicine.status.slice(1)}
                    </Badge>

                    {medicine.status === "upcoming" && (
                      <Button size="sm" className="btn-large">
                        Dispense Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
