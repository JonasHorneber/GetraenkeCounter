"use client"

import { useState, useEffect } from "react"
import { type BeverageType, ALL_BEVERAGES } from "../types/beverage"
import { saveToStorage, loadFromStorage, getEventInfo } from "../utils/storage"
import AdminScreen from "./admin-screen"
import BartenderScreen from "./bartender-screen"
import DrinkScreen from "./drink-screen"

export default function BeverageCounter() {
  const [beverages, setBeverages] = useState<BeverageType[]>(ALL_BEVERAGES)
  const [currentRole, setCurrentRole] = useState<"admin" | "bartender" | "customer">("admin")
  const [selectedBeverage, setSelectedBeverage] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = loadFromStorage()
    if (savedData) {
      setBeverages(savedData)
    }
    setIsLoaded(true)
  }, [])

  // Save data to localStorage whenever beverages change
  useEffect(() => {
    if (isLoaded) {
      const eventInfo = getEventInfo()
      saveToStorage(beverages, eventInfo.eventName, eventInfo.eventDate)
    }
  }, [beverages, isLoaded])

  // Auto-save every 30 seconds as backup
  useEffect(() => {
    if (!isLoaded) return

    const interval = setInterval(() => {
      const eventInfo = getEventInfo()
      saveToStorage(beverages, eventInfo.eventName, eventInfo.eventDate)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [beverages, isLoaded])

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const eventInfo = getEventInfo()
      saveToStorage(beverages, eventInfo.eventName, eventInfo.eventDate)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [beverages])

  const toggleBeverageAvailability = (id: string) => {
    setBeverages((prev) => prev.map((b) => (b.id === id ? { ...b, available: !b.available } : b)))
  }

  const addDrinks = (beverageId: string, count: number) => {
    setBeverages((prev) =>
      prev.map((b) =>
        b.id === beverageId
          ? {
              ...b,
              count: b.count + count,
              lastIncrement: new Date(),
              lastIncrementAmount: count,
            }
          : b,
      ),
    )
  }

  const undoLastIncrement = (beverageId: string) => {
    setBeverages((prev) =>
      prev.map((b) => {
        if (b.id === beverageId && b.lastIncrementAmount) {
          return {
            ...b,
            count: Math.max(0, b.count - b.lastIncrementAmount),
            lastIncrement: undefined,
            lastIncrementAmount: undefined,
          }
        }
        return b
      }),
    )
  }

  const resetAllData = () => {
    setBeverages(ALL_BEVERAGES)
  }

  const handleSelectBeverage = (id: string) => {
    setSelectedBeverage(id)
    setCurrentRole("customer")
  }

  const handleBackToBartender = () => {
    setSelectedBeverage(null)
    setCurrentRole("bartender")
  }

  const handleSwitchRole = (role: "admin" | "bartender" | "customer") => {
    setCurrentRole(role)
    if (role !== "customer") {
      setSelectedBeverage(null)
    }
  }

  // Show loading state while data is being loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-light text-gray-600 mb-2">Loading...</div>
          <div className="text-sm text-gray-500">Restoring your data</div>
        </div>
      </div>
    )
  }

  // Admin Screen
  if (currentRole === "admin") {
    return (
      <AdminScreen
        beverages={beverages}
        onToggleBeverage={toggleBeverageAvailability}
        onSwitchRole={handleSwitchRole}
        onResetData={resetAllData}
      />
    )
  }

  // Bartender Screen
  if (currentRole === "bartender") {
    return (
      <BartenderScreen beverages={beverages} onSelectBeverage={handleSelectBeverage} onSwitchRole={handleSwitchRole} />
    )
  }

  // Drink Screen (Customer View)
  if (currentRole === "customer" && selectedBeverage) {
    const beverage = beverages.find((b) => b.id === selectedBeverage)!
    return (
      <DrinkScreen
        beverage={beverage}
        onAddDrinks={(count) => addDrinks(selectedBeverage, count)}
        onUndoLastIncrement={() => undoLastIncrement(selectedBeverage)}
        onBack={handleBackToBartender}
      />
    )
  }

  // Fallback
  return (
    <AdminScreen
      beverages={beverages}
      onToggleBeverage={toggleBeverageAvailability}
      onSwitchRole={handleSwitchRole}
      onResetData={resetAllData}
    />
  )
}
