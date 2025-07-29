"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ChevronDown, ChevronRight, Trash2, BarChart3, Edit, Save, X, Plus, Minus } from "lucide-react"
import { getCompletedEvents, deleteCompletedEvent, clearCompletedEvents } from "../utils/event-storage"
import type { CompletedEvent, DrinkHistoryEntry } from "../types/event"

interface EventsOverviewScreenProps {
  onBack: () => void
}

export default function EventsOverviewScreen({ onBack }: EventsOverviewScreenProps) {
  // Static initial states to ensure server/client consistency
  const [completedEvents, setCompletedEvents] = useState<CompletedEvent[]>([])
  const [openEventId, setOpenEventId] = useState<string | null>(null)
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)
  const [showDeleteOneDialog, setShowDeleteOneDialog] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [eventToEdit, setEventToEdit] = useState<CompletedEvent | null>(null)
  const [editingHistory, setEditingHistory] = useState<DrinkHistoryEntry[]>([])
  const [editingEventName, setEditingEventName] = useState("")
  const [editingEventDate, setEditingEventDate] = useState("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Load events only after client-side hydration
    const loadedEvents = getCompletedEvents()
    // Sort by completion date, newest first
    loadedEvents.sort((a, b) => b.eventCompletedAt.getTime() - a.eventCompletedAt.getTime())
    setCompletedEvents(loadedEvents)
  }, [])

  const handleEditEvent = (event: CompletedEvent) => {
    setEventToEdit(event)
    setEditingHistory([...event.history])
    setEditingEventName(event.eventName)
    setEditingEventDate(formatGermanDate(event.eventDate))
    setShowEditDialog(true)
  }

  const handleDeleteEvent = (id: string) => {
    setEventToDelete(id)
    setShowDeleteOneDialog(true)
  }

  const confirmDeleteEvent = () => {
    if (eventToDelete) {
      deleteCompletedEvent(eventToDelete)
      setCompletedEvents((prev) => prev.filter((e) => e.id !== eventToDelete))
      setEventToDelete(null)
      setShowDeleteOneDialog(false)
    }
  }

  const handleClearAllEvents = () => {
    setShowClearAllDialog(true)
  }

  const confirmClearAllEvents = () => {
    clearCompletedEvents()
    setCompletedEvents([])
    setShowClearAllDialog(false)
  }

  const handleDeleteHistoryEntry = (index: number) => {
    setEditingHistory((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEditHistoryEntry = (index: number, newAmount: number) => {
    if (newAmount <= 0) {
      handleDeleteHistoryEntry(index)
      return
    }

    setEditingHistory((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, amount: Math.abs(newAmount) } : entry)),
    )
  }

  const handleAddHistoryEntry = () => {
    if (!eventToEdit) return

    // Add a new entry with default values
    const newEntry: DrinkHistoryEntry = {
      beverageId: "new-entry",
      beverageName: "Neues Getränk",
      amount: 1,
      timestamp: new Date(),
      type: "add",
      beverageIcon: "🥤",
      beverageColor: "#3f51b5",
    }

    setEditingHistory((prev) => [...prev, newEntry])
  }

  const saveEditedEvent = () => {
    if (!eventToEdit) return

    // Recalculate beverages based on edited history
    const beverageMap = new Map<string, { count: number; beverage: any }>()

    // Initialize with original beverages
    eventToEdit.beverages.forEach((bev) => {
      beverageMap.set(bev.id, { count: 0, beverage: bev })
    })

    // Apply history entries
    editingHistory.forEach((entry) => {
      const existing = beverageMap.get(entry.beverageId)
      if (existing) {
        existing.count += entry.type === "add" ? entry.amount : -entry.amount
      } else {
        // New beverage from editing
        beverageMap.set(entry.beverageId, {
          count: entry.type === "add" ? entry.amount : -entry.amount,
          beverage: {
            id: entry.beverageId,
            name: entry.beverageName,
            icon: entry.beverageIcon || "🥤",
            color: entry.beverageColor || "#3f51b5",
            available: true,
            category: "custom",
            count: entry.type === "add" ? entry.amount : -entry.amount,
          },
        })
      }
    })

    // Create updated beverages array
    const updatedBeverages = Array.from(beverageMap.values()).map(({ count, beverage }) => ({
      ...beverage,
      count: Math.max(0, count), // Ensure no negative counts
    }))

    const totalServed = updatedBeverages.reduce((sum, b) => sum + b.count, 0)

    // Parse the edited date
    const parsedDate = parseGermanDate(editingEventDate) || eventToEdit.eventDate

    const updatedEvent: CompletedEvent = {
      ...eventToEdit,
      eventName: editingEventName,
      eventDate: parsedDate,
      totalServed,
      beverages: updatedBeverages,
      history: editingHistory,
    }

    // Update in storage
    deleteCompletedEvent(eventToEdit.id)
    // Note: We would need to add an updateCompletedEvent function to event-storage.ts
    // For now, we'll delete and re-add (this is a simplified approach)

    // Update local state
    setCompletedEvents((prev) => prev.map((e) => (e.id === eventToEdit.id ? updatedEvent : e)))

    setShowEditDialog(false)
    setEventToEdit(null)
  }

  const formatDateTime = (date: Date) => {
    if (!isClient) return ""
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    if (!isClient) return ""
    return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
  }

  const formatGermanDate = (date: Date) => {
    if (!isClient) return ""
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const parseGermanDate = (dateString: string): Date | null => {
    const parts = dateString.split("/")
    if (parts.length !== 3) return null

    const day = Number.parseInt(parts[0], 10)
    const month = Number.parseInt(parts[1], 10) - 1 // Month is 0-indexed
    const year = Number.parseInt(parts[2], 10)

    const date = new Date(year, month, day)
    if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
      return date
    }
    return null
  }

  const calculateDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return `${hours}h ${minutes}m`
  }

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  // --- Statistics Calculation ---
  const totalEventsCount = completedEvents.length
  const totalDrinksAcrossAllEvents = completedEvents.reduce((sum, event) => sum + event.totalServed, 0)

  const bestSellingDrinks: { [key: string]: { count: number; icon: string; color: string; name: string } } = {}
  completedEvents.forEach((event) => {
    event.beverages.forEach((b) => {
      if (b.count > 0) {
        if (!bestSellingDrinks[b.id]) {
          bestSellingDrinks[b.id] = { count: 0, icon: b.icon, color: b.color, name: b.name }
        }
        bestSellingDrinks[b.id].count += b.count
      }
    })
  })

  const sortedBestSellingDrinks = Object.entries(bestSellingDrinks)
    .sort(([, dataA], [, dataB]) => dataB.count - dataA.count)
    .slice(0, 5) // Top 5
    .map(([id, data]) => ({
      id,
      ...data,
    }))

  const mostSuccessfulEvent = completedEvents.reduce(
    (maxEvent, currentEvent) => (currentEvent.totalServed > maxEvent.totalServed ? currentEvent : maxEvent),
    { totalServed: -1 } as CompletedEvent,
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 max-w-2xl md:max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center py-8 md:py-16">
        <h1 className="text-3xl md:text-5xl font-light text-gray-800 mb-4 md:mb-6">Veranstaltungsübersicht</h1>
        <p className="text-lg md:text-2xl text-gray-600">Vergangene Events und Statistiken</p>
      </div>

      {/* Global Statistics */}
      <Card className="mb-8 md:mb-16 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-medium flex items-center">
            <BarChart3 className="w-7 h-7 md:w-10 md:h-10 mr-3 md:mr-4" /> Globale Statistiken
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="flex justify-between text-lg md:text-xl">
            <span className="text-gray-500">Anzahl der Veranstaltungen</span>
            <span className="font-semibold">{totalEventsCount}</span>
          </div>
          <div className="flex justify-between text-lg md:text-xl">
            <span className="text-gray-500">Gesamt servierte Getränke</span>
            <span className="font-semibold">{totalDrinksAcrossAllEvents}</span>
          </div>
          {totalEventsCount > 0 && (
            <div className="flex justify-between text-lg md:text-xl">
              <span className="text-gray-500">Durchschnitt pro Event</span>
              <span className="font-semibold">{(totalDrinksAcrossAllEvents / totalEventsCount).toFixed(1)}</span>
            </div>
          )}
          {mostSuccessfulEvent.totalServed > -1 && (
            <div className="flex justify-between text-lg md:text-xl">
              <span className="text-gray-500">Erfolgreichstes Event</span>
              <span className="font-semibold">
                {mostSuccessfulEvent.eventName} ({mostSuccessfulEvent.totalServed} Getränke)
              </span>
            </div>
          )}
          {sortedBestSellingDrinks.length > 0 && (
            <div>
              <h3 className="text-lg md:text-xl font-medium mt-6 md:mt-8 mb-3 md:mb-4">
                Top 5 meistverkaufte Getränke:
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {sortedBestSellingDrinks.map((drink, index) => (
                  <li key={drink.id} className="flex justify-between items-center text-base md:text-lg text-gray-700">
                    <span className="flex items-center gap-2 md:gap-3">
                      <span className="font-semibold">{index + 1}.</span>
                      <span className="text-2xl md:text-3xl">{drink.icon}</span>
                      <span style={{ color: drink.color }}>{drink.name}</span>
                    </span>
                    <span className="font-semibold">{drink.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* List of Completed Events */}
      <div className="space-y-4 md:space-y-8 mb-8 md:mb-16">
        {completedEvents.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-8 md:p-16 text-center text-gray-500">
              <div className="text-xl md:text-2xl">Noch keine abgeschlossenen Veranstaltungen vorhanden.</div>
            </CardContent>
          </Card>
        ) : (
          completedEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden shadow-lg">
              <Collapsible
                open={openEventId === event.id}
                onOpenChange={() => setOpenEventId(openEventId === event.id ? null : event.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="w-full cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="p-6 md:p-12">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl md:text-3xl font-medium">
                            {event.eventName || "Unbenanntes Event"}
                          </div>
                          <div className="text-lg md:text-xl text-gray-600 mt-1 md:mt-2">
                            {formatDateTime(event.eventDate)}
                          </div>
                          <div className="text-base md:text-lg text-gray-500 mt-1">
                            Dauer: {calculateDuration(event.eventStartedAt, event.eventCompletedAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 md:gap-6">
                          <div className="text-3xl md:text-4xl font-semibold">{event.totalServed}</div>
                          <div className="text-lg md:text-xl text-gray-500">Getränke</div>
                          {openEventId === event.id ? (
                            <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
                          ) : (
                            <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-gray-100 p-6 md:p-12">
                    <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Verkaufte Getränke:</h3>
                    <ul className="space-y-2 md:space-y-4 mb-6 md:mb-8">
                      {event.beverages
                        .filter((b) => b.count > 0)
                        .map((beverage) => (
                          <li key={beverage.id} className="flex justify-between text-lg md:text-xl text-gray-700">
                            <span className="flex items-center gap-3 md:gap-4">
                              <span className="text-2xl md:text-3xl">{beverage.icon}</span>
                              <span style={{ color: beverage.color }}>{beverage.name}</span>
                            </span>
                            <span className="font-semibold">{beverage.count}</span>
                          </li>
                        ))}
                    </ul>

                    {event.history && event.history.length > 0 && (
                      <>
                        <h3 className="text-xl md:text-2xl font-semibold mt-6 md:mt-8 mb-4 md:mb-6">
                          Historie der Aktionen:
                        </h3>
                        <ul className="space-y-2 md:space-y-3 text-lg md:text-xl">
                          {event.history.map((entry, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <span
                                className={`font-medium ${
                                  entry.type === "add" ? "text-green-600" : "text-red-600"
                                } flex items-center gap-2 md:gap-3`}
                              >
                                {entry.type === "add" ? "+" : "-"} {Math.abs(entry.amount)}x
                                {entry.beverageIcon && (
                                  <span className="text-2xl md:text-3xl">{entry.beverageIcon}</span>
                                )}
                                <span style={{ color: entry.beverageColor }}>{entry.beverageName}</span>
                              </span>
                              <span className="text-base md:text-lg text-gray-500">{formatTime(entry.timestamp)}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <div className="flex gap-3 md:gap-6 mt-6 md:mt-8">
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent h-14 md:h-20 text-lg md:text-xl"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="w-5 h-5 md:w-7 md:h-7 mr-2 md:mr-3" />
                        Event bearbeiten
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent h-14 md:h-20 w-14 md:w-20 p-0"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="w-5 h-5 md:w-7 md:h-7" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 md:space-y-8">
        <Button className="w-full h-16 md:h-24 text-xl md:text-2xl" onClick={onBack}>
          <ArrowLeft className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4" />
          Zurück zum Admin-Panel
        </Button>
        {completedEvents.length > 0 && (
          <Button
            variant="outline"
            className="w-full bg-transparent text-red-600 border-red-200 hover:bg-red-50 h-16 md:h-24 text-xl md:text-2xl"
            onClick={handleClearAllEvents}
          >
            <Trash2 className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4" />
            Alle Events löschen
          </Button>
        )}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-5xl md:max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl">Event bearbeiten</DialogTitle>
            <DialogDescription className="text-lg md:text-xl">
              Bearbeiten Sie die Eventdaten und korrigieren Sie falsche Einträge in der Historie.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8 md:space-y-12 py-6 md:py-8">
            {/* Event Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <Label htmlFor="editEventName" className="text-lg md:text-xl mb-2 block">
                  Veranstaltungsname
                </Label>
                <Input
                  id="editEventName"
                  value={editingEventName}
                  onChange={(e) => setEditingEventName(e.target.value)}
                  className="h-14 md:h-20 text-lg md:text-xl"
                />
              </div>
              <div>
                <Label htmlFor="editEventDate" className="text-lg md:text-xl mb-2 block">
                  Datum (TT/MM/JJJJ)
                </Label>
                <Input
                  id="editEventDate"
                  value={editingEventDate}
                  onChange={(e) => setEditingEventDate(e.target.value)}
                  placeholder="TT/MM/JJJJ"
                  className="h-14 md:h-20 text-lg md:text-xl"
                />
              </div>
            </div>

            {/* History Editing */}
            <div>
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-2xl md:text-3xl font-semibold">Historie bearbeiten</h3>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAddHistoryEntry}
                  className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent h-12 md:h-16 text-lg md:text-xl"
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                  Eintrag hinzufügen
                </Button>
              </div>

              <div className="space-y-3 md:space-y-4 max-h-80 md:max-h-96 overflow-y-auto border rounded-lg p-4 md:p-6">
                {editingHistory.map((entry, index) => (
                  <div key={index} className="flex items-center gap-4 md:gap-6 p-3 md:p-4 bg-gray-50 rounded">
                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                      <span className="text-2xl md:text-3xl">{entry.beverageIcon}</span>
                      <span className="font-medium text-lg md:text-xl" style={{ color: entry.beverageColor }}>
                        {entry.beverageName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-10 h-10 md:w-12 md:h-12 p-0 bg-transparent"
                        onClick={() => handleEditHistoryEntry(index, entry.amount - 1)}
                      >
                        <Minus className="w-4 h-4 md:w-5 md:h-5" />
                      </Button>

                      <Input
                        type="number"
                        value={entry.amount}
                        onChange={(e) => handleEditHistoryEntry(index, Number.parseInt(e.target.value) || 0)}
                        className="w-20 md:w-24 text-center h-10 md:h-12 text-lg md:text-xl"
                        min="0"
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-10 h-10 md:w-12 md:h-12 p-0 bg-transparent"
                        onClick={() => handleEditHistoryEntry(index, entry.amount + 1)}
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                      </Button>
                    </div>

                    <div className="text-sm md:text-base text-gray-500 min-w-fit">{formatTime(entry.timestamp)}</div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-10 h-10 md:w-12 md:h-12 p-0 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                      onClick={() => handleDeleteHistoryEntry(index)}
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 md:mt-8 p-4 md:p-6 bg-blue-50 rounded-lg">
                <div className="text-lg md:text-xl text-gray-600">
                  Gesamt nach Bearbeitung:{" "}
                  <span className="font-bold text-blue-600 text-xl md:text-2xl">
                    {editingHistory.reduce(
                      (sum, entry) => sum + (entry.type === "add" ? entry.amount : -entry.amount),
                      0,
                    )}{" "}
                    Getränke
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-4 md:gap-6">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="h-12 md:h-16 text-lg md:text-xl px-6 md:px-8"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 mr-2" />
              Abbrechen
            </Button>
            <Button onClick={saveEditedEvent} className="h-12 md:h-16 text-lg md:text-xl px-6 md:px-8">
              <Save className="w-5 h-5 md:w-6 md:h-6 mr-2" />
              Änderungen speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Events Confirmation Dialog */}
      <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl">Alle abgeschlossenen Events löschen?</DialogTitle>
            <DialogDescription className="text-lg md:text-xl">
              Diese Aktion löscht die gesamte Historie Ihrer abgeschlossenen Veranstaltungen. Dies kann nicht rückgängig
              gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 md:gap-6">
            <Button
              variant="outline"
              onClick={() => setShowClearAllDialog(false)}
              className="h-12 md:h-16 text-lg md:text-xl px-6 md:px-8"
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={confirmClearAllEvents}
              className="h-12 md:h-16 text-lg md:text-xl px-6 md:px-8"
            >
              Alle löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single Event Confirmation Dialog */}
      <Dialog open={showDeleteOneDialog} onOpenChange={setShowDeleteOneDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl">Event löschen?</DialogTitle>
            <DialogDescription className="text-lg md:text-xl">
              Möchten Sie dieses Event wirklich aus der Historie löschen? Dies kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 md:gap-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteOneDialog(false)}
              className="h-12 md:h-16 text-lg md:text-xl px-6 md:px-8"
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteEvent}
              className="h-12 md:h-16 text-lg md:text-xl px-6 md:px-8"
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
