import { CartItemType } from '@renderer/utils/types'

export type ReturnType = {
  data: CartItemType[] | null
  error: Error | string
}

export interface ICartRepository {
  getByUserId(id: number): ReturnType
}
