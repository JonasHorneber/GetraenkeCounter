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
import type { BeverageType } from "../types/beverage"

interface DrinkScreenProps {
  beverage: BeverageType
  onAddDrinks: (count: number) => void
  onBack: () => void
}

export default function DrinkScreen({ beverage, onAddDrinks, onBack }: DrinkScreenProps) {
  const [addCount, setAddCount] = useState(1)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

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
            className="w-full text-white"
            style={{ backgroundColor: beverage.color }}
            onClick={handleAddDrinks}
          >
            Add {addCount} {beverage.name}
            {addCount > 1 ? "s" : ""}
          </Button>
        </CardContent>
      </Card>

      {/* Back Button */}
      <Button variant="outline" className="w-full bg-transparent" onClick={onBack}>
        Back to Beverage List
      </Button>

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
