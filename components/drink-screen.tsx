"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Undo2, Calculator } from "lucide-react"
import type { BeverageType } from "../types/beverage"

interface DrinkScreenProps {
  beverage: BeverageType
  onAddDrinks: (count: number) => void
  onUndoLastIncrement: () => void
  onBack: () => void
}

export default function DrinkScreen({ beverage, onAddDrinks, onUndoLastIncrement, onBack }: DrinkScreenProps) {
  const [addCount, setAddCount] = useState(1)
  const [showConfirmAddDialog, setShowConfirmAddDialog] = useState(false) // Renamed for clarity
  const [showUndoDialog, setShowUndoDialog] = useState(false) // New state for undo dialog
  const [showKeypad, setShowKeypad] = useState(false)

  const increment = () => {
    if (addCount < 99) {
      setAddCount(addCount + 1)
    }
  }

  const decrement = () => {
    if (addCount > 1) {
      setAddCount(addCount - 1)
    }
  }

  const handleNumberPress = (num: number) => {
    if (addCount === 1 && num > 0) {
      setAddCount(num)
    } else {
      const newCount = Number.parseInt(`${addCount}${num}`)
      if (newCount <= 99) {
        setAddCount(newCount)
      }
    }
  }

  const clearCount = () => {
    setAddCount(1)
  }

  const handleAddDrinks = () => {
    setShowConfirmAddDialog(true)
  }

  const confirmAddDrinks = () => {
    onAddDrinks(addCount)
    setShowConfirmAddDialog(false)
    setAddCount(1)
  }

  const cancelAddDrinks = () => {
    setShowConfirmAddDialog(false)
  }

  // New functions for undo confirmation
  const handleUndoClick = () => {
    setShowUndoDialog(true)
  }

  const confirmUndo = () => {
    onUndoLastIncrement()
    setShowUndoDialog(false)
  }

  const cancelUndo = () => {
    setShowUndoDialog(false)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const renderKeypadButton = (num: number) => (
    <Button
      key={num}
      variant="outline"
      size="lg"
      className="h-16 text-xl font-normal bg-transparent"
      onClick={() => handleNumberPress(num)}
    >
      {num}
    </Button>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center py-6">
        <div className="text-4xl mb-2">{beverage.icon}</div>
        <h1 className="text-2xl font-light mb-2" style={{ color: beverage.color }}>
          {beverage.name}
        </h1>
        <div className="text-center">
          <div className="text-sm text-gray-500">Gesamt serviert</div>
          <div className="text-2xl font-semibold" style={{ color: beverage.color }}>
            {beverage.count}
          </div>
        </div>

        {/* Last Increment Timestamp */}
        {beverage.lastIncrement && (
          <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
            <div className="text-xs text-gray-500">Zuletzt serviert</div>
            <div className="text-sm font-medium text-gray-700">
              {beverage.lastIncrementAmount} Getränk{beverage.lastIncrementAmount !== 1 ? "e" : ""} um{" "}
              {formatTimestamp(beverage.lastIncrement)}
            </div>
          </div>
        )}
      </div>

      {/* Add Drinks Section */}
      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <div className="text-lg font-medium text-gray-700 mb-6">Anzahl der hinzuzufügenden Getränke</div>

          <div className="flex items-center justify-center gap-6 mb-8">
            <Button
              size="lg"
              className="w-16 h-16 rounded-full text-2xl font-light bg-red-500 hover:bg-red-600"
              onClick={decrement}
              disabled={addCount <= 1}
            >
              −
            </Button>
            <div className="text-6xl font-light" style={{ color: beverage.color }}>
              {addCount}
            </div>
            <Button
              size="lg"
              className="w-16 h-16 rounded-full text-2xl font-light text-white"
              style={{ backgroundColor: beverage.color }}
              onClick={increment}
              disabled={addCount >= 99}
            >
              +
            </Button>
          </div>

          <Button
            size="lg"
            className="w-full text-white mb-4"
            style={{ backgroundColor: beverage.color }}
            onClick={handleAddDrinks}
          >
            {addCount} {beverage.name} hinzufügen
          </Button>

          {/* Keypad Toggle */}
          <Button variant="outline" className="w-full bg-transparent mb-4" onClick={() => setShowKeypad(!showKeypad)}>
            <Calculator className="w-4 h-4 mr-2" />
            {showKeypad ? "Zahlenblock ausblenden" : "Zahlenblock anzeigen"}
          </Button>
        </CardContent>
      </Card>

      {/* Numeric Keypad */}
      {showKeypad && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(renderKeypadButton)}
              <Button variant="destructive" size="lg" className="h-16 text-xl font-medium" onClick={clearCount}>
                C
              </Button>
              {renderKeypadButton(0)}
              <div></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Undo Button */}
        {beverage.lastIncrement && beverage.lastIncrementAmount && (
          <Button
            variant="outline"
            className="w-full bg-transparent text-orange-600 border-orange-200 hover:bg-orange-50"
            onClick={handleUndoClick}
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Letzten Eintrag rückgängig machen ({beverage.lastIncrementAmount} Getränk
            {beverage.lastIncrementAmount !== 1 ? "e" : ""})
          </Button>
        )}

        {/* Back Button */}
        <Button variant="outline" className="w-full bg-transparent" onClick={onBack}>
          Zurück zur Getränkeliste
        </Button>
      </div>

      {/* Confirmation Dialog for Adding Drinks */}
      <Dialog open={showConfirmAddDialog} onOpenChange={setShowConfirmAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hinzufügung bestätigen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie {addCount} {beverage.name}
              {addCount > 1 ? "s" : ""} zur Gesamtzahl hinzufügen möchten?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelAddDrinks}>
              Abbrechen
            </Button>
            <Button onClick={confirmAddDrinks} style={{ backgroundColor: beverage.color }} className="text-white">
              Bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Undo */}
      <Dialog open={showUndoDialog} onOpenChange={setShowUndoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rückgängig machen bestätigen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie den letzten Eintrag von {beverage.lastIncrementAmount} Getränk
              {beverage.lastIncrementAmount !== 1 ? "en" : ""} rückgängig machen möchten?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelUndo}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmUndo}>
              Rückgängig machen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
