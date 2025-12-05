import { ErrorType, InventoryType, ProductType } from '@renderer/utils/types'

export type ProductInventoryType = ProductType & InventoryType

export interface IInventoryRepository {
  getAll(): { data: Array<ProductInventoryType> | null; error: ErrorType }
  getById(id: number): { data: ProductInventoryType | null; error: ErrorType }
  create(params: InventoryType): { data: InventoryType | null; error: ErrorType }
}
