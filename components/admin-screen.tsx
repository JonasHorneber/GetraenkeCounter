"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ChevronDown,
  ChevronRight,
  Check,
  CalendarDays,
  LogOut,
  CheckCircle2,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react"
import type { BeverageType } from "../types/beverage"
import { BEVERAGE_CATEGORIES } from "../types/beverage"
import { getEventInfo, saveEventInfo } from "../utils/storage"

interface AdminScreenProps {
  beverages: BeverageType[]
  onToggleBeverage: (id: string) => void
  onSwitchRole: (role: "admin" | "bartender" | "customer" | "events") => void
  onResetData: () => void
  onLogout: () => void
}

// Convert ISO date (YYYY-MM-DD) to German format (DD/MM/YYYY)
const isoToGermanDate = (isoDate: string): string => {
  if (!isoDate) return ""
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

// Convert German date (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
const germanToIsoDate = (germanDate: string): string => {
  if (!germanDate) return ""
  const parts = germanDate.split("/")
  if (parts.length !== 3) return ""
  const [day, month, year] = parts
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

// Validate German date format
const isValidGermanDate = (dateString: string): boolean => {
  const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  const match = dateString.match(regex)
  if (!match) return false

  const day = Number.parseInt(match[1], 10)
  const month = Number.parseInt(match[2], 10)
  const year = Number.parseInt(match[3], 10)

  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false
  if (year < 1900 || year > 2100) return false

  // Check if date is valid
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export default function AdminScreen({
  beverages,
  onToggleBeverage,
  onSwitchRole,
  onResetData,
  onLogout,
}: AdminScreenProps) {
  // Static initial states to ensure server/client consistency
  const [eventName, setEventName] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [displayEventDate, setDisplayEventDate] = useState("") // German format for display
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showCompleteEventDialog, setShowCompleteEventDialog] = useState(false)
  const [openCategories, setOpenCategories] = useState<string[]>([])
  const [showNoBeveragesDialog, setShowNoBeveragesDialog] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Reset confirmation states
  const [resetConfirmation1, setResetConfirmation1] = useState(false)
  const [resetConfirmation2, setResetConfirmation2] = useState(false)
  const [resetPassword, setResetPassword] = useState("")
  const [resetPasswordError, setResetPasswordError] = useState("")

  // This effect runs only on the client after hydration
  useEffect(() => {
    setIsClient(true)

    // Only after we're definitely on the client, load stored data
    const info = getEventInfo()
    const storedDate = info.eventDate || new Date().toISOString().split("T")[0]
    setEventName(info.eventName || "")
    setEventDate(storedDate)
    setDisplayEventDate(isoToGermanDate(storedDate))
  }, [])

  // Save data whenever relevant state changes (only after client-side hydration)
  useEffect(() => {
    if (!isClient) return

    const totalServed = beverages.reduce((sum, b) => sum + b.count, 0)
    const info = getEventInfo()
    saveEventInfo(eventName, eventDate, totalServed, info.eventStarted)
  }, [eventName, eventDate, beverages, isClient])

  const handleDateChange = (value: string) => {
    setDisplayEventDate(value)

    // Convert to ISO format for storage if valid
    if (isValidGermanDate(value)) {
      const isoDate = germanToIsoDate(value)
      setEventDate(isoDate)
    }
  }

  const handleResetData = () => {
    setShowResetDialog(true)
    // Reset all confirmation states when opening dialog
    setResetConfirmation1(false)
    setResetConfirmation2(false)
    setResetPassword("")
    setResetPasswordError("")
  }

  const confirmResetData = () => {
    // Check if both confirmations are checked
    if (!resetConfirmation1 || !resetConfirmation2) {
      return
    }

    // Check password
    if (resetPassword !== "v0") {
      setResetPasswordError("Falsches Passwort")
      return
    }

    // All checks passed, proceed with reset
    onResetData()
    setEventName("") // Reset event name
    const todayIso = new Date().toISOString().split("T")[0]
    setEventDate(todayIso) // Reset event date to today
    setDisplayEventDate(isoToGermanDate(todayIso))
    setShowResetDialog(false)
  }

  const handleCompleteEvent = () => {
    setShowCompleteEventDialog(true)
  }

  const confirmCompleteEvent = () => {
    onResetData() // This now also saves the completed event and resets current data
    setEventName("") // Reset event name
    const todayIso = new Date().toISOString().split("T")[0]
    setEventDate(todayIso) // Reset event date to today
    setDisplayEventDate(isoToGermanDate(todayIso))
    setShowCompleteEventDialog(false)
  }

  const availableBeveragesCount = beverages.filter((b) => b.available).length
  const totalDrinksServed = beverages.reduce((sum, b) => sum + b.count, 0)
  const canCompleteEvent = totalDrinksServed > 0 && eventName.trim() !== ""

  const getBeveragesByCategory = (categoryId: string) => {
    return beverages.filter((b) => b.category === categoryId)
  }

  const getCategoryStats = (categoryId: string) => {
    const categoryBeverages = getBeveragesByCategory(categoryId)
    const availableCount = categoryBeverages.filter((b) => b.available).length
    const totalCount = categoryBeverages.length
    return { availableCount, totalCount }
  }

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSwitchToBartender = () => {
    const hasAvailableBeverages = beverages.some((b) => b.available)
    if (!hasAvailableBeverages) {
      setShowNoBeveragesDialog(true)
      return
    }
    onSwitchRole("bartender")
  }

  // Check if reset can be confirmed
  const canConfirmReset = resetConfirmation1 && resetConfirmation2 && resetPassword === "v0"

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center py-8 mb-8">
        <h1 className="text-4xl font-light text-gray-800 mb-4">Admin-Panel</h1>
        <p className="text-xl text-gray-600">Verwalten Sie Getränke und Veranstaltungen</p>
      </div>

      {/* Event Info Card */}
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">Veranstaltungsinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="eventName" className="mb-2 block text-lg">
                Veranstaltungsname
              </Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Z.B. Sommerfest 2024"
                className="h-14 text-lg"
              />
            </div>
            <div>
              <Label htmlFor="eventDate" className="mb-2 block text-lg">
                Veranstaltungsdatum
              </Label>
              <Input
                id="eventDate"
                type="text"
                value={displayEventDate}
                onChange={(e) => handleDateChange(e.target.value)}
                placeholder="TT/MM/JJJJ"
                className={`h-14 text-lg ${!isValidGermanDate(displayEventDate) && displayEventDate ? "border-red-300" : ""}`}
              />
              {!isValidGermanDate(displayEventDate) && displayEventDate && (
                <p className="text-sm text-red-500 mt-1">Bitte geben Sie das Datum im Format TT/MM/JJJJ ein</p>
              )}
            </div>
          </div>
          <div className="text-lg text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
            <span className="font-semibold text-blue-600">{availableBeveragesCount}</span> Getränke verfügbar •
            <span className="font-semibold text-green-600 ml-2">{totalDrinksServed}</span> gesamt serviert
          </div>
        </CardContent>
      </Card>

      {/* Beverage Availability by Category */}
      <div className="space-y-6 mb-8">
        {BEVERAGE_CATEGORIES.map((category) => {
          const categoryBeverages = getBeveragesByCategory(category.id)
          const { availableCount, totalCount } = getCategoryStats(category.id)
          const isOpen = openCategories.includes(category.id)

          if (totalCount === 0) return null // Don't show empty categories

          return (
            <Card key={category.id} className="overflow-hidden shadow-lg">
              <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category.id)}>
                <CollapsibleTrigger asChild>
                  <div className="w-full cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{category.icon}</div>
                          <div>
                            <div className="text-2xl font-medium" style={{ color: category.color }}>
                              {category.name}
                            </div>
                            <div className="text-lg text-gray-500">
                              {availableCount}/{totalCount} ausgewählt
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium"
                            style={{ backgroundColor: category.color }}
                          >
                            {availableCount}
                          </div>
                          {isOpen ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
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
                        className={`p-4 border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                          beverage.available ? "bg-blue-50" : ""
                        }`}
                        onClick={() => onToggleBeverage(beverage.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{beverage.icon}</div>
                            <div
                              className={`text-lg font-medium ${beverage.available ? "" : "text-gray-600"}`}
                              style={{ color: beverage.available ? beverage.color : undefined }}
                            >
                              {beverage.name}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {beverage.count > 0 && <div className="text-lg text-gray-500">({beverage.count})</div>}
                            <div
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                beverage.available ? "text-white" : "border-gray-300"
                              }`}
                              style={{
                                backgroundColor: beverage.available ? beverage.color : "transparent",
                                borderColor: beverage.available ? beverage.color : undefined,
                              }}
                            >
                              {beverage.available && <Check className="w-5 h-5" />}
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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button
          className="h-16 text-lg font-semibold"
          onClick={handleSwitchToBartender}
          disabled={availableBeveragesCount === 0}
        >
          Zur Barkeeper-Ansicht wechseln
        </Button>
        <Button
          variant="outline"
          className="h-16 text-lg font-semibold bg-transparent"
          onClick={() => onSwitchRole("events")}
        >
          <CalendarDays className="w-5 h-5 mr-2" />
          Veranstaltungsübersicht
        </Button>
        <Button
          variant="outline"
          className="h-16 text-lg font-semibold bg-transparent text-green-600 border-green-200 hover:bg-green-50"
          onClick={handleCompleteEvent}
          disabled={!canCompleteEvent}
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Veranstaltung abschließen
        </Button>
        <Button
          variant="outline"
          className="h-16 text-lg font-semibold bg-transparent text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleResetData}
        >
          <RefreshCcw className="w-5 h-5 mr-2" />
          Alle Daten zurücksetzen
        </Button>
        <Button variant="outline" className="h-16 text-lg font-semibold bg-transparent" onClick={onLogout}>
          <LogOut className="w-5 h-5 mr-2" />
          Abmelden
        </Button>
      </div>

      {/* No Beverages Selected Warning Dialog */}
      <Dialog open={showNoBeveragesDialog} onOpenChange={setShowNoBeveragesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Keine Getränke ausgewählt</DialogTitle>
            <DialogDescription className="text-lg">
              Sie müssen mindestens ein Getränk auswählen, bevor Sie zur Barkeeper-Ansicht wechseln können. Wählen Sie
              die gewünschten Getränke aus den Kategorien unten aus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowNoBeveragesDialog(false)} className="h-12 text-lg px-8">
              Verstanden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Data Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 text-xl">
              <AlertTriangle className="w-6 h-6" />
              Alle Daten zurücksetzen?
            </DialogTitle>
            <DialogDescription className="text-lg">
              Diese Aktion setzt alle Getränkezähler und Verfügbarkeiten zurück. Bereits exportierte Daten bleiben
              erhalten. Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* First Confirmation Switch */}
            <div className="flex items-center justify-between space-x-4">
              <Label
                htmlFor="confirm1"
                className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ich verstehe, dass alle aktuellen Daten gelöscht werden
              </Label>
              <Switch id="confirm1" checked={resetConfirmation1} onCheckedChange={setResetConfirmation1} />
            </div>

            {/* Second Confirmation Switch */}
            <div className="flex items-center justify-between space-x-4">
              <Label
                htmlFor="confirm2"
                className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ich bestätige, dass ich diese Aktion durchführen möchte
              </Label>
              <Switch id="confirm2" checked={resetConfirmation2} onCheckedChange={setResetConfirmation2} />
            </div>

            {/* Password Input */}
            <div className="space-y-3">
              <Label htmlFor="resetPassword" className="text-lg font-medium">
                Passwort zur Bestätigung eingeben:
              </Label>
              <Input
                id="resetPassword"
                type="password"
                value={resetPassword}
                onChange={(e) => {
                  setResetPassword(e.target.value)
                  setResetPasswordError("")
                }}
                placeholder="Passwort eingeben"
                className={`h-14 text-lg ${resetPasswordError ? "border-red-500" : ""}`}
              />
              {resetPasswordError && <p className="text-lg text-red-500">{resetPasswordError}</p>}
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowResetDialog(false)} className="h-12 text-lg px-8">
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={confirmResetData}
              disabled={!canConfirmReset}
              className="h-12 text-lg px-8"
            >
              Endgültig zurücksetzen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Event Confirmation Dialog */}
      <Dialog open={showCompleteEventDialog} onOpenChange={setShowCompleteEventDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Veranstaltung abschließen?</DialogTitle>
            <DialogDescription className="text-lg">
              Die aktuelle Veranstaltung wird gespeichert und alle Zähler werden zurückgesetzt. Möchten Sie fortfahren?
            </DialogDescription>
          </DialogHeader>

          {/* Event Summary */}
          <div className="py-4 px-2">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Zusammenfassung der Veranstaltung:</h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-800">{eventName || "Unbenannt"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Datum:</span>
                  <span className="font-semibold text-gray-800">{displayEventDate || "Nicht gesetzt"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gesamt servierte Getränke:</span>
                  <span className="font-bold text-green-600 text-lg">{totalDrinksServed}</span>
                </div>
              </div>

              {/* Top beverages served */}
              {totalDrinksServed > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Meistservierte Getränke:</h4>
                  <div className="space-y-1">
                    {beverages
                      .filter((b) => b.count > 0)
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 3)
                      .map((beverage) => (
                        <div key={beverage.id} className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-1">
                            <span className="text-base">{beverage.icon}</span>
                            <span style={{ color: beverage.color }}>{beverage.name}</span>
                          </span>
                          <span className="font-semibold">{beverage.count}x</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowCompleteEventDialog(false)} className="h-12 text-lg px-8">
              Abbrechen
            </Button>
            <Button onClick={confirmCompleteEvent} className="h-12 text-lg px-8">
              Abschließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
