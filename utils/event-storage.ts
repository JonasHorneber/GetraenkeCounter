import type { CompletedEvent } from "../types/event"
import type { BeverageType } from "../types/beverage"

const COMPLETED_EVENTS_STORAGE_KEY = "beverage_counter_completed_events"
const COMPLETED_EVENTS_VERSION = "1.2" // Increment version for history addition with icon/color

interface StoredCompletedEvent {
  id: string
  eventName: string
  eventDate: string // Stored as ISO string
  eventStartedAt: string // Stored as ISO string
  eventCompletedAt: string // Stored as ISO string
  totalServed: number
  beverages: BeverageType[] // Final state of beverages for this event
  history?: Array<{
    beverageId: string
    beverageName: string
    amount: number
    timestamp: string // Stored as ISO string
    type: "add" | "undo" | "correction"
    beverageIcon?: string
    beverageColor?: string
    reason?: string
  }>
  version: string
}

export function saveCompletedEvent(event: CompletedEvent): void {
  if (typeof window === "undefined") return

  try {
    const storedEvents = getCompletedEvents()
    const serializableEvent: StoredCompletedEvent = {
      ...event,
      eventDate: event.eventDate.toISOString(),
      eventStartedAt: event.eventStartedAt.toISOString(),
      eventCompletedAt: event.eventCompletedAt.toISOString(),
      history: event.history.map((entry) => ({
        ...entry,
        timestamp: entry.timestamp.toISOString(), // Convert Date to ISO string
      })),
      version: COMPLETED_EVENTS_VERSION,
    }
    localStorage.setItem(COMPLETED_EVENTS_STORAGE_KEY, JSON.stringify([...storedEvents, serializableEvent]))
  } catch (e) {
    console.error("Failed to save completed event", e)
  }
}

export function getCompletedEvents(): CompletedEvent[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(COMPLETED_EVENTS_STORAGE_KEY)
    if (!stored) return []

    const parsed: StoredCompletedEvent[] = JSON.parse(stored)
    return parsed.map((event) => ({
      id: event.id,
      eventName: event.eventName,
      eventDate: new Date(event.eventDate),
      eventStartedAt: new Date(event.eventStartedAt),
      eventCompletedAt: new Date(event.eventCompletedAt),
      totalServed: event.totalServed,
      beverages: event.beverages.map((b) => ({
        ...b,
        lastIncrement: b.lastIncrement ? new Date(b.lastIncrement) : undefined,
      })),
      history:
        event.history?.map((entry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp), // Convert ISO string back to Date
        })) || [],
    }))
  } catch (e) {
    console.error("Failed to parse completed events from localStorage", e)
    return []
  }
}

export function clearCompletedEvents(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(COMPLETED_EVENTS_STORAGE_KEY)
  } catch (e) {
    console.error("Failed to clear completed events", e)
  }
}

export function deleteCompletedEvent(id: string): void {
  if (typeof window === "undefined") return

  try {
    const currentEvents = getCompletedEvents()
    const updatedEvents = currentEvents.filter((event) => event.id !== id)
    localStorage.setItem(
      COMPLETED_EVENTS_STORAGE_KEY,
      JSON.stringify(
        updatedEvents.map((event) => ({
          ...event,
          eventDate: event.eventDate.toISOString(),
          eventStartedAt: event.eventStartedAt.toISOString(),
          eventCompletedAt: event.eventCompletedAt.toISOString(),
          history: event.history.map((entry) => ({
            ...entry,
            timestamp: entry.timestamp.toISOString(),
          })),
          version: COMPLETED_EVENTS_VERSION,
        })),
      ),
    )
  } catch (e) {
    console.error("Failed to delete completed event", e)
  }
}
