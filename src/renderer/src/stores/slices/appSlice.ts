import { StateCreator } from 'zustand'

export interface AppSlice {
  locale: string
  updateLocale: (locale: string) => void
}

export const createAppSlice: StateCreator<AppSlice, [], [], AppSlice> = (set) => ({
  locale: 'en-US',
  updateLocale: (locale: string) => set(() => ({ locale: locale }))
})
