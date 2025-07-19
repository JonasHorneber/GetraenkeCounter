export interface BeverageType {
  id: string
  name: string
  icon: string
  color: string
  count: number
  available: boolean
}

export interface User {
  role: "admin" | "bartender" | "customer"
  name: string
}

export const ALL_BEVERAGES: BeverageType[] = [
  { id: "water", name: "Water", icon: "💧", color: "#3498db", count: 0, available: false },
  { id: "coffee", name: "Coffee", icon: "☕", color: "#8b4513", count: 0, available: false },
  { id: "tea", name: "Tea", icon: "🍵", color: "#228b22", count: 0, available: false },
  { id: "soda", name: "Soda", icon: "🥤", color: "#ff6b6b", count: 0, available: false },
  { id: "juice", name: "Juice", icon: "🧃", color: "#ffa500", count: 0, available: false },
  { id: "beer", name: "Beer", icon: "🍺", color: "#daa520", count: 0, available: false },
  { id: "wine", name: "Wine", icon: "🍷", color: "#722f37", count: 0, available: false },
  { id: "cocktail", name: "Cocktail", icon: "🍸", color: "#ff69b4", count: 0, available: false },
]
