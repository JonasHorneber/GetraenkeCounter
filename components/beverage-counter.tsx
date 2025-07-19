"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type BeverageType, BEVERAGE_TYPES } from "../types/beverage"

export default function BeverageCounter() {
  const [beverages, setBeverages] = useState<BeverageType[]>(BEVERAGE_TYPES)
  const [selectedBeverage, setSelectedBeverage] = useState<string>("water")
  const [showKeypad, setShowKeypad] = useState(false)

  const currentBeverage = beverages.find((b) => b.id === selectedBeverage)!
  const totalCount = beverages.reduce((sum, b) => sum + b.count, 0)

  const updateBeverageCount = (id: string, newCount: number) => {
    setBeverages((prev) => prev.map((b) => (b.id === id ? { ...b, count: Math.max(0, newCount) } : b)))
  }

  const increment = (beverageId: string) => {
    const beverage = beverages.find((b) => b.id === beverageId)!
    updateBeverageCount(beverageId, beverage.count + 1)
  }

  const decrement = (beverageId: string) => {
    const beverage = beverages.find((b) => b.id === beverageId)!
    updateBeverageCount(beverageId, beverage.count - 1)
  }

  const handleNumberPress = (num: number) => {
    const currentCount = currentBeverage.count
    let newCount: number

    if (currentCount === 0) {
      newCount = num
    } else {
      newCount = Number.parseInt(`${currentCount}${num}`)
      if (newCount > 999) return
    }

    updateBeverageCount(selectedBeverage, newCount)
  }

  const clearCount = () => {
    updateBeverageCount(selectedBeverage, 0)
  }

  const clearAllCounts = () => {
    setBeverages((prev) => prev.map((b) => ({ ...b, count: 0 })))
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

  const renderBeverageCard = (beverage: BeverageType) => {
    const isSelected = beverage.id === selectedBeverage
    return (
      <Card
        key={beverage.id}
        className={`transition-all duration-200 hover:shadow-md ${isSelected ? "ring-2 shadow-lg" : ""}`}
        style={{ borderColor: isSelected ? beverage.color : undefined }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 flex-1 cursor-pointer"
              onClick={() => setSelectedBeverage(beverage.id)}
            >
              <div className="text-2xl">{beverage.icon}</div>
              <div
                className={`text-lg font-medium ${isSelected ? "" : "text-gray-600"}`}
                style={{ color: isSelected ? beverage.color : undefined }}
              >
                {beverage.name}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white border-red-500"
                onClick={() => decrement(beverage.id)}
              >
                −
              </Button>
              <div className="text-xl font-semibold min-w-[2rem] text-center" style={{ color: beverage.color }}>
                {beverage.count}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 rounded-full text-white border-0 bg-transparent"
                style={{ backgroundColor: beverage.color }}
                onClick={() => increment(beverage.id)}
              >
                +
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-light text-gray-800 mb-4">Beverage Counter</h1>
        <div className="text-center">
          <div className="text-sm text-gray-500">Total Today</div>
          <div className="text-2xl font-semibold text-gray-800">{totalCount}</div>
        </div>
      </div>

      {/* Beverage List */}
      <div className="space-y-3 mb-6">{beverages.map(renderBeverageCard)}</div>

      {/* Selected Beverage Display */}
      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-2">{currentBeverage.icon}</div>
          <div className="text-lg font-medium mb-4" style={{ color: currentBeverage.color }}>
            {currentBeverage.name}
          </div>
          <div className="flex items-center justify-center gap-6">
            <Button
              size="lg"
              className="w-16 h-16 rounded-full text-2xl font-light bg-red-500 hover:bg-red-600"
              onClick={() => decrement(selectedBeverage)}
            >
              −
            </Button>
            <div className="text-6xl font-light" style={{ color: currentBeverage.color }}>
              {currentBeverage.count}
            </div>
            <Button
              size="lg"
              className="w-16 h-16 rounded-full text-2xl font-light text-white"
              style={{ backgroundColor: currentBeverage.color }}
              onClick={() => increment(selectedBeverage)}
            >
              +
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <Button variant="outline" onClick={() => setShowKeypad(!showKeypad)}>
          {showKeypad ? "Hide Keypad" : "Show Keypad"}
        </Button>
        <Button
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
          onClick={clearAllCounts}
        >
          Clear All
        </Button>
      </div>

      {/* Numeric Keypad */}
      {showKeypad && (
        <Card>
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
    </div>
  )
}
