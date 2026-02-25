import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AppSlice, createAppSlice } from './slices/appSlice'
import { createUserSlice, UserSlice } from './slices/userSlice'

export const useBoundStore = create<AppSlice & UserSlice>()(
  persist(
    (...a) => ({
      ...createAppSlice(...a),
      ...createUserSlice(...a)
    }),
    {
      name: 'app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        settings: {
          ...state.settings,
          general: {
            ...state.settings.general,
            logo: state.settings.general.logo
          }
        }
      })
    }
  )
  // ...createAppSlice(...a),
  // // ...persist(createAppSlice, {
  // //   name: 'logo',
  // //   partialize: (state) => ({
  // //     settings: {
  // //       ...state.settings,
  // //       logo: state.settings.general.logo
  // //     }
  // //   }),
  // //   storage: createJSONStorage(() => localStorage)
  // // })(...a),
  // ...persist(createUserSlice, {
  //   name: 'auth',
  //   partialize: (state) => ({ user: state.user }),
  //   storage: createJSONStorage(() => localStorage)
  // })(...a)
)

export default useBoundStore
