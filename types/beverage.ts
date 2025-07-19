export interface ServingSize {
  id: string
  name: string
  volume: number // in ml
  multiplier: number
}

export interface BeverageType {
  id: string
  name: string
  icon: string
  color: string
  count: number
  totalVolume: number // total volume consumed in ml
}

export const SERVING_SIZES: ServingSize[] = [
  { id: "small", name: "Small", volume: 250, multiplier: 0.5 },
  { id: "medium", name: "Medium", volume: 350, multiplier: 1 },
  { id: "large", name: "Large", volume: 500, multiplier: 1.5 },
]

export const BEVERAGE_TYPES: BeverageType[] = [
  { id: "water", name: "Water", icon: "💧", color: "#3498db", count: 0, totalVolume: 0 },
  { id: "coffee", name: "Coffee", icon: "☕", color: "#8b4513", count: 0, totalVolume: 0 },
  { id: "tea", name: "Tea", icon: "🍵", color: "#228b22", count: 0, totalVolume: 0 },
  { id: "soda", name: "Soda", icon: "🥤", color: "#ff6b6b", count: 0, totalVolume: 0 },
  { id: "juice", name: "Juice", icon: "🧃", color: "#ffa500", count: 0, totalVolume: 0 },
  { id: "beer", name: "Beer", icon: "🍺", color: "#daa520", count: 0, totalVolume: 0 },
]
