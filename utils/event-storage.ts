import type { BeverageType } from "../types/beverage"
import type { CompletedEvent, EventStatistics } from "../types/event"
import { BEVERAGE_CATEGORIES } from "../types/beverage"

const EVENTS_STORAGE_KEY = "beverage-counter-events"
const EVENTS_VERSION = "1.0"

interface EventsStorageData {
  version: string
  events: CompletedEvent[]
  lastUpdated: string
}

export const saveCompletedEvent = (
  eventName: string,
  eventDate: string,
  beverages: BeverageType[],
  eventStarted?: string,
) => {
  try {
    const existingData = loadEventsData()
    const servedBeverages = beverages.filter((b) => b.available && b.count > 0)

    const completedEvent: CompletedEvent = {
      id: `${eventDate}-${Date.now()}`,
      name: eventName || "Unbenannte Veranstaltung",
      date: eventDate,
      completedAt: new Date().toISOString(),
      beverages: servedBeverages.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.category,
        count: b.count,
        icon: b.icon,
        color: b.color,
      })),
      totalServed: servedBeverages.reduce((sum, b) => sum + b.count, 0),
      duration: eventStarted ? calculateDuration(eventStarted, new Date().toISOString()) : undefined,
    }

    const events = existingData?.events || []

    // Check if event already exists (same date and name) and update it
    const existingIndex = events.findIndex((e) => e.date === eventDate && e.name === completedEvent.name)
    if (existingIndex >= 0) {
      events[existingIndex] = completedEvent
    } else {
      events.push(completedEvent)
    }

    const data: EventsStorageData = {
      version: EVENTS_VERSION,
      events: events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      lastUpdated: new Date().toISOString(),
    }

    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(data))
    console.log("Veranstaltung gespeichert:", completedEvent.name)
  } catch (error) {
    console.error("Fehler beim Speichern der Veranstaltung:", error)
  }
}

const loadEventsData = (): EventsStorageData | null => {
  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (error) {
    console.error("Fehler beim Laden der Veranstaltungsdaten:", error)
    return null
  }
}

export const loadCompletedEvents = (): CompletedEvent[] => {
  const data = loadEventsData()
  return data?.events || []
}

export const deleteCompletedEvent = (eventId: string) => {
  try {
    const data = loadEventsData()
    if (!data) return

    data.events = data.events.filter((e) => e.id !== eventId)
    data.lastUpdated = new Date().toISOString()

    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(data))
    console.log("Veranstaltung gelöscht:", eventId)
  } catch (error) {
    console.error("Fehler beim Löschen der Veranstaltung:", error)
  }
}

export const calculateEventStatistics = (): EventStatistics => {
  const events = loadCompletedEvents()

  if (events.length === 0) {
    return {
      totalEvents: 0,
      totalDrinksServed: 0,
      averageDrinksPerEvent: 0,
      topDrinks: [],
      topCategories: [],
      mostPopularEvent: null,
    }
  }

  const totalDrinksServed = events.reduce((sum, event) => sum + event.totalServed, 0)
  const averageDrinksPerEvent = Math.round(totalDrinksServed / events.length)

  // Calculate top drinks across all events
  const drinkCounts = new Map<
    string,
    {
      name: string
      totalCount: number
      category: string
      icon: string
      color: string
      eventsServedIn: number
    }
  >()

  events.forEach((event) => {
    const servedDrinks = new Set<string>()
    event.beverages.forEach((beverage) => {
      const key = beverage.id
      servedDrinks.add(key)

      if (drinkCounts.has(key)) {
        const existing = drinkCounts.get(key)!
        existing.totalCount += beverage.count
        existing.eventsServedIn = servedDrinks.size
      } else {
        drinkCounts.set(key, {
          name: beverage.name,
          totalCount: beverage.count,
          category: beverage.category,
          icon: beverage.icon,
          color: beverage.color,
          eventsServedIn: 1,
        })
      }
    })

    // Update events served in count
    servedDrinks.forEach((drinkId) => {
      const drink = drinkCounts.get(drinkId)
      if (drink) {
        drink.eventsServedIn = events.filter((e) => e.beverages.some((b) => b.id === drinkId)).length
      }
    })
  })

  const topDrinks = Array.from(drinkCounts.values())
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 10)

  // Calculate top categories
  const categoryCounts = new Map<string, number>()
  events.forEach((event) => {
    event.beverages.forEach((beverage) => {
      const current = categoryCounts.get(beverage.category) || 0
      categoryCounts.set(beverage.category, current + beverage.count)
    })
  })

  const topCategories = BEVERAGE_CATEGORIES.map((category) => ({
    name: category.name,
    totalCount: categoryCounts.get(category.id) || 0,
    color: category.color,
    icon: category.icon,
  }))
    .filter((cat) => cat.totalCount > 0)
    .sort((a, b) => b.totalCount - a.totalCount)

  // Find most popular event
  const mostPopularEvent = events.reduce(
    (max, event) => (!max || event.totalServed > max.totalServed ? event : max),
    null as CompletedEvent | null,
  )

  return {
    totalEvents: events.length,
    totalDrinksServed,
    averageDrinksPerEvent,
    topDrinks,
    topCategories,
    mostPopularEvent: mostPopularEvent
      ? {
          name: mostPopularEvent.name,
          date: mostPopularEvent.date,
          totalServed: mostPopularEvent.totalServed,
        }
      : null,
  }
}

const calculateDuration = (start: string, end: string): string => {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  const durationMs = endTime - startTime

  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}min`
  }
  return `${minutes}min`
}

export const exportAllEvents = (): string => {
  try {
    const events = loadCompletedEvents()
    const statistics = calculateEventStatistics()

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: EVENTS_VERSION,
        totalEvents: events.length,
      },
      statistics,
      events: events.map((event) => ({
        ...event,
        formattedDate: new Date(event.date).toLocaleDateString("de-DE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      })),
    }

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error("Fehler beim Exportieren aller Veranstaltungen:", error)
    return ""
  }
}
