import { ErrorType, PlaceOrderType, ReturnSaleType, SaleType } from '@renderer/utils/types'

export type ReturnType = {
  data: ReturnSaleType | null
  error: ErrorType
}

export type SaleItem = {
  sale_id: number
  // item_id: number
  product_id: number
  user_id: number
}

export interface ISaleRepository {
  getAll(user_id: number): { data: SaleType[] | null; error: ErrorType }
  getByUserId(id: number): ReturnType
  getById(id: number): ReturnType
  create(user_id: number): ReturnType
  placeOrder(params: PlaceOrderType): { success: boolean; error: ErrorType }
  insertItem(params: SaleItem): ReturnType
  updateStatus(params: { id: number; status: string }): { success: boolean; error: ErrorType }
  deleteAllItems(sale_id: number): { success: boolean; error: ErrorType }
}
