export interface BeverageType {
  id: string
  name: string
  icon: string
  color: string
  count: number
}

export const BEVERAGE_TYPES: BeverageType[] = [
  { id: "water", name: "Water", icon: "💧", color: "#3498db", count: 0 },
  { id: "coffee", name: "Coffee", icon: "☕", color: "#8b4513", count: 0 },
  { id: "tea", name: "Tea", icon: "🍵", color: "#228b22", count: 0 },
  { id: "soda", name: "Soda", icon: "🥤", color: "#ff6b6b", count: 0 },
  { id: "juice", name: "Juice", icon: "🧃", color: "#ffa500", count: 0 },
  { id: "beer", name: "Beer", icon: "🍺", color: "#daa520", count: 0 },
]
