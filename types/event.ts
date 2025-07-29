import type { BeverageType } from "./beverage"

export interface DrinkHistoryEntry {
  timestamp: Date
  beverageId: string
  beverageName: string
  amount: number
  type: "add" | "undo" | "correction"
  beverageIcon?: string
  beverageColor?: string
  reason?: string // Optional reason for undo/correction
}

export interface CompletedEvent {
  id: string
  eventName: string
  eventDate: Date
  eventStartedAt: Date
  eventCompletedAt: Date
  totalServed: number
  beverages: BeverageType[] // Final state of beverages for this event
  history: DrinkHistoryEntry[] // Detailed history of adds/undos
}
