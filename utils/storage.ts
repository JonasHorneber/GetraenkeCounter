import type { BeverageType } from "../types/beverage"

const STORAGE_KEY = "beverage-counter-data"
const STORAGE_VERSION = "1.0"

interface StorageData {
  version: string
  eventDate: string
  eventName?: string
  beverages: BeverageType[]
  lastSaved: string
  totalServed: number
  eventStarted?: string
}

export const saveToStorage = (beverages: BeverageType[], eventName?: string, eventDate?: string) => {
  try {
    const totalServed = beverages.reduce((sum, b) => sum + b.count, 0)
    const existingData = loadStorageData()

    const data: StorageData = {
      version: STORAGE_VERSION,
      eventDate: eventDate || existingData?.eventDate || new Date().toISOString().split("T")[0],
      eventName: eventName || existingData?.eventName,
      eventStarted: existingData?.eventStarted || new Date().toISOString(),
      beverages: beverages.map((b) => ({
        ...b,
        lastIncrement: b.lastIncrement ? b.lastIncrement.toISOString() : undefined,
      })),
      lastSaved: new Date().toISOString(),
      totalServed,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log("Data saved to localStorage at", new Date().toLocaleTimeString())
  } catch (error) {
    console.error("Failed to save data to localStorage:", error)
  }
}

const loadStorageData = (): StorageData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (error) {
    console.error("Failed to parse storage data:", error)
    return null
  }
}

export const loadFromStorage = (): BeverageType[] | null => {
  try {
    const data = loadStorageData()
    if (!data) return null

    // Version check for future compatibility
    if (data.version !== STORAGE_VERSION) {
      console.warn("Storage version mismatch, using default data")
      return null
    }

    // Convert ISO strings back to Date objects
    const beverages = data.beverages.map((b) => ({
      ...b,
      lastIncrement: b.lastIncrement ? new Date(b.lastIncrement) : undefined,
    }))

    console.log("Data loaded from localStorage, last saved:", new Date(data.lastSaved).toLocaleTimeString())
    return beverages
  } catch (error) {
    console.error("Failed to load data from localStorage:", error)
    return null
  }
}

export const getEventInfo = () => {
  const data = loadStorageData()
  return {
    eventDate: data?.eventDate || new Date().toISOString().split("T")[0],
    eventName: data?.eventName,
    eventStarted: data?.eventStarted,
    totalServed: data?.totalServed || 0,
    lastSaved: data?.lastSaved,
  }
}

export const updateEventInfo = (eventName: string, eventDate: string) => {
  const data = loadStorageData()
  if (data) {
    data.eventName = eventName
    data.eventDate = eventDate
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

export const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log("Storage cleared")
  } catch (error) {
    console.error("Failed to clear storage:", error)
  }
}

export const exportData = (): string => {
  try {
    const data = loadStorageData()
    if (!data) return ""

    // Create a more organized export format
    const exportData = {
      eventInfo: {
        name: data.eventName || "Untitled Event",
        date: data.eventDate,
        started: data.eventStarted,
        totalServed: data.totalServed,
        lastUpdated: data.lastSaved,
      },
      summary: {
        totalBeverages: data.beverages.length,
        availableBeverages: data.beverages.filter((b) => b.available).length,
        categorySummary: getCategorySummary(data.beverages),
      },
      beverageData: data.beverages.map((b) => ({
        name: b.name,
        category: b.category,
        available: b.available,
        count: b.count,
        lastServed: b.lastIncrement,
        lastAmount: b.lastIncrementAmount,
      })),
      metadata: {
        exportedAt: new Date().toISOString(),
        version: data.version,
      },
    }

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error("Failed to export data:", error)
    return ""
  }
}

const getCategorySummary = (beverages: BeverageType[]) => {
  const categories = ["sprizz", "cocktails", "longdrinks", "schnaps", "alcohol-free"]
  return categories.reduce(
    (summary, category) => {
      const categoryBeverages = beverages.filter((b) => b.category === category && b.available)
      const totalServed = categoryBeverages.reduce((sum, b) => sum + b.count, 0)

      if (categoryBeverages.length > 0) {
        summary[category] = {
          availableDrinks: categoryBeverages.length,
          totalServed,
          topDrink: categoryBeverages.reduce((top, current) => (current.count > top.count ? current : top)).name,
        }
      }

      return summary
    },
    {} as Record<string, any>,
  )
}

export const importData = (jsonString: string): BeverageType[] | null => {
  try {
    const data = JSON.parse(jsonString)

    // Handle both old and new export formats
    let beverages: any[]
    if (data.beverageData) {
      // New format
      beverages = data.beverageData
    } else if (data.beverages) {
      // Old format
      beverages = data.beverages
    } else {
      throw new Error("Invalid data format")
    }

    if (!Array.isArray(beverages)) {
      throw new Error("Invalid data format")
    }

    // Convert back to full beverage format
    const importedBeverages = beverages.map((b) => ({
      id: b.id || b.name.toLowerCase().replace(/\s+/g, "-"),
      name: b.name,
      icon: b.icon || "🍹",
      color: b.color || "#666666",
      count: b.count || 0,
      available: b.available || false,
      category: b.category || "cocktails",
      lastIncrement: b.lastServed ? new Date(b.lastServed) : undefined,
      lastIncrementAmount: b.lastAmount,
    }))

    return importedBeverages
  } catch (error) {
    console.error("Failed to import data:", error)
    return null
  }
}
