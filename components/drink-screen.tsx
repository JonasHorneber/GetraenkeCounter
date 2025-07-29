"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Undo2, ArrowLeft, Keyboard, X, ChefHat } from "lucide-react"
import type { BeverageType } from "../types/beverage"

interface DrinkScreenProps {
  beverage: BeverageType
  onAddDrinks: (count: number) => void
  onUndoLastIncrement: () => void
  onBack: () => void
}

// Rezept-Daten für die verschiedenen Getränke
const DRINK_RECIPES: { [key: string]: { ingredients: string[]; instructions: string[] } } = {
  "aperol-sprizz": {
    ingredients: ["3 cl Aperol", "6 cl Prosecco", "Spritzer Soda", "Orangenscheibe", "Eiswürfel"],
    instructions: [
      "Weinglas mit Eiswürfeln füllen",
      "Aperol hinzugeben",
      "Mit Prosecco auffüllen",
      "Einen Spritzer Soda hinzufügen",
      "Mit Orangenscheibe garnieren",
    ],
  },
  hugo: {
    ingredients: [
      "2 cl Holunderblütensirup",
      "6 cl Prosecco",
      "Spritzer Soda",
      "Minze",
      "Limettenscheibe",
      "Eiswürfel",
    ],
    instructions: [
      "Weinglas mit Eiswürfeln füllen",
      "Holunderblütensirup hinzugeben",
      "Mit Prosecco auffüllen",
      "Einen Spritzer Soda hinzufügen",
      "Mit Minze und Limette garnieren",
    ],
  },
  "gin-tonic": {
    ingredients: ["4 cl Gin", "12 cl Tonic Water", "Limettenscheibe", "Eiswürfel"],
    instructions: [
      "Longdrink-Glas mit Eiswürfeln füllen",
      "Gin hinzugeben",
      "Mit Tonic Water auffüllen",
      "Vorsichtig umrühren",
      "Mit Limettenscheibe garnieren",
    ],
  },
  mojito: {
    ingredients: ["4 cl weißer Rum", "3 cl Limettensaft", "2 cl Zuckersirup", "8-10 Minzblätter", "Soda", "Eiswürfel"],
    instructions: [
      "Minzblätter im Glas leicht andrücken",
      "Limettensaft und Zuckersirup hinzufügen",
      "Mit crushed Ice füllen",
      "Rum hinzugeben",
      "Mit Soda auffüllen und vorsichtig mischen",
    ],
  },
  caipirinha: {
    ingredients: ["5 cl Cachaça", "1/2 Limette", "2 TL brauner Zucker", "Eiswürfel"],
    instructions: [
      "Limette in Achtel schneiden",
      "Limettenstücke mit Zucker im Glas muddeln",
      "Mit crushed Ice füllen",
      "Cachaça hinzugeben",
      "Gut umrühren",
    ],
  },
}

export default function DrinkScreen({ beverage, onAddDrinks, onUndoLastIncrement, onBack }: DrinkScreenProps) {
  const [inputCount, setInputCount] = useState<string>("1")
  const [showKeypad, setShowKeypad] = useState(false)
  const [showUndoDialog, setShowUndoDialog] = useState(false)

  const handleAdd = () => {
    const count = Number.parseInt(inputCount)
    if (!isNaN(count) && count > 0) {
      onAddDrinks(count)
      setInputCount("1") // Reset input after adding
    }
  }

  const handleKeypadInput = (value: string) => {
    if (value === "C") {
      setInputCount("0")
    } else if (value === "back") {
      setInputCount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"))
    } else if (value === ".") {
      if (!inputCount.includes(".")) {
        setInputCount((prev) => prev + ".")
      }
    } else {
      setInputCount((prev) => (prev === "0" ? value : prev + value))
    }
  }

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

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return "N/A"
    return timestamp.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const recipe = DRINK_RECIPES[beverage.id] || {
    ingredients: ["Rezept wird noch hinzugefügt"],
    instructions: ["Detaillierte Anleitung folgt in Kürze"],
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-md md:max-w-6xl mx-auto flex flex-col">
      {/* Header */}
      <div className="text-center py-6 md:py-12">
        <h1 className="text-3xl md:text-6xl font-bold text-gray-800 mb-2 md:mb-6" style={{ color: beverage.color }}>
          {beverage.name}
        </h1>
        <p className="text-sm md:text-2xl text-gray-600">Getränke hinzufügen</p>
      </div>

      {/* Current Count */}
      <Card className="mb-6 md:mb-12">
        <CardContent className="flex flex-col items-center justify-center p-6 md:p-12">
          <div className="text-7xl md:text-9xl font-extrabold tabular-nums" style={{ color: beverage.color }}>
            {beverage.count}
          </div>
          <div className="text-sm md:text-xl text-gray-500 mt-2 md:mt-4">Gesamt serviert</div>
          {beverage.lastIncrement && (
            <div className="text-xs md:text-lg text-gray-400 mt-1 md:mt-2">
              Zuletzt serviert: {formatTimestamp(beverage.lastIncrement)}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 flex-1">
        {/* Recipe Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-xl md:text-3xl font-medium text-gray-800 flex items-center gap-2 md:gap-4">
              <ChefHat className="w-6 h-6 md:w-8 md:h-8" style={{ color: beverage.color }} />
              Rezept
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-12 pt-0 md:pt-0">
            {/* Ingredients */}
            <div className="mb-6 md:mb-8">
              <h4 className="text-lg md:text-2xl font-semibold text-gray-700 mb-3 md:mb-4">Zutaten:</h4>
              <ul className="space-y-2 md:space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3 text-sm md:text-xl text-gray-600">
                    <span
                      className="w-2 h-2 md:w-3 md:h-3 rounded-full mt-2 md:mt-3 flex-shrink-0"
                      style={{ backgroundColor: beverage.color }}
                    />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="text-lg md:text-2xl font-semibold text-gray-700 mb-3 md:mb-4">Zubereitung:</h4>
              <ol className="space-y-2 md:space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3 md:gap-4 text-sm md:text-xl text-gray-600">
                    <span
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs md:text-lg font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: beverage.color }}
                    >
                      {index + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Manual Input Section */}
        <Card className="h-fit">
          <CardContent className="p-6 md:p-12">
            <div className="text-center mb-4 md:mb-8">
              <h3 className="text-lg md:text-3xl font-medium text-gray-800 mb-2 md:mb-4">Getränke hinzufügen</h3>
            </div>

            {/* Input and Add Button */}
            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputCount}
                onChange={(e) => setInputCount(e.target.value)}
                className="flex-1 text-center text-2xl md:text-4xl h-14 md:h-20"
                placeholder="Anzahl"
              />
              <Button
                onClick={handleAdd}
                className="h-14 md:h-20 text-lg md:text-2xl px-6 md:px-12 whitespace-nowrap"
                style={{ backgroundColor: beverage.color }}
              >
                {`+${inputCount}`}
              </Button>
            </div>

            {/* Keypad Toggle */}
            <Button
              variant="outline"
              className="w-full mb-4 md:mb-8 bg-transparent h-12 md:h-16 text-lg md:text-xl"
              onClick={() => setShowKeypad(!showKeypad)}
            >
              {showKeypad ? (
                <X className="w-4 h-4 md:w-6 md:h-6 mr-2" />
              ) : (
                <Keyboard className="w-4 h-4 md:w-6 md:h-6 mr-2" />
              )}
              {showKeypad ? "Zahlenblock ausblenden" : "Zahlenblock anzeigen"}
            </Button>

            {/* Numeric Keypad */}
            {showKeypad && (
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "C"].map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-16 md:h-24 text-2xl md:text-4xl bg-transparent font-bold"
                    onClick={() => handleKeypadInput(key)}
                  >
                    {key === "C" ? "C" : key}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="h-16 md:h-24 text-2xl md:text-4xl col-span-3 bg-transparent font-bold"
                  onClick={() => handleKeypadInput("back")}
                >
                  ←
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 md:space-y-6 mt-6 md:mt-12">
        <Button
          variant="outline"
          className="w-full bg-transparent text-red-600 border-red-200 hover:bg-red-50 h-12 md:h-20 text-lg md:text-2xl"
          onClick={handleUndoClick}
          disabled={beverage.count === 0 && !beverage.lastIncrementAmount} // Disable if no drinks or no last increment
        >
          <Undo2 className="w-4 h-4 md:w-8 md:h-8 mr-2 md:mr-4" />
          <span className="flex-1 text-left">
            {beverage.lastIncrementAmount && beverage.lastIncrementAmount > 0
              ? `${beverage.lastIncrementAmount}x ${beverage.name} rückgängig machen`
              : "Letzten Eintrag rückgängig machen"}
          </span>
          {beverage.lastIncrement && (
            <div className="text-xs md:text-lg text-red-400 ml-2">({formatTimestamp(beverage.lastIncrement)})</div>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full bg-transparent h-16 md:h-24 text-lg md:text-3xl font-semibold"
          onClick={onBack}
        >
          <ArrowLeft className="w-6 h-6 md:w-10 md:h-10 mr-3 md:mr-6" />
          Zurück zur Getränkeliste
        </Button>
      </div>

      {/* Undo Confirmation Dialog */}
      <Dialog open={showUndoDialog} onOpenChange={setShowUndoDialog}>
        <DialogContent className="max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-3xl">Letzten Eintrag rückgängig machen?</DialogTitle>
            <DialogDescription className="text-lg md:text-xl">
              Möchten Sie die letzte Hinzufügung von {beverage.lastIncrementAmount || 0} {beverage.name} wirklich
              rückgängig machen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 md:gap-6">
            <Button
              variant="outline"
              onClick={cancelUndo}
              className="h-12 md:h-16 text-lg md:text-xl px-6 md:px-12 bg-transparent"
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={confirmUndo}
              className="h-12 md:h-16 text-lg md:text-xl px-6 md:px-12"
            >
              Rückgängig machen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
