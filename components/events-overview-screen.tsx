"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Calendar,
  TrendingUp,
  Trophy,
  BarChart3,
  Trash2,
  Download,
  ArrowLeft,
} from "lucide-react"
import type { CompletedEvent, EventStatistics } from "../types/event"
import {
  loadCompletedEvents,
  deleteCompletedEvent,
  calculateEventStatistics,
  exportAllEvents,
} from "../utils/event-storage"

interface EventsOverviewScreenProps {
  onBack: () => void
}

export default function EventsOverviewScreen({ onBack }: EventsOverviewScreenProps) {
  const [events, setEvents] = useState<CompletedEvent[]>([])
  const [statistics, setStatistics] = useState<EventStatistics | null>(null)
  const [openEvents, setOpenEvents] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [showStatsDialog, setShowStatsDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const loadedEvents = loadCompletedEvents()
    const stats = calculateEventStatistics()
    setEvents(loadedEvents)
    setStatistics(stats)
  }

  const toggleEvent = (eventId: string) => {
    setOpenEvents((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }

  const handleDeleteEvent = (eventId: string) => {
    deleteCompletedEvent(eventId)
    loadData()
    setShowDeleteDialog(null)
  }

  const handleExportAll = () => {
    const data = exportAllEvents()
    if (data) {
      const filename = `alle-veranstaltungen-${new Date().toISOString().split("T")[0]}.json`
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!statistics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-light text-gray-600 mb-2">Lädt...</div>
          <div className="text-sm text-gray-500">Veranstaltungsdaten werden geladen</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-light text-gray-800">Veranstaltungsübersicht</h1>
          <p className="text-sm text-gray-600">
            {statistics.totalEvents} Veranstaltung{statistics.totalEvents !== 1 ? "en" : ""} •{" "}
            {statistics.totalDrinksServed} Getränke serviert
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-blue-600">{statistics.totalEvents}</div>
            <div className="text-sm text-gray-500">Veranstaltungen</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-green-600">{statistics.averageDrinksPerEvent}</div>
            <div className="text-sm text-gray-500">⌀ pro Event</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          variant="outline"
          className="flex-1 bg-transparent"
          onClick={() => setShowStatsDialog(true)}
          disabled={statistics.totalEvents === 0}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Statistiken
        </Button>
        <Button
          variant="outline"
          className="flex-1 bg-transparent"
          onClick={handleExportAll}
          disabled={statistics.totalEvents === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportieren
        </Button>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-600 mb-2">Keine Veranstaltungen</div>
            <div className="text-sm text-gray-500">Abgeschlossene Veranstaltungen werden hier angezeigt</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const isOpen = openEvents.includes(event.id)
            return (
              <Card key={event.id} className="overflow-hidden">
                <Collapsible open={isOpen} onOpenChange={() => toggleEvent(event.id)}>
                  <CollapsibleTrigger asChild>
                    <div className="w-full cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-lg font-medium text-gray-800 mb-1">{event.name}</div>
                            <div className="text-sm text-gray-500 mb-2">{formatDate(event.date)}</div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">{event.totalServed} Getränke</span>
                              {event.duration && <span className="text-gray-600">{event.duration}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{event.totalServed}</span>
                            </div>
                            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-gray-100">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-gray-700">Servierte Getränke</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowDeleteDialog(event.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {event.beverages
                            .sort((a, b) => b.count - a.count)
                            .map((beverage) => (
                              <div
                                key={beverage.id}
                                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{beverage.icon}</span>
                                  <span className="font-medium" style={{ color: beverage.color }}>
                                    {beverage.name}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold" style={{ color: beverage.color }}>
                                    {beverage.count}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                          Abgeschlossen: {formatDateTime(event.completedAt)}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>
      )}

      {/* Statistics Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Statistiken
            </DialogTitle>
            <DialogDescription>Übersicht über alle Ihre Veranstaltungen</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Overall Stats */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Gesamtübersicht</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-semibold text-blue-600">{statistics.totalEvents}</div>
                  <div className="text-xs text-blue-600">Veranstaltungen</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-semibold text-green-600">{statistics.totalDrinksServed}</div>
                  <div className="text-xs text-green-600">Getränke gesamt</div>
                </div>
              </div>
            </div>

            {/* Top Drinks */}
            {statistics.topDrinks.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Beliebteste Getränke
                </h4>
                <div className="space-y-2">
                  {statistics.topDrinks.slice(0, 5).map((drink, index) => (
                    <div key={drink.name} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-semibold text-yellow-600">
                          {index + 1}
                        </div>
                        <span className="text-sm">{drink.icon}</span>
                        <span className="text-sm font-medium" style={{ color: drink.color }}>
                          {drink.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{drink.totalCount}</div>
                        <div className="text-xs text-gray-500">{drink.eventsServedIn} Events</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Most Popular Event */}
            {statistics.mostPopularEvent && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Erfolgreichste Veranstaltung</h4>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-800">{statistics.mostPopularEvent.name}</div>
                  <div className="text-sm text-purple-600">
                    {formatDate(statistics.mostPopularEvent.date)} • {statistics.mostPopularEvent.totalServed} Getränke
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatsDialog(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Veranstaltung löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diese Veranstaltung dauerhaft löschen möchten? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={() => showDeleteDialog && handleDeleteEvent(showDeleteDialog)}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
