import { InventoryMovementParams, InventoryMovementReturn } from '../features/inventory/utils/types'
import { CustomResponseType, Direction, ErrorType, InventoryType, ProductType } from '../shared/utils/types'

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
  getById(params: InventoryMovementParams): {
    data:
    {

      productName: string,
      movements: InventoryMovementReturn[] | null
    } | null;
    error: ErrorType
  }

  create(params: InventoryType): CustomResponseType
  update(params: InventoryType): CustomResponseType
  delete(id: number): CustomResponseType
}
