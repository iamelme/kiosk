import { ErrorType, PlaceOrderType, ReturnSaleType, SaleType } from '../utils/types'

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

export type TopItemsType = {
  id: number
  created_at: string
  name: string
  net_quantity_sold: number
}

export type Direction = 'prev' | 'next'

export interface ISaleRepository {
  getAll(params: { pageSize: number; cursorId: number; userId: number; direction?: Direction }): {
    data: SaleType[] | null
    error: ErrorType
  }
  getByUserId(id: number): ReturnType
  getById(id: number): ReturnType
  getRevenue(params: { startDate: string; endDate: string }): {
    data: { gross_revenue: number; total_return: number; net_revenue: number } | null
    error: ErrorType
  }
  getTopItems({
    pageSize,
    cursorId,
    lastTotal,
    startDate,
    endDate,
    direction
  }: {
    pageSize: number
    cursorId: number
    lastTotal: number
    startDate: string
    endDate: string
    direction?: Direction
  }): {
    data: TopItemsType[] | null
    error: ErrorType
  }
  create(userId: number): ReturnType
  placeOrder(params: PlaceOrderType): { success: boolean; error: ErrorType }
  insertItem(params: SaleItem): ReturnType
  updateStatus(params: { id: number; status: string }): { success: boolean; error: ErrorType }
  deleteAllItems(saleId: number): { success: boolean; error: ErrorType }
}
