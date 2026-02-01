import { StateCreator } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface AppSlice {
  settings: {
    general: {
      logo: string
      locale: string
    }
    cart: {
      discountRate: number
      discountType: string
      tax: number
    }
  }
  updateLocale: (locale: string) => void
  updateLogo: (logo: string) => void
}

export const createAppSlice: StateCreator<AppSlice, [], [['zustand/immer', never]], AppSlice> =
  immer((set) => ({
    settings: {
      general: {
        logo: '',
        locale: 'en-PH'
      },
      cart: {
        discountRate: 0,
        discountType: 'percentage',
        tax: 12
      }
    },
    // updateLocale: (locale: string) => set(() => ({ locale }))
    updateLocale: (locale: string) =>
      set((state) => {
        state.settings.general.locale = locale
      }),
    updateLogo: (logo: string) =>
      set((state) => {
        state.settings.general.logo = logo
      })
  }))
