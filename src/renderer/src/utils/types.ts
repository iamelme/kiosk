export type UserType = {
  id: number
  user_name: string
  password: string
}

export type CategoryType = {
  id: number
  name: string
}

export type ProductType = {
  id: number
  name: string
  sku: string
  description?: string
  price: number
  code: number
  category_id: number
}

export type InventoryType = {
  id: number
  quantity: number
  product_id: number
}

export type CartType = {
  id: number
  user_id: number
}

export type CartItemType = {
  id: number
  quantity: number
  product_id: number
  product_quantity: number
  name: string
  sku: string
  code: number
  price: number
  cart_id: number
  user_id: number
}

export type ReturnCartType = {
  id: number
  items: CartItemType[]
  sub_total: number
  discount: number
  total: number
}

export type ErrorType = Error | string
