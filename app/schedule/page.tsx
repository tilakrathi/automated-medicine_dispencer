"use client"

import { useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Clock, Pill, Save, X, Calendar, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MedicineSchedule {
  id: string
  medicineName: string
  dosage: string
  times: string[]
  slotNumber: number
  isActive: boolean
  frequency: "daily" | "weekly" | "as-needed"
  notes?: string
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<MedicineSchedule[]>([
    {
      id: "1",
      medicineName: "Paracetamol",
      dosage: "2 tablets",
      times: ["08:00", "20:00"],
      slotNumber: 1,
      isActive: true,
      frequency: "daily",
      notes: "Take with food",
    },
    {
      id: "2",
      medicineName: "Vitamin D",
      dosage: "1 tablet",
      times: ["12:00"],
      slotNumber: 2,
      isActive: true,
      frequency: "daily",
    },
    {
      id: "3",
      medicineName: "Blood Pressure Med",
      dosage: "1 tablet",
      times: ["18:00"],
      slotNumber: 3,
      isActive: true,
      frequency: "daily",
      notes: "Monitor blood pressure",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<MedicineSchedule | null>(null)
  const [formData, setFormData] = useState({
    medicineName: "",
    dosage: "",
    times: [""],
    slotNumber: 1,
    frequency: "daily" as const,
    notes: "",
  })

  const availableSlots = [1, 2, 3, 4, 5, 6, 7, 8]
  const usedSlots = schedules.filter((s) => s.isActive).map((s) => s.slotNumber)

  const handleAddSchedule = () => {
    setEditingSchedule(null)
    setFormData({
      medicineName: "",
      dosage: "",
      times: [""],
      slotNumber: availableSlots.find((slot) => !usedSlots.includes(slot)) || 1,
      frequency: "daily",
      notes: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditSchedule = (schedule: MedicineSchedule) => {
    setEditingSchedule(schedule)
    setFormData({
      medicineName: schedule.medicineName,
      dosage: schedule.dosage,
      times: schedule.times,
      slotNumber: schedule.slotNumber,
      frequency: schedule.frequency,
      notes: schedule.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id))
  }

  const handleSaveSchedule = () => {
    if (!formData.medicineName || !formData.dosage || formData.times.some((t) => !t)) {
      return
    }

    const newSchedule: MedicineSchedule = {
      id: editingSchedule?.id || Date.now().toString(),
      medicineName: formData.medicineName,
      dosage: formData.dosage,
      times: formData.times.filter((t) => t),
      slotNumber: formData.slotNumber,
      isActive: true,
      frequency: formData.frequency,
      notes: formData.notes,
    }

    if (editingSchedule) {
      setSchedules((prev) => prev.map((s) => (s.id === editingSchedule.id ? newSchedule : s)))
    } else {
      setSchedules((prev) => [...prev, newSchedule])
    }

    setIsDialogOpen(false)
  }

  const addTimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      times: [...prev.times, ""],
    }))
  }

  const removeTimeSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }))
  }

  const updateTimeSlot = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      times: prev.times.map((time, i) => (i === index ? value : time)),
    }))
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const toggleScheduleActive = (id: string) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance">Medication Schedule</h1>
            <p className="text-lg text-muted-foreground mt-1">Manage your daily medication routine</p>
          </div>

          <Button onClick={handleAddSchedule} className="btn-large">
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>

        {/* Schedule Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Active Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{schedules.filter((s) => s.isActive).length}</div>
              <p className="text-sm text-muted-foreground">Medications scheduled</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Slots Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {usedSlots.length}/{availableSlots.length}
              </div>
              <p className="text-sm text-muted-foreground">Dispenser compartments</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Daily Doses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {schedules.filter((s) => s.isActive).reduce((total, s) => total + s.times.length, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Times per day</p>
            </CardContent>
          </Card>
        </div>

        {/* Schedules List */}
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <Card
              key={schedule.id}
              className={cn(
                "border-2 transition-all",
                schedule.isActive ? "border-border" : "border-muted bg-muted/20",
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          schedule.isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Pill className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold">{schedule.medicineName}</h3>
                        <p className="text-muted-foreground">{schedule.dosage}</p>
                      </div>

                      <Badge variant={schedule.isActive ? "default" : "secondary"}>Slot {schedule.slotNumber}</Badge>

                      <Badge variant="outline" className="capitalize">
                        {schedule.frequency}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Schedule Times</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {schedule.times.map((time, index) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(time)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {schedule.notes && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                          <p className="text-sm mt-1">{schedule.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleScheduleActive(schedule.id)}
                      className={cn("btn-large", !schedule.isActive && "text-muted-foreground")}
                    >
                      {schedule.isActive ? "Active" : "Inactive"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSchedule(schedule)}
                      className="btn-large"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="btn-large text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {schedules.length === 0 && (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No schedules yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add your first medication schedule to get started
                </p>
                <Button onClick={handleAddSchedule} className="btn-large">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add/Edit Schedule Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingSchedule ? "Edit Schedule" : "Add New Schedule"}</DialogTitle>
              <DialogDescription>Configure medication details and timing for the dispenser</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Medicine Name */}
              <div className="space-y-2">
                <Label htmlFor="medicineName" className="text-base font-medium">
                  Medicine Name *
                </Label>
                <Input
                  id="medicineName"
                  placeholder="e.g., Paracetamol, Vitamin D"
                  value={formData.medicineName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, medicineName: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>

              {/* Dosage */}
              <div className="space-y-2">
                <Label htmlFor="dosage" className="text-base font-medium">
                  Dosage *
                </Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 1 tablet, 2 capsules, 5ml"
                  value={formData.dosage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dosage: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>

              {/* Slot Number */}
              <div className="space-y-2">
                <Label htmlFor="slotNumber" className="text-base font-medium">
                  Dispenser Slot *
                </Label>
                <Select
                  value={formData.slotNumber.toString()}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, slotNumber: Number.parseInt(value) }))}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem
                        key={slot}
                        value={slot.toString()}
                        disabled={usedSlots.includes(slot) && formData.slotNumber !== slot}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>Slot {slot}</span>
                          {usedSlots.includes(slot) && formData.slotNumber !== slot && (
                            <Badge variant="secondary" className="ml-2">
                              Used
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-base font-medium">
                  Frequency
                </Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: "daily" | "weekly" | "as-needed") =>
                    setFormData((prev) => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="as-needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Times */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Schedule Times *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTimeSlot}
                    className="text-sm bg-transparent"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Time
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        className="h-12 text-base"
                      />
                      {formData.times.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTimeSlot(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-medium">
                  Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  placeholder="e.g., Take with food, Monitor blood pressure"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>

              {/* Warning for slot conflicts */}
              {usedSlots.includes(formData.slotNumber) && formData.slotNumber !== editingSchedule?.slotNumber && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-950/20 dark:border-yellow-800">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This slot is already in use. Please select a different slot.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="btn-large">
                Cancel
              </Button>
              <Button
                onClick={handleSaveSchedule}
                disabled={!formData.medicineName || !formData.dosage || formData.times.some((t) => !t)}
                className="btn-large"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingSchedule ? "Update Schedule" : "Add Schedule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
