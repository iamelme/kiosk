import { ProductType } from '@renderer/utils/types'

type CreateProduct = Omit<ProductType, 'id'>

export interface IProductRepository {
  getAll(): Array<ProductType & { category_name: string }>
  getById(id: number): ProductType
  create({ name, description, price, quantity, category_id }: CreateProduct): void
  update(params: ProductType): void
}
