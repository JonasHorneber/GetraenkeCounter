"use client"

import { useState } from "react"
import { type BeverageType, ALL_BEVERAGES } from "../types/beverage"
import AdminScreen from "./admin-screen"
import BartenderScreen from "./bartender-screen"
import DrinkScreen from "./drink-screen"

export default function BeverageCounter() {
  const [beverages, setBeverages] = useState<BeverageType[]>(ALL_BEVERAGES)
  const [currentRole, setCurrentRole] = useState<"admin" | "bartender" | "customer">("admin")
  const [selectedBeverage, setSelectedBeverage] = useState<string | null>(null)

  const toggleBeverageAvailability = (id: string) => {
    setBeverages((prev) => prev.map((b) => (b.id === id ? { ...b, available: !b.available } : b)))
  }

  const addDrinks = (beverageId: string, count: number) => {
    setBeverages((prev) => prev.map((b) => (b.id === beverageId ? { ...b, count: b.count + count } : b)))
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

  // Admin Screen
  if (currentRole === "admin") {
    return (
      <AdminScreen
        beverages={beverages}
        onToggleBeverage={toggleBeverageAvailability}
        onSwitchRole={handleSwitchRole}
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
        onBack={handleBackToBartender}
      />
    )
  }

  // Fallback
  return (
    <AdminScreen beverages={beverages} onToggleBeverage={toggleBeverageAvailability} onSwitchRole={handleSwitchRole} />
  )
}
