"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight, Settings, Plus, Minus, Check, Clock, Undo2, ArrowRight } from "lucide-react"
import type { BeverageType } from "../types/beverage"
import { BEVERAGE_CATEGORIES } from "../types/beverage"

interface BartenderScreenProps {
  beverages: BeverageType[]
  onSelectBeverage: (id: string) => void
  onAddDrinks: (id: string, amount: number) => void
  onUndoLastIncrement: (beverageId: string) => void
  onSwitchRole: (role: "admin" | "bartender" | "customer" | "events") => void
}

export default function BartenderScreen({
  beverages,
  onSelectBeverage,
  onAddDrinks,
  onUndoLastIncrement,
  onSwitchRole,
}: BartenderScreenProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([]) // Collapsed by default
  const [pendingChanges, setPendingChanges] = useState<{ [beverageId: string]: number }>({})
  const [selectedBeverageForButtons, setSelectedBeverageForButtons] = useState<string | null>(null)
  const [showUndoDialog, setShowUndoDialog] = useState(false)
  const [beverageToUndo, setBeverageToUndo] = useState<BeverageType | null>(null)
  const [showAdminPasswordDialog, setShowAdminPasswordDialog] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [adminPasswordError, setAdminPasswordError] = useState("")

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const getBeveragesByCategory = (categoryId: string) => {
    return beverages.filter((b) => b.category === categoryId && b.available)
  }

  const getCategoryStats = (categoryId: string) => {
    const categoryBeverages = getBeveragesByCategory(categoryId)
    const totalCount = categoryBeverages.reduce((sum, b) => sum + b.count, 0)
    const availableCount = categoryBeverages.length
    return { availableCount, totalCount }
  }

  const handleToggleBeverageButtons = (beverageId: string) => {
    if (selectedBeverageForButtons === beverageId) {
      setSelectedBeverageForButtons(null)
      // Clear pending changes when hiding buttons
      setPendingChanges((prev) => {
        const newChanges = { ...prev }
        delete newChanges[beverageId]
        return newChanges
      })
    } else {
      setSelectedBeverageForButtons(beverageId)
    }
  }

  const handleIncrement = (beverageId: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [beverageId]: (prev[beverageId] || 0) + 1,
    }))
  }

  const handleDecrement = (beverageId: string) => {
    setPendingChanges((prev) => {
      const currentChange = prev[beverageId] || 0
      if (currentChange > 0) {
        return {
          ...prev,
          [beverageId]: currentChange - 1,
        }
      }
      return prev
    })
  }

  const handleConfirmChange = (beverageId: string) => {
    const change = pendingChanges[beverageId]
    if (change && change > 0) {
      onAddDrinks(beverageId, change)
      setPendingChanges((prev) => {
        const newChanges = { ...prev }
        delete newChanges[beverageId]
        return newChanges
      })
      // Hide buttons after confirming
      setSelectedBeverageForButtons(null)
    }
  }

  const handleUndoBeverage = (beverage: BeverageType) => {
    setBeverageToUndo(beverage)
    setShowUndoDialog(true)
  }

  const confirmUndoBeverage = () => {
    if (beverageToUndo) {
      onUndoLastIncrement(beverageToUndo.id)
      // Clear any pending changes for this beverage
      setPendingChanges((prev) => {
        const newChanges = { ...prev }
        delete newChanges[beverageToUndo.id]
        return newChanges
      })
      // Hide buttons after undo
      setSelectedBeverageForButtons(null)
    }
    setShowUndoDialog(false)
    setBeverageToUndo(null)
  }

  const cancelUndoBeverage = () => {
    setShowUndoDialog(false)
    setBeverageToUndo(null)
  }

  const handleSwitchToAdmin = () => {
    setShowAdminPasswordDialog(true)
    setAdminPassword("")
    setAdminPasswordError("")
  }

  const confirmSwitchToAdmin = () => {
    if (adminPassword === "v0") {
      onSwitchRole("admin")
      setShowAdminPasswordDialog(false)
      setAdminPassword("")
      setAdminPasswordError("")
    } else {
      setAdminPasswordError("Falsches Passwort. Bitte versuchen Sie es erneut.")
    }
  }

  const cancelSwitchToAdmin = () => {
    setShowAdminPasswordDialog(false)
    setAdminPassword("")
    setAdminPasswordError("")
  }

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return null
    return timestamp.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const totalServedAllBeverages = beverages.reduce((sum, b) => sum + b.count, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center py-8 mb-8">
        <h1 className="text-5xl font-light text-gray-800 mb-6">Barkeeper-Panel</h1>
        <p className="text-2xl text-gray-600 mb-4">Wählen Sie ein Getränk zum Servieren</p>
        <div className="text-xl text-gray-500">
          Gesamt serviert: <span className="text-3xl font-bold text-blue-600">{totalServedAllBeverages}</span>
        </div>
      </div>

      {/* Beverage Categories */}
      <div className="space-y-6 mb-8">
        {BEVERAGE_CATEGORIES.map((category) => {
          const categoryBeverages = getBeveragesByCategory(category.id)
          const { availableCount, totalCount } = getCategoryStats(category.id)
          const isOpen = openCategories.includes(category.id)

          // Only show categories that have available beverages
          if (availableCount === 0) return null

          return (
            <Card key={category.id} className="overflow-hidden shadow-lg">
              <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category.id)}>
                <CollapsibleTrigger asChild>
                  <div className="w-full cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="text-4xl">{category.icon}</div>
                          <div>
                            <div className="text-3xl font-medium" style={{ color: category.color }}>
                              {category.name}
                            </div>
                            <div className="text-xl text-gray-500">
                              {availableCount} Getränke • {totalCount} serviert
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                            style={{ backgroundColor: category.color }}
                          >
                            {availableCount}
                          </div>
                          {isOpen ? (
                            <ChevronDown className="w-8 h-8 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-gray-100">
                    {categoryBeverages.map((beverage) => {
                      const pendingChange = pendingChanges[beverage.id] || 0
                      const hasChanges = pendingChange > 0
                      const lastIncrementTime = formatTimestamp(beverage.lastIncrement)
                      const canUndo = beverage.lastIncrement && beverage.lastIncrementAmount && beverage.count > 0
                      const showButtons = selectedBeverageForButtons === beverage.id

                      return (
                        <div key={beverage.id} className="p-6 border-b border-gray-50 last:border-b-0">
                          {/* Beverage Name and Count Row */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-6 flex-1">
                              {/* Go to Beverage Page Button */}
                              <Button
                                size="lg"
                                variant="outline"
                                className="w-16 h-16 p-0 bg-white text-xl"
                                onClick={() => onSelectBeverage(beverage.id)}
                              >
                                <ArrowRight className="w-8 h-8" />
                              </Button>

                              {/* Beverage Name Button (toggles controls) */}
                              <Button
                                className="flex-1 flex items-center justify-start gap-6 p-0 h-auto hover:bg-gray-50 transition-colors"
                                variant="ghost"
                                onClick={() => handleToggleBeverageButtons(beverage.id)}
                              >
                                <div className="text-3xl">{beverage.icon}</div>
                                <div className="text-2xl font-medium" style={{ color: beverage.color }}>
                                  {beverage.name}
                                </div>
                              </Button>
                            </div>
                            <div className="text-xl text-gray-500">
                              {beverage.count > 0 && `(${beverage.count} serviert)`}
                            </div>
                          </div>

                          {/* Quick Action Controls - Only show when selected */}
                          {showButtons && (
                            <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-6">
                                <Button
                                  size="lg"
                                  variant="outline"
                                  className="w-16 h-16 p-0 bg-white text-xl"
                                  onClick={() => handleDecrement(beverage.id)}
                                  disabled={pendingChange === 0}
                                >
                                  <Minus className="w-8 h-8" />
                                </Button>

                                <div className="w-24 text-center">
                                  <span className="text-4xl font-bold">
                                    {pendingChange > 0 ? `+${pendingChange}` : "0"}
                                  </span>
                                </div>

                                <Button
                                  size="lg"
                                  variant="outline"
                                  className="w-16 h-16 p-0 bg-white text-xl"
                                  onClick={() => handleIncrement(beverage.id)}
                                >
                                  <Plus className="w-8 h-8" />
                                </Button>

                                <Button
                                  size="lg"
                                  variant="outline"
                                  className="w-16 h-16 p-0 bg-white text-xl text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleUndoBeverage(beverage)}
                                  disabled={!canUndo}
                                >
                                  <Undo2 className="w-8 h-8" />
                                </Button>
                              </div>

                              {hasChanges && (
                                <Button
                                  size="lg"
                                  className="h-16 px-8 text-xl font-bold"
                                  style={{ backgroundColor: beverage.color }}
                                  onClick={() => handleConfirmChange(beverage.id)}
                                >
                                  <Check className="w-6 h-6 mr-3" />
                                  Bestätigen
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Last Increment Timestamp */}
                          {lastIncrementTime && (
                            <div className="flex items-center gap-3 text-lg text-gray-400">
                              <Clock className="w-5 h-5" />
                              <span>Zuletzt bestätigt: {lastIncrementTime}</span>
                              {beverage.lastIncrementAmount && (
                                <span className="text-sm">({beverage.lastIncrementAmount}x)</span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="lg"
          className="bg-white shadow-lg hover:shadow-xl transition-shadow px-12 py-6 text-2xl"
          onClick={handleSwitchToAdmin}
        >
          <Settings className="w-8 h-8 mr-4" />
          Zur Admin-Ansicht
        </Button>
      </div>

      {/* Admin Password Dialog */}
      <Dialog open={showAdminPasswordDialog} onOpenChange={setShowAdminPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Admin-Zugang</DialogTitle>
            <DialogDescription className="text-lg">
              Geben Sie das Admin-Passwort ein, um zur Admin-Ansicht zu wechseln.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="adminPassword" className="text-lg">
                Passwort
              </Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value)
                  setAdminPasswordError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    confirmSwitchToAdmin()
                  }
                }}
                className="h-12 text-lg mt-2"
                placeholder="Passwort eingeben"
                autoFocus
              />
              {adminPasswordError && <p className="text-red-500 text-sm mt-2">{adminPasswordError}</p>}
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={cancelSwitchToAdmin} className="h-12 text-lg px-6 bg-transparent">
              Abbrechen
            </Button>
            <Button onClick={confirmSwitchToAdmin} className="h-12 text-lg px-6">
              Bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Undo Last Increment Confirmation Dialog */}
      <Dialog open={showUndoDialog} onOpenChange={setShowUndoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Letzten Eintrag rückgängig machen?</DialogTitle>
            <DialogDescription>
              Möchten Sie die letzte Hinzufügung von{" "}
              <strong>
                {beverageToUndo?.lastIncrementAmount || 0}x {beverageToUndo?.name}
              </strong>{" "}
              wirklich rückgängig machen?
              {beverageToUndo?.lastIncrement && (
                <>
                  <br />
                  <span className="text-sm text-gray-500">
                    Hinzugefügt um: {formatTimestamp(beverageToUndo.lastIncrement)}
                  </span>
                </>
              )}
              <br />
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelUndoBeverage}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmUndoBeverage}>
              Rückgängig machen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
