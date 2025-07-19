"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { BeverageType } from "../types/beverage"

interface BartenderScreenProps {
  beverages: BeverageType[]
  onSelectBeverage: (id: string) => void
  onSwitchRole: (role: "admin" | "bartender" | "customer") => void
}

export default function BartenderScreen({ beverages, onSelectBeverage, onSwitchRole }: BartenderScreenProps) {
  const availableBeverages = beverages.filter((b) => b.available)
  const totalServed = availableBeverages.reduce((sum, b) => sum + b.count, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-light text-gray-800 mb-2">Bartender Panel</h1>
        <p className="text-sm text-gray-600 mb-4">Select a beverage to serve</p>
        <div className="text-center">
          <div className="text-sm text-gray-500">Total Served</div>
          <div className="text-2xl font-semibold text-gray-800">{totalServed}</div>
        </div>
      </div>

      {/* Available Beverages */}
      <div className="space-y-3 mb-6">
        {availableBeverages.map((beverage) => (
          <Card
            key={beverage.id}
            className="transition-all duration-200 cursor-pointer hover:shadow-md"
            onClick={() => onSelectBeverage(beverage.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{beverage.icon}</div>
                  <div className="text-lg font-medium" style={{ color: beverage.color }}>
                    {beverage.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold" style={{ color: beverage.color }}>
                    {beverage.count}
                  </div>
                  <div className="text-xs text-gray-500">served</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Back to Admin */}
      <Button variant="outline" className="w-full bg-transparent" onClick={() => onSwitchRole("admin")}>
        Back to Admin Panel
      </Button>
    </div>
  )
}
