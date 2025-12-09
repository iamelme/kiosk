import { UserType } from '@renderer/utils/types'
import { StateCreator } from 'zustand'

type User = Partial<Omit<UserType, 'password'>>

export interface UserSlice {
  user: User
  updateUser: (user: User) => void
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (set) => ({
  user: {
    id: undefined,
    user_name: undefined
  },
  updateUser: (user) =>
    set(() => ({
      user: {
        id: user.id,
        user_name: user.user_name
      }
    }))
})
