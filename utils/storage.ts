import type { BeverageType } from "../types/beverage"

const BEVERAGES_STORAGE_KEY = "beverage_counter_beverages"
const EVENT_INFO_STORAGE_KEY = "beverage_counter_event_info"

interface EventInfo {
  eventName: string
  eventDate: string
  totalServed: number
  eventStarted?: Date // Optional: when the event started
}

export function getBeverages(): BeverageType[] {
  if (typeof window === "undefined") return []

  try {
    const storedBeverages = localStorage.getItem(BEVERAGES_STORAGE_KEY)
    if (storedBeverages) {
      const parsed = JSON.parse(storedBeverages)
      // Ensure Date objects are correctly parsed if they were stored as ISO strings
      return parsed.map((b: BeverageType) => ({
        ...b,
        lastIncrement: b.lastIncrement ? new Date(b.lastIncrement) : undefined,
      }))
    }
  } catch (e) {
    console.error("Failed to parse beverages from localStorage", e)
  }

  return []
}

export function saveBeverages(beverages: BeverageType[]): void {
  if (typeof window === "undefined") return

  try {
    // Convert Date objects to ISO strings for storage
    const serializableBeverages = beverages.map((b) => ({
      ...b,
      lastIncrement: b.lastIncrement ? b.lastIncrement.toISOString() : undefined,
    }))
    localStorage.setItem(BEVERAGES_STORAGE_KEY, JSON.stringify(serializableBeverages))
  } catch (e) {
    console.error("Failed to save beverages to localStorage", e)
  }
}

export function getEventInfo(): EventInfo {
  const defaultInfo = {
    eventName: "",
    eventDate: new Date().toISOString().split("T")[0],
    totalServed: 0,
  }

  if (typeof window === "undefined") return defaultInfo

  try {
    const storedInfo = localStorage.getItem(EVENT_INFO_STORAGE_KEY)
    if (storedInfo) {
      const parsed = JSON.parse(storedInfo)
      return {
        ...parsed,
        eventStarted: parsed.eventStarted ? new Date(parsed.eventStarted) : undefined,
      }
    }
  } catch (e) {
    console.error("Failed to parse event info from localStorage", e)
  }

  return defaultInfo
}

export function saveEventInfo(eventName: string, eventDate: string, totalServed = 0, eventStarted?: Date): void {
  if (typeof window === "undefined") return

  try {
    const infoToStore = {
      eventName,
      eventDate,
      totalServed,
      eventStarted: eventStarted ? eventStarted.toISOString() : undefined,
    }
    localStorage.setItem(EVENT_INFO_STORAGE_KEY, JSON.stringify(infoToStore))
  } catch (e) {
    console.error("Failed to save event info to localStorage", e)
  }
}

export function clearStorage(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(BEVERAGES_STORAGE_KEY)
    localStorage.removeItem(EVENT_INFO_STORAGE_KEY)
  } catch (e) {
    console.error("Failed to clear storage", e)
  }
}
