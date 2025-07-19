"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronDown, ChevronRight, RotateCcw, Download, Edit } from "lucide-react"
import type { BeverageType } from "../types/beverage"
import { BEVERAGE_CATEGORIES } from "../types/beverage"
import { exportData, importData, clearStorage, getEventInfo, updateEventInfo } from "../utils/storage"

interface AdminScreenProps {
  beverages: BeverageType[]
  onToggleBeverage: (id: string) => void
  onSwitchRole: (role: "admin" | "bartender" | "customer") => void
  onResetData: () => void
}

export default function AdminScreen({ beverages, onToggleBeverage, onSwitchRole, onResetData }: AdminScreenProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(["sprizz"])
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showDataDialog, setShowDataDialog] = useState(false)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [eventInfo, setEventInfo] = useState({ eventName: "", eventDate: "", totalServed: 0 })
  const availableBeverages = beverages.filter((b) => b.available)

  useEffect(() => {
    const info = getEventInfo()
    setEventInfo({
      eventName: info.eventName || "",
      eventDate: info.eventDate,
      totalServed: info.totalServed,
    })
  }, [beverages])

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const getBeveragesByCategory = (categoryId: string) => {
    return beverages.filter((b) => b.category === categoryId)
  }

  const getCategoryStats = (categoryId: string) => {
    const categoryBeverages = getBeveragesByCategory(categoryId)
    const availableCount = categoryBeverages.filter((b) => b.available).length
    const totalCount = categoryBeverages.length
    return { availableCount, totalCount }
  }

  const handleExportData = () => {
    const data = exportData()
    if (data) {
      const eventName = eventInfo.eventName || "event"
      const eventDate = eventInfo.eventDate
      const filename = `${eventName.toLowerCase().replace(/\s+/g, "-")}-${eventDate}.json`

      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const importedData = importData(content)
        if (importedData) {
          console.log("Data imported successfully")
          // This would need to be passed up to the parent component
        } else {
          alert("Failed to import data. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleUpdateEventInfo = () => {
    updateEventInfo(eventInfo.eventName, eventInfo.eventDate)
    setShowEventDialog(false)
  }

  const confirmReset = () => {
    onResetData()
    clearStorage()
    setShowResetDialog(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-light text-gray-800 mb-2">Admin Panel</h1>
        <p className="text-sm text-gray-600 mb-4">Select beverages available for this event</p>

        {/* Event Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-left">
                <div className="text-lg font-medium text-gray-800">{eventInfo.eventName || "Untitled Event"}</div>
                <div className="text-sm text-gray-600">{formatDate(eventInfo.eventDate)}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowEventDialog(true)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Available Beverages</span>
              <span className="font-semibold">{availableBeverages.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Served</span>
              <span className="font-semibold">{eventInfo.totalServed}</span>
            </div>
          </CardContent>
        </Card>

        {/* Data Safety Indicator */}
        <div className="p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="text-xs text-green-600">✓ Data automatically saved</div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3 mb-6">
        {BEVERAGE_CATEGORIES.map((category) => {
          const categoryBeverages = getBeveragesByCategory(category.id)
          const { availableCount, totalCount } = getCategoryStats(category.id)
          const isOpen = openCategories.includes(category.id)

          if (totalCount === 0) return null

          return (
            <Card key={category.id} className="overflow-hidden">
              <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category.id)}>
                <CollapsibleTrigger asChild>
                  <div className="w-full cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{category.icon}</div>
                          <div>
                            <div className="text-lg font-medium" style={{ color: category.color }}>
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {availableCount}/{totalCount} selected
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: category.color }}
                          >
                            {availableCount}
                          </div>
                          {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-gray-100">
                    {categoryBeverages.map((beverage) => (
                      <div
                        key={beverage.id}
                        className={`p-3 border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                          beverage.available ? "bg-blue-50" : ""
                        }`}
                        onClick={() => onToggleBeverage(beverage.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-lg">{beverage.icon}</div>
                            <div
                              className={`font-medium ${beverage.available ? "" : "text-gray-600"}`}
                              style={{ color: beverage.available ? beverage.color : undefined }}
                            >
                              {beverage.name}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {beverage.count > 0 && <div className="text-sm text-gray-500">({beverage.count})</div>}
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                beverage.available ? "text-white" : "border-gray-300"
                              }`}
                              style={{
                                backgroundColor: beverage.available ? beverage.color : "transparent",
                                borderColor: beverage.available ? beverage.color : undefined,
                              }}
                            >
                              {beverage.available && "✓"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="space-y-3 mb-6">
        <Button className="w-full" onClick={() => onSwitchRole("bartender")} disabled={availableBeverages.length === 0}>
          Switch to Bartender View
        </Button>
      </div>

      {/* Data Management */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowDataDialog(true)}>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
        <Button
          variant="outline"
          className="w-full bg-transparent text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => setShowResetDialog(true)}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All Data
        </Button>
      </div>

      {/* Event Info Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Information</DialogTitle>
            <DialogDescription>Set the event name and date for better organization and exports.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                value={eventInfo.eventName}
                onChange={(e) => setEventInfo({ ...eventInfo, eventName: e.target.value })}
                placeholder="e.g., Summer Party 2024"
              />
            </div>
            <div>
              <Label htmlFor="event-date">Event Date</Label>
              <Input
                id="event-date"
                type="date"
                value={eventInfo.eventDate}
                onChange={(e) => setEventInfo({ ...eventInfo, eventDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEventDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEventInfo}>Save Event Info</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Data</DialogTitle>
            <DialogDescription>
              This will permanently delete all beverage counts and settings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReset}>
              Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Export Dialog */}
      <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Data Management</DialogTitle>
            <DialogDescription>Export your data for backup or import previously saved data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button className="w-full" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Download Event Data
            </Button>
            <div>
              <label htmlFor="import-file" className="block text-sm font-medium text-gray-700 mb-2">
                Import Data File
              </label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDataDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
