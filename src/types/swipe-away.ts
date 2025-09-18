export interface UserProfile {
  id?: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  location: string
  budget: {
    min: number
    max: number
    currency: 'EUR' | 'USD' | 'GBP'
  }
  tripPurpose: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface SwipePreference {
  questionId: string
  question: string
  leftOption: string
  rightOption: string
  userChoice: 'left' | 'right'
  timestamp: Date
}

export interface LLMQuestionResponse {
  type: 'question' | 'result'
  questionId?: string
  question?: string
  leftOption?: string
  rightOption?: string
  tripResult?: TripResult
  reasoning?: string
  questionCount: number
}

export interface TripResult {
  destination: string
  duration: string
  totalEstimatedCost: number
  activities: Activity[]
  accommodation: Accommodation
  travelTips: string[]
  budgetBreakdown: BudgetBreakdown
  bestTimeToVisit: string
}

export interface Activity {
  name: string
  description: string
  estimatedCost: number
  duration: string
  category: 'outdoor' | 'cultural' | 'social' | 'adventure' | 'relaxation'
  difficulty?: 'easy' | 'moderate' | 'challenging'
}

export interface Accommodation {
  type: 'hostel' | 'hotel' | 'guesthouse' | 'camping' | 'apartment'
  name: string
  description: string
  pricePerNight: number
  amenities: string[]
  socialAspect?: string
}

export interface BudgetBreakdown {
  accommodation: number
  activities: number
  food: number
  transport: number
  miscellaneous: number
  total: number
}

export interface UserSession {
  userProfile: UserProfile
  preferences: SwipePreference[]
  currentQuestionCount: number
  isComplete: boolean
  tripResult?: TripResult
}

// Form validation schemas
export const BUDGET_RANGES = [
  { label: 'Budget-friendly (€50-150)', min: 50, max: 150 },
  { label: 'Moderate (€150-300)', min: 150, max: 300 },
  { label: 'Comfortable (€300-500)', min: 300, max: 500 },
  { label: 'Luxury (€500+)', min: 500, max: 1000 },
] as const

export const TRIP_PURPOSES = [
  'Overnight stay',
  'Outdoor activities',
  'Meeting new people',
  'Cultural exploration',
  'Adventure sports',
  'Relaxation & wellness',
  'Photography & sightseeing',
  'Food & dining experiences',
  'Music & nightlife',
  'Learning new skills',
] as const

export const AGE_RANGES = {
  MIN: 18,
  MAX: 40,
} as const
