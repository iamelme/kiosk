import { create } from 'zustand'
import { AppSlice, createAppSlice } from './slices/appSlice'

export const useBoundStore = create<AppSlice>((...a) => ({
  ...createAppSlice(...a)
}))

export default useBoundStore
