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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
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
    setShowConfirmDialog(true)
  }

  const confirmAddDrinks = () => {
    onAddDrinks(addCount)
    setShowConfirmDialog(false)
    setAddCount(1)
  }

  const cancelAddDrinks = () => {
    setShowConfirmDialog(false)
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
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
          <div className="text-sm text-gray-500">Total Served</div>
          <div className="text-2xl font-semibold" style={{ color: beverage.color }}>
            {beverage.count}
          </div>
        </div>

        {/* Last Increment Timestamp */}
        {beverage.lastIncrement && (
          <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
            <div className="text-xs text-gray-500">Last served</div>
            <div className="text-sm font-medium text-gray-700">
              {beverage.lastIncrementAmount} drink{beverage.lastIncrementAmount !== 1 ? "s" : ""} at{" "}
              {formatTimestamp(beverage.lastIncrement)}
            </div>
          </div>
        )}
      </div>

      {/* Add Drinks Section */}
      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <div className="text-lg font-medium text-gray-700 mb-6">Number of drinks to add</div>

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
            Add {addCount} {beverage.name}
            {addCount > 1 ? "s" : ""}
          </Button>

          {/* Keypad Toggle */}
          <Button variant="outline" className="w-full bg-transparent mb-4" onClick={() => setShowKeypad(!showKeypad)}>
            <Calculator className="w-4 h-4 mr-2" />
            {showKeypad ? "Hide Keypad" : "Show Keypad"}
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
            onClick={onUndoLastIncrement}
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Undo Last ({beverage.lastIncrementAmount} drink{beverage.lastIncrementAmount !== 1 ? "s" : ""})
          </Button>
        )}

        {/* Back Button */}
        <Button variant="outline" className="w-full bg-transparent" onClick={onBack}>
          Back to Beverage List
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Addition</DialogTitle>
            <DialogDescription>
              Are you sure you want to add {addCount} {beverage.name}
              {addCount > 1 ? "s" : ""} to the total count?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelAddDrinks}>
              Cancel
            </Button>
            <Button onClick={confirmAddDrinks} style={{ backgroundColor: beverage.color }} className="text-white">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
