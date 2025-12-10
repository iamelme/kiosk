import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AppSlice, createAppSlice } from './slices/appSlice'
import { createUserSlice, UserSlice } from './slices/userSlice'

export const useBoundStore = create<AppSlice & UserSlice>((...a) => ({
  ...createAppSlice(...a),
  ...persist(createUserSlice, {
    name: 'auth',
    partialize: (state) => ({ user: state.user }),
    storage: createJSONStorage(() => localStorage)
  })(...a)
}))

export default useBoundStore
