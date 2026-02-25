import { Direction, ProductType } from '../shared/utils/types'

type CreateProduct = Omit<ProductType, 'id'>

export type ReturnType = { data: ProductType | null; error: Error | string }

export interface IProductRepository {
  getAll(params: { pageSize: number; cursorId: number; userId: number; direction?: Direction }): {
    data: Array<ProductType & { quantity: number; category_name: string }> | null
    error: Error | string
  }
  getById(id: number): ReturnType
  getByName(name: string): ReturnType
  getByCode(code: number): ReturnType
  getBySku(sku: string): ReturnType
  search(term: string): {
    data: Array<ProductType & { quantity: number; category_name: string }> | null
    error: Error | string
  }
  create(params: CreateProduct): {
    data: ProductType | null
    error: Error | string
  }
  update(params: ProductType & { quantity: number, user_id: number }): ReturnType
  delete(id: number): { success: boolean; error: Error | string }
}
