export interface CompletedEvent {
  id: string
  name: string
  date: string
  completedAt: string
  beverages: Array<{
    id: string
    name: string
    category: string
    count: number
    icon: string
    color: string
  }>
  totalServed: number
  duration?: string
}

export interface EventStatistics {
  totalEvents: number
  totalDrinksServed: number
  averageDrinksPerEvent: number
  topDrinks: Array<{
    name: string
    totalCount: number
    category: string
    icon: string
    color: string
    eventsServedIn: number
  }>
  topCategories: Array<{
    name: string
    totalCount: number
    color: string
    icon: string
  }>
  mostPopularEvent: {
    name: string
    date: string
    totalServed: number
  } | null
}
