import type { BeverageType } from "../types/beverage"

const STORAGE_KEY = "beverage-counter-data"
const STORAGE_VERSION = "1.0"

interface StorageData {
  version: string
  beverages: BeverageType[]
  lastSaved: string
}

export const saveToStorage = (beverages: BeverageType[]) => {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      beverages: beverages.map((b) => ({
        ...b,
        lastIncrement: b.lastIncrement ? b.lastIncrement.toISOString() : undefined,
      })),
      lastSaved: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log("Data saved to localStorage at", new Date().toLocaleTimeString())
  } catch (error) {
    console.error("Failed to save data to localStorage:", error)
  }
}

export const loadFromStorage = (): BeverageType[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const data: StorageData = JSON.parse(stored)

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
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return ""

    const data = JSON.parse(stored)
    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error("Failed to export data:", error)
    return ""
  }
}

export const importData = (jsonString: string): BeverageType[] | null => {
  try {
    const data: StorageData = JSON.parse(jsonString)

    if (!data.beverages || !Array.isArray(data.beverages)) {
      throw new Error("Invalid data format")
    }

    // Convert ISO strings back to Date objects
    const beverages = data.beverages.map((b) => ({
      ...b,
      lastIncrement: b.lastIncrement ? new Date(b.lastIncrement) : undefined,
    }))

    return beverages
  } catch (error) {
    console.error("Failed to import data:", error)
    return null
  }
}
