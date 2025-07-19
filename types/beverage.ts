export interface BeverageType {
  id: string
  name: string
  icon: string
  color: string
  count: number
  available: boolean
  category: string
  lastIncrement?: Date
  lastIncrementAmount?: number
}

export interface BeverageCategory {
  id: string
  name: string
  color: string
  icon: string
}

export const BEVERAGE_CATEGORIES: BeverageCategory[] = [
  { id: "sprizz", name: "Sprizz", color: "#ff6b35", icon: "🥂" },
  { id: "cocktails", name: "Cocktails", color: "#ff1744", icon: "🍸" },
  { id: "longdrinks", name: "Longdrinks", color: "#3f51b5", icon: "🥃" },
  { id: "schnaps", name: "Schnaps", color: "#795548", icon: "🥃" },
  { id: "alcohol-free", name: "Alcohol Free", color: "#4caf50", icon: "🧃" },
]

export const ALL_BEVERAGES: BeverageType[] = [
  // Sprizz
  {
    id: "aperol-sprizz",
    name: "Aperol Sprizz",
    icon: "🥂",
    color: "#ff6b35",
    count: 0,
    available: false,
    category: "sprizz",
  },
  {
    id: "rosato-sprizz",
    name: "Rosato Sprizz",
    icon: "🥂",
    color: "#ff6b35",
    count: 0,
    available: false,
    category: "sprizz",
  },
  { id: "hugo", name: "Hugo", icon: "🥂", color: "#ff6b35", count: 0, available: false, category: "sprizz" },
  {
    id: "limoncello-sprizz",
    name: "Limoncello Sprizz",
    icon: "🥂",
    color: "#ff6b35",
    count: 0,
    available: false,
    category: "sprizz",
  },
  {
    id: "lillet-wild-berry",
    name: "Lillet Wild Berry",
    icon: "🥂",
    color: "#ff6b35",
    count: 0,
    available: false,
    category: "sprizz",
  },
  {
    id: "lillet-wild-berry-ice",
    name: "Lillet Wild Berry Ice",
    icon: "🥂",
    color: "#ff6b35",
    count: 0,
    available: false,
    category: "sprizz",
  },

  // Longdrinks
  {
    id: "cuba-libre",
    name: "Cuba Libre",
    icon: "🥃",
    color: "#3f51b5",
    count: 0,
    available: false,
    category: "longdrinks",
  },
  {
    id: "gin-tonic",
    name: "Gin Tonic",
    icon: "🥃",
    color: "#3f51b5",
    count: 0,
    available: false,
    category: "longdrinks",
  },
  {
    id: "campari-orange",
    name: "Campari Orange",
    icon: "🥃",
    color: "#3f51b5",
    count: 0,
    available: false,
    category: "longdrinks",
  },
  {
    id: "campari-soda",
    name: "Campari Soda",
    icon: "🥃",
    color: "#3f51b5",
    count: 0,
    available: false,
    category: "longdrinks",
  },

  // Cocktails
  {
    id: "caipirinha",
    name: "Caipirinha",
    icon: "🍸",
    color: "#ff1744",
    count: 0,
    available: false,
    category: "cocktails",
  },
  { id: "mojito", name: "Mojito", icon: "🍸", color: "#ff1744", count: 0, available: false, category: "cocktails" },
  {
    id: "tequila-sunrise",
    name: "Tequila Sunrise",
    icon: "🍸",
    color: "#ff1744",
    count: 0,
    available: false,
    category: "cocktails",
  },
  {
    id: "franken-mule",
    name: "Franken Mule",
    icon: "🍸",
    color: "#ff1744",
    count: 0,
    available: false,
    category: "cocktails",
  },
  {
    id: "munich-mule",
    name: "Munich Mule",
    icon: "🍸",
    color: "#ff1744",
    count: 0,
    available: false,
    category: "cocktails",
  },
  {
    id: "vodka-mule",
    name: "Vodka Mule",
    icon: "🍸",
    color: "#ff1744",
    count: 0,
    available: false,
    category: "cocktails",
  },
  {
    id: "gin-basil-smash",
    name: "Gin Basil Smash",
    icon: "🍸",
    color: "#ff1744",
    count: 0,
    available: false,
    category: "cocktails",
  },
  {
    id: "espresso-martini",
    name: "Espresso Martini",
    icon: "🍸",
    color: "#ff1744",
    count: 0,
    available: false,
    category: "cocktails",
  },
  {
    id: "gin-basil-sprizz",
    name: "Gin Basil Sprizz",
    icon: "🍸",
    color: "#ff1744",
    count: 0,
    available: false,
    category: "cocktails",
  },

  // Schnaps (empty for now, can be added later)

  // Alcohol Free
  {
    id: "floreale-wild-berry",
    name: "Floreale Wild Berry",
    icon: "🧃",
    color: "#4caf50",
    count: 0,
    available: false,
    category: "alcohol-free",
  },
  {
    id: "summer-garden",
    name: "Summer Garden",
    icon: "🧃",
    color: "#4caf50",
    count: 0,
    available: false,
    category: "alcohol-free",
  },
  {
    id: "hugo-alc-free",
    name: "Hugo Alc Free",
    icon: "🧃",
    color: "#4caf50",
    count: 0,
    available: false,
    category: "alcohol-free",
  },
  {
    id: "caipirinha-alc-free",
    name: "Caipirinha Alc Free",
    icon: "🧃",
    color: "#4caf50",
    count: 0,
    available: false,
    category: "alcohol-free",
  },
  {
    id: "vibrante-tonic",
    name: "Vibrante Tonic",
    icon: "🧃",
    color: "#4caf50",
    count: 0,
    available: false,
    category: "alcohol-free",
  },
  {
    id: "rosa-grapefruit",
    name: "Rosa Grapefruit",
    icon: "🧃",
    color: "#4caf50",
    count: 0,
    available: false,
    category: "alcohol-free",
  },
  {
    id: "mojito-alc-free",
    name: "Mojito Alc Free",
    icon: "🧃",
    color: "#4caf50",
    count: 0,
    available: false,
    category: "alcohol-free",
  },
]
