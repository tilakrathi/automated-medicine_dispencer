"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/layout/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  CalendarIcon,
  Download,
  Pill,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

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
  notes?: string
  timestamp: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<MedicationLog[]>([
    {
      id: "1",
      medicineName: "Paracetamol",
      dosage: "2 tablets",
      scheduledTime: "08:00",
      actualTime: "08:05",
      slotNumber: 1,
      status: "taken",
      acknowledged: true,
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
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      notes: "Patient was not available",
    },
    {
      id: "4",
      medicineName: "Calcium",
      dosage: "2 tablets",
      scheduledTime: "21:00",
      actualTime: "21:00",
      slotNumber: 4,
      status: "taken",
      acknowledged: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "5",
      medicineName: "Paracetamol",
      dosage: "2 tablets",
      scheduledTime: "20:00",
      actualTime: "19:45",
      slotNumber: 1,
      status: "manual",
      acknowledged: true,
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      notes: "Manually dispensed by caregiver",
    },
  ])

  const [filteredLogs, setFilteredLogs] = useState<MedicationLog[]>(logs)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [])

  useEffect(() => {
    let filtered = logs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter)
    }

    // Date filter
    if (dateFilter) {
      const filterDate = format(dateFilter, "yyyy-MM-dd")
      filtered = filtered.filter((log) => {
        const logDate = format(new Date(log.timestamp), "yyyy-MM-dd")
        return logDate === filterDate
      })
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, statusFilter, dateFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "missed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "manual":
        return <User className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "taken":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "missed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "manual":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const exportLogs = () => {
    const csvContent = [
      ["Date", "Time", "Medicine", "Dosage", "Scheduled", "Actual", "Status", "Acknowledged", "Slot", "Notes"].join(
        ",",
      ),
      ...filteredLogs.map((log) =>
        [
          format(new Date(log.timestamp), "yyyy-MM-dd"),
          format(new Date(log.timestamp), "HH:mm"),
          log.medicineName,
          log.dosage,
          log.scheduledTime,
          log.actualTime || "N/A",
          log.status,
          log.acknowledged ? "Yes" : "No",
          log.slotNumber,
          log.notes || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medication-logs-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const stats = {
    total: logs.length,
    taken: logs.filter((log) => log.status === "taken").length,
    missed: logs.filter((log) => log.status === "missed").length,
    late: logs.filter((log) => log.status === "late").length,
    adherence:
      logs.length > 0
        ? Math.round((logs.filter((log) => log.status === "taken" || log.status === "late").length / logs.length) * 100)
        : 0,
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">Medication History</h1>
            <p className="text-lg text-muted-foreground mt-1">Track medication adherence and dispenser activity</p>
          </div>

          <Button onClick={exportLogs} className="btn-large bg-transparent" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Logs</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.taken}</div>
              <p className="text-sm text-muted-foreground">Taken</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.missed}</div>
              <p className="text-sm text-muted-foreground">Missed</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              <p className="text-sm text-muted-foreground">Late</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.adherence}%</div>
              <p className="text-sm text-muted-foreground">Adherence</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-2 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search medicines or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="taken">Taken</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("h-12 justify-start text-left font-normal", !dateFilter && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setDateFilter(undefined)
                  }}
                  className="h-12 w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No logs found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || statusFilter !== "all" || dateFilter
                    ? "Try adjusting your filters to see more results"
                    : "Medication logs will appear here once the dispenser starts working"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.id} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Status Icon */}
                      <div className={cn("p-3 rounded-xl", getStatusColor(log.status))}>
                        {getStatusIcon(log.status)}
                      </div>

                      {/* Log Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{log.medicineName}</h3>
                          <Badge variant="outline">Slot {log.slotNumber}</Badge>
                          <Badge className={getStatusColor(log.status)}>
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Dosage:</span>
                            <p className="font-medium">{log.dosage}</p>
                          </div>

                          <div>
                            <span className="text-muted-foreground">Scheduled:</span>
                            <p className="font-medium">{log.scheduledTime}</p>
                          </div>

                          <div>
                            <span className="text-muted-foreground">Actual:</span>
                            <p className="font-medium">{log.actualTime || "N/A"}</p>
                          </div>

                          <div>
                            <span className="text-muted-foreground">Acknowledged:</span>
                            <p className="font-medium">
                              {log.acknowledged ? (
                                <span className="text-green-600">Yes</span>
                              ) : (
                                <span className="text-red-600">No</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {log.notes && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <span className="text-sm text-muted-foreground">Notes:</span>
                            <p className="text-sm mt-1">{log.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{format(new Date(log.timestamp), "MMM dd, yyyy")}</p>
                      <p>{format(new Date(log.timestamp), "HH:mm")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More Button (for pagination in real implementation) */}
        {filteredLogs.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="btn-large bg-transparent">
              Load More Logs
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
