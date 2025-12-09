import { create } from 'zustand'
import { AppSlice, createAppSlice } from './slices/appSlice'
import { createUserSlice, UserSlice } from './slices/userSlice'

export const useBoundStore = create<AppSlice & UserSlice>((...a) => ({
  ...createAppSlice(...a),
  ...createUserSlice(...a)
}))

export default useBoundStore
