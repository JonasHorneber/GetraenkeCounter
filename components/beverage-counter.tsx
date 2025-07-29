"use client"

import { useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { ALL_BEVERAGES } from "../types/beverage"
import type { BeverageType } from "../types/beverage"
import { getBeverages, saveBeverages, getEventInfo, saveEventInfo, clearStorage } from "../utils/storage"
import { saveCompletedEvent } from "../utils/event-storage"
import type { CompletedEvent, DrinkHistoryEntry } from "../types/event"
import AdminScreen from "./admin-screen"
import BartenderScreen from "./bartender-screen"
import DrinkScreen from "./drink-screen"
import EventsOverviewScreen from "./events-overview-screen"
import LoginScreen from "./login-screen"
import { isAuthenticated, login as authLogin, logout as authLogout } from "../utils/auth"

// Static initial states to ensure server/client consistency
const INITIAL_BEVERAGES = ALL_BEVERAGES.map((b) => ({ ...b, available: false, count: 0 }))
const INITIAL_EVENT_NAME = ""
const INITIAL_EVENT_DATE = ""
const INITIAL_ROLE = "admin"
const INITIAL_LOGGED_IN = false

export default function BeverageCounter() {
  // All state starts with static values that are identical on server and client
  const [beverages, setBeverages] = useState<BeverageType[]>(INITIAL_BEVERAGES)
  const [selectedBeverageId, setSelectedBeverageId] = useState<string | null>(null)
  const [currentRole, setCurrentRole] = useState<"admin" | "bartender" | "customer" | "events">(INITIAL_ROLE)
  const [eventName, setEventName] = useState(INITIAL_EVENT_NAME)
  const [eventDate, setEventDate] = useState(INITIAL_EVENT_DATE)
  const [eventStartedAt, setEventStartedAt] = useState<Date | null>(null)
  const [currentEventHistory, setCurrentEventHistory] = useState<DrinkHistoryEntry[]>([])
  const [loggedIn, setLoggedIn] = useState(INITIAL_LOGGED_IN)
  const [isClient, setIsClient] = useState(false)

  // This effect runs only on the client after hydration
  useEffect(() => {
    setIsClient(true)

    // Only after we're definitely on the client, check authentication and load data
    const authenticated = isAuthenticated()
    setLoggedIn(authenticated)

    if (authenticated) {
      // Load stored data
      const storedBeverages = getBeverages()
      if (storedBeverages.length > 0) {
        setBeverages(storedBeverages)
      }

      const info = getEventInfo()
      setEventName(info.eventName || "")
      setEventDate(info.eventDate || new Date().toISOString().split("T")[0])
      setEventStartedAt(info.eventStarted || new Date())
    }
  }, [])

  // Save data whenever relevant state changes (only after client-side hydration)
  useEffect(() => {
    if (!isClient || !loggedIn) return

    saveBeverages(beverages)
    if (eventStartedAt) {
      saveEventInfo(
        eventName,
        eventDate,
        beverages.reduce((sum, b) => sum + b.count, 0),
        eventStartedAt,
      )
    }
  }, [beverages, eventName, eventDate, eventStartedAt, loggedIn, isClient])

  const handleLogin = useCallback((password: string) => {
    if (authLogin(password)) {
      setLoggedIn(true)
      // Re-initialize data after successful login
      const storedBeverages = getBeverages()
      if (storedBeverages.length > 0) {
        setBeverages(storedBeverages)
      }

      const info = getEventInfo()
      setEventName(info.eventName || "")
      setEventDate(info.eventDate || new Date().toISOString().split("T")[0])
      setEventStartedAt(info.eventStarted || new Date())
      return true
    }
    return false
  }, [])

  const handleLogout = useCallback(() => {
    authLogout()
    setLoggedIn(false)
    // Clear current session data on logout
    clearStorage()
    setBeverages(INITIAL_BEVERAGES)
    setEventName(INITIAL_EVENT_NAME)
    setEventDate(INITIAL_EVENT_DATE)
    setEventStartedAt(null)
    setCurrentEventHistory([])
    setSelectedBeverageId(null)
    setCurrentRole(INITIAL_ROLE)
  }, [])

  const handleToggleBeverage = useCallback((id: string) => {
    setBeverages((prevBeverages) => prevBeverages.map((b) => (b.id === id ? { ...b, available: !b.available } : b)))
  }, [])

  const handleSelectBeverage = useCallback((id: string) => {
    setSelectedBeverageId(id)
    setCurrentRole("customer") // Switch to customer view (drink screen)
  }, [])

  const handleAddDrinks = useCallback(
    (id: string, amount: number) => {
      setBeverages((prevBeverages) =>
        prevBeverages.map((b) => {
          if (b.id === id) {
            const newCount = b.count + amount
            const newBeverage = {
              ...b,
              count: newCount,
              lastIncrement: new Date(),
              lastIncrementAmount: amount,
            }
            // Add to current event history
            setCurrentEventHistory((prevHistory) => [
              ...prevHistory,
              {
                beverageId: id,
                beverageName: b.name,
                amount: amount,
                timestamp: new Date(),
                type: "add",
                beverageIcon: b.icon,
                beverageColor: b.color,
              },
            ])
            return newBeverage
          }
          return b
        }),
      )
    },
    [setCurrentEventHistory],
  )

  const handleUndoLastIncrement = useCallback(
    (beverageId?: string) => {
      setBeverages((prevBeverages) => {
        const updatedBeverages = prevBeverages.map((b) => {
          // If beverageId is provided, only undo for that specific beverage
          // Otherwise, undo for any beverage that has a recent increment
          const shouldUndo = beverageId ? b.id === beverageId : b.lastIncrement && b.lastIncrementAmount && b.count > 0

          if (shouldUndo && b.lastIncrement && b.lastIncrementAmount && b.count > 0) {
            const newCount = b.count - b.lastIncrementAmount
            // Add to current event history as an undo
            setCurrentEventHistory((prevHistory) => [
              ...prevHistory,
              {
                beverageId: b.id,
                beverageName: b.name,
                amount: -b.lastIncrementAmount, // Negative amount for undo
                timestamp: new Date(),
                type: "undo",
                beverageIcon: b.icon,
                beverageColor: b.color,
              },
            ])
            return {
              ...b,
              count: newCount < 0 ? 0 : newCount,
              lastIncrement: undefined,
              lastIncrementAmount: undefined,
            }
          }
          return b
        })
        return updatedBeverages
      })
    },
    [setCurrentEventHistory],
  )

  const handleResetData = useCallback(() => {
    // Save current event as completed before resetting
    const totalServed = beverages.reduce((sum, b) => sum + b.count, 0)
    if (totalServed > 0 && eventName.trim() !== "" && eventStartedAt) {
      const completedEvent: CompletedEvent = {
        id: uuidv4(),
        eventName: eventName,
        eventDate: new Date(eventDate),
        eventStartedAt: eventStartedAt,
        eventCompletedAt: new Date(),
        totalServed: totalServed,
        beverages: beverages.map((b) => ({ ...b, lastIncrement: undefined, lastIncrementAmount: undefined })), // Store final state
        history: currentEventHistory, // Store detailed history
      }
      saveCompletedEvent(completedEvent)
    }

    clearStorage() // Clear current event data
    setBeverages(INITIAL_BEVERAGES) // Reset to static initial state
    setEventName(INITIAL_EVENT_NAME)
    setEventDate(INITIAL_EVENT_DATE)
    setEventStartedAt(new Date()) // Set new start time for next event
    setCurrentEventHistory([]) // Clear history for new event
    setSelectedBeverageId(null)
    setCurrentRole(INITIAL_ROLE)
  }, [beverages, eventName, eventDate, eventStartedAt, currentEventHistory])

  const handleSwitchRole = useCallback((role: "admin" | "bartender" | "customer" | "events") => {
    setCurrentRole(role)
    if (role === "admin") {
      setSelectedBeverageId(null) // Deselect beverage when going back to admin
    }
  }, [])

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  if (!loggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  switch (currentRole) {
    case "admin":
      return (
        <AdminScreen
          beverages={beverages}
          onToggleBeverage={handleToggleBeverage}
          onSwitchRole={handleSwitchRole}
          onResetData={handleResetData}
          onLogout={handleLogout}
        />
      )
    case "bartender":
      return (
        <BartenderScreen
          beverages={beverages}
          onSelectBeverage={handleSelectBeverage}
          onAddDrinks={handleAddDrinks}
          onUndoLastIncrement={handleUndoLastIncrement}
          onSwitchRole={handleSwitchRole}
        />
      )
    case "customer":
      const selectedBeverage = beverages.find((b) => b.id === selectedBeverageId)
      if (!selectedBeverage) {
        // Fallback if beverage not found (e.g., after reset or direct link)
        setCurrentRole("bartender")
        return null
      }
      return (
        <DrinkScreen
          beverage={selectedBeverage}
          onAddDrinks={(amount) => handleAddDrinks(selectedBeverage.id, amount)}
          onUndoLastIncrement={() => handleUndoLastIncrement(selectedBeverage.id)}
          onBack={() => setCurrentRole("bartender")}
        />
      )
    case "events":
      return <EventsOverviewScreen onBack={() => setCurrentRole("admin")} />
    default:
      return null
  }
}
