import { PlaceOrderType, ReturnSaleType } from '@renderer/utils/types'

export type ReturnType = {
  data: ReturnSaleType | null
  error: Error | string
}

export type SaleItem = {
  sale_id: number
  // item_id: number
  product_id: number
  user_id: number
}

export interface ISaleRepository {
  getByUserId(id: number): ReturnType
  create(user_id: number): ReturnType
  placeOrder(params: PlaceOrderType): ReturnType
  insertItem(params: SaleItem): ReturnType
  deleteAllItems(sale_id: number): { success: boolean; error: Error | string }
}
