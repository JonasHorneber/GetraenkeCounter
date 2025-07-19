"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { BeverageType } from "../types/beverage"
import { BEVERAGE_CATEGORIES } from "../types/beverage"

interface AdminScreenProps {
  beverages: BeverageType[]
  onToggleBeverage: (id: string) => void
  onSwitchRole: (role: "admin" | "bartender" | "customer") => void
}

export default function AdminScreen({ beverages, onToggleBeverage, onSwitchRole }: AdminScreenProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(["sprizz"])
  const availableBeverages = beverages.filter((b) => b.available)

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const getBeveragesByCategory = (categoryId: string) => {
    return beverages.filter((b) => b.category === categoryId)
  }

  const getCategoryStats = (categoryId: string) => {
    const categoryBeverages = getBeveragesByCategory(categoryId)
    const availableCount = categoryBeverages.filter((b) => b.available).length
    const totalCount = categoryBeverages.length
    return { availableCount, totalCount }
  }

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

      {/* Categories */}
      <div className="space-y-3 mb-6">
        {BEVERAGE_CATEGORIES.map((category) => {
          const categoryBeverages = getBeveragesByCategory(category.id)
          const { availableCount, totalCount } = getCategoryStats(category.id)
          const isOpen = openCategories.includes(category.id)

          if (totalCount === 0) return null

          return (
            <Card key={category.id} className="overflow-hidden">
              <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category.id)}>
                <CollapsibleTrigger asChild>
                  <div className="w-full cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{category.icon}</div>
                          <div>
                            <div className="text-lg font-medium" style={{ color: category.color }}>
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {availableCount}/{totalCount} selected
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: category.color }}
                          >
                            {availableCount}
                          </div>
                          {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-gray-100">
                    {categoryBeverages.map((beverage) => (
                      <div
                        key={beverage.id}
                        className={`p-3 border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                          beverage.available ? "bg-blue-50" : ""
                        }`}
                        onClick={() => onToggleBeverage(beverage.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-lg">{beverage.icon}</div>
                            <div
                              className={`font-medium ${beverage.available ? "" : "text-gray-600"}`}
                              style={{ color: beverage.available ? beverage.color : undefined }}
                            >
                              {beverage.name}
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
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
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
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
