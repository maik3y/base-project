import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AppStore {
  // Add your state and actions here when needed
}

export const useAppStore = create<AppStore>()(
  devtools(
    () => ({
      // Initial state and actions
    }),
    {
      name: 'app-store',
    }
  )
)
