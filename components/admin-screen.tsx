"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { BeverageType } from "../types/beverage"

interface AdminScreenProps {
  beverages: BeverageType[]
  onToggleBeverage: (id: string) => void
  onSwitchRole: (role: "admin" | "bartender" | "customer") => void
}

export default function AdminScreen({ beverages, onToggleBeverage, onSwitchRole }: AdminScreenProps) {
  const availableBeverages = beverages.filter((b) => b.available)

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-light text-gray-800 mb-2">Admin Panel</h1>
        <p className="text-sm text-gray-600 mb-4">Select beverages available for this event</p>
        <div className="text-center">
          <div className="text-sm text-gray-500">Available Beverages</div>
          <div className="text-xl font-semibold text-gray-800">{availableBeverages.length}</div>
        </div>
      </div>

      {/* Beverage Selection */}
      <div className="space-y-3 mb-6">
        {beverages.map((beverage) => (
          <Card
            key={beverage.id}
            className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
              beverage.available ? "ring-2 shadow-lg" : ""
            }`}
            style={{ borderColor: beverage.available ? beverage.color : undefined }}
            onClick={() => onToggleBeverage(beverage.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{beverage.icon}</div>
                  <div
                    className={`text-lg font-medium ${beverage.available ? "" : "text-gray-600"}`}
                    style={{ color: beverage.available ? beverage.color : undefined }}
                  >
                    {beverage.name}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    beverage.available ? "text-white" : "border-gray-300"
                  }`}
                  style={{
                    backgroundColor: beverage.available ? beverage.color : "transparent",
                    borderColor: beverage.available ? beverage.color : undefined,
                  }}
                >
                  {beverage.available && "✓"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Switch Buttons */}
      <div className="space-y-3">
        <Button className="w-full" onClick={() => onSwitchRole("bartender")} disabled={availableBeverages.length === 0}>
          Switch to Bartender View
        </Button>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => onSwitchRole("customer")}
          disabled={availableBeverages.length === 0}
        >
          Switch to Customer View
        </Button>
      </div>
    </div>
  )
}
