"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type BeverageType, type ServingSize, BEVERAGE_TYPES, SERVING_SIZES } from "../types/beverage"

export default function BeverageCounter() {
  const [beverages, setBeverages] = useState<BeverageType[]>(BEVERAGE_TYPES)
  const [selectedBeverage, setSelectedBeverage] = useState<string>("water")
  const [selectedServingSize, setSelectedServingSize] = useState<string>("medium")
  const [showKeypad, setShowKeypad] = useState(false)

  const currentBeverage = beverages.find((b) => b.id === selectedBeverage)!
  const currentServingSize = SERVING_SIZES.find((s) => s.id === selectedServingSize)!
  const totalCount = beverages.reduce((sum, b) => sum + b.count, 0)
  const totalVolume = beverages.reduce((sum, b) => sum + b.totalVolume, 0)

  const updateBeverageCount = (id: string, countChange: number, volumeChange: number) => {
    setBeverages((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              count: Math.max(0, b.count + countChange),
              totalVolume: Math.max(0, b.totalVolume + volumeChange),
            }
          : b,
      ),
    )
  }

  const increment = () => {
    updateBeverageCount(selectedBeverage, 1, currentServingSize.volume)
  }

  const decrement = () => {
    if (currentBeverage.count > 0) {
      updateBeverageCount(selectedBeverage, -1, -currentServingSize.volume)
    }
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

    const countDifference = newCount - currentCount
    const volumeDifference = countDifference * currentServingSize.volume
    updateBeverageCount(selectedBeverage, countDifference, volumeDifference)
  }

  const clearCount = () => {
    updateBeverageCount(selectedBeverage, -currentBeverage.count, -currentBeverage.totalVolume)
  }

  const clearAllCounts = () => {
    setBeverages((prev) => prev.map((b) => ({ ...b, count: 0, totalVolume: 0 })))
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}L`
    }
    return `${volume}ml`
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
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? "ring-2 shadow-lg" : ""}`}
        style={{ borderColor: isSelected ? beverage.color : undefined }}
        onClick={() => setSelectedBeverage(beverage.id)}
      >
        <CardContent className="p-4 text-center space-y-2">
          <div className="text-2xl">{beverage.icon}</div>
          <div
            className={`text-sm font-medium ${isSelected ? "" : "text-gray-600"}`}
            style={{ color: isSelected ? beverage.color : undefined }}
          >
            {beverage.name}
          </div>
          <div className="text-lg font-semibold" style={{ color: beverage.color }}>
            {beverage.count}
          </div>
          <div className="text-xs text-gray-500">{formatVolume(beverage.totalVolume)}</div>
        </CardContent>
      </Card>
    )
  }

  const renderServingSizeButton = (servingSize: ServingSize) => {
    const isSelected = servingSize.id === selectedServingSize
    return (
      <Button
        key={servingSize.id}
        variant={isSelected ? "default" : "outline"}
        size="sm"
        className={`flex flex-col h-auto py-2 px-4 ${isSelected ? "text-white" : ""}`}
        style={{ backgroundColor: isSelected ? currentBeverage.color : undefined }}
        onClick={() => setSelectedServingSize(servingSize.id)}
      >
        <span className="font-medium">{servingSize.name}</span>
        <span className="text-xs opacity-80">{servingSize.volume}ml</span>
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-light text-gray-800 mb-4">Beverage Counter</h1>
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="text-xs text-gray-500">Total Drinks</div>
            <div className="text-lg font-semibold text-gray-800">{totalCount}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Total Volume</div>
            <div className="text-lg font-semibold text-gray-800">{formatVolume(totalVolume)}</div>
          </div>
        </div>
      </div>

      {/* Beverage Categories */}
      <div className="grid grid-cols-3 gap-3 mb-6">{beverages.map(renderBeverageCard)}</div>

      {/* Serving Size Selection */}
      <div className="text-center mb-6">
        <div className="text-sm text-gray-600 mb-3">Serving Size</div>
        <div className="flex justify-center gap-3">{SERVING_SIZES.map(renderServingSizeButton)}</div>
      </div>

      {/* Selected Beverage Display */}
      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-2">{currentBeverage.icon}</div>
          <div className="text-lg font-medium mb-4" style={{ color: currentBeverage.color }}>
            {currentBeverage.name}
          </div>
          <div className="text-6xl font-light mb-2" style={{ color: currentBeverage.color }}>
            {currentBeverage.count}
          </div>
          <div className="text-lg text-gray-600 mb-2">{formatVolume(currentBeverage.totalVolume)}</div>
          <div className="text-xs text-gray-500">
            {currentServingSize.name} ({currentServingSize.volume}ml per serving)
          </div>
        </CardContent>
      </Card>

      {/* Main Controls */}
      <div className="flex justify-center gap-8 mb-6">
        <Button
          size="lg"
          className="w-20 h-20 rounded-full text-2xl font-light bg-red-500 hover:bg-red-600"
          onClick={decrement}
        >
          −
        </Button>
        <Button
          size="lg"
          className="w-20 h-20 rounded-full text-2xl font-light text-white"
          style={{ backgroundColor: currentBeverage.color }}
          onClick={increment}
        >
          +
        </Button>
      </div>

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
