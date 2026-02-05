import { Direction, ErrorType, InventoryType, ProductType } from '../utils/types'

export type ProductInventoryType = ProductType & InventoryType

export type ProdInventoryType = {
  id: number
  quantity: number
  product_id: number
  product_name: string
  product_sku: string
}

export interface IInventoryRepository {
  getAll(params: { pageSize: number; cursorId: number; direction?: Direction }): {
    data: Array<ProductInventoryType> | null
    error: ErrorType
  }
  getById(id: number): { data: ProdInventoryType | null; error: ErrorType }
  create(params: InventoryType): { data: InventoryType | null; error: ErrorType }
  update(params: InventoryType): { success: boolean; error: ErrorType }
  delete(id: number): { success: boolean; error: ErrorType }
}
