import { ProductType } from '@renderer/utils/types'

type CreateProduct = Omit<ProductType, 'id'>

type ReturnType = { data: ProductType | null; error: Error | string }

export interface IProductRepository {
  getAll(): {
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
  update(params: ProductType): ReturnType
  delete(id: number): { success: boolean; error: Error | string }
}
