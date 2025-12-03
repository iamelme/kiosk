import { ProductType } from '@renderer/utils/types'

type CreateProduct = Omit<ProductType, 'id'>

export interface IProductRepository {
  getAll(): Array<ProductType & { category_name: string }>
  getById(id: number): { data: ProductType | null; error: Error | string }
  getByName(name: string): { data: ProductType | null; error: Error | string }
  getByCode(code: number): { data: ProductType | null; error: Error | string }
  getBySku(sku: string): { data: ProductType | null; error: Error | string }
  create({ name, description, price, quantity, category_id }: CreateProduct): {
    data: ProductType | null
    error: Error | string
  }
  update(params: ProductType): { data: ProductType | null; error: Error | string }
  delete(id: number): { success: boolean; error: Error | string }
}
