import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  CategoryType,
  ErrorType,
  InventoryType,
  ProductType,
  ReturnCartType,
  UserType,
  ReturnSaleType,
  PlaceOrderType,
  SaleType
} from '../renderer/src/utils/types'

type ProdInventoryType = {
  id: number
  quantity: number
  product_id: number
  product_name: string
  product_sku: string
}

type CategoryReturnType = {
  data: CategoryType | null
  error: ErrorType
}

type CartReturnType = {
  data: ReturnCartType | null
  error: ErrorType
}

type SaleReturnType = {
  data: ReturnSaleType | null
  error: ErrorType
}

type SaleItem = {
  sale_id: number
  product_id: number
  user_id: number
}

type CartItem = {
  cart_id: number
  product_id: number
  user_id: number
}
export const apiUser = {
  create: (params: UserType): Promise<{ data: UserType | null; error: ErrorType }> =>
    ipcRenderer.invoke('user:create', params),
  login: (params: UserType): Promise<{ data: UserType | null; error: ErrorType }> =>
    ipcRenderer.invoke('user:login', params)
}

export const apiCart = {
  getByUserId: (id: number): Promise<CartReturnType> => ipcRenderer.invoke('cart:getByUserId', id),
  updateDiscount: (params: {
    discount: number
    total: number
    cart_id: number
  }): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('cart:updateDiscount', params),
  updateItemQty: (params: {
    id: number
    cart_id: number
    quantity: number
  }): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('cart:updateItemQty', params),
  insertItem: (params: CartItem): Promise<CartReturnType> =>
    ipcRenderer.invoke('cart:insertItem', params),
  removeItem: (id: number, cart_id: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('cart:removeItem', id, cart_id),
  deleteAllItems: (cart_id: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('cart:deleteAllItems', cart_id)
}

export const apiSale = {
  getAll: (user_id: number): Promise<{ data: SaleType[] | null; error: ErrorType }> =>
    ipcRenderer.invoke('sale:getAll', user_id),
  getByUserId: (id: number): Promise<SaleReturnType> => ipcRenderer.invoke('sale:getByUserId', id),
  placeOrder: (params: PlaceOrderType): Promise<{ data: null; error: ErrorType }> =>
    ipcRenderer.invoke('sale:placeOrder', params),
  insertItem: (params: SaleItem): Promise<SaleReturnType> =>
    ipcRenderer.invoke('sale:insertItem', params),
  deleteAllItems: (sale_id: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('sale:deleteAllItems', sale_id)
}

// Custom APIs for renderer
export const apiCategory = {
  getAllCategories: (): Promise<{ data: CategoryType[]; error: ErrorType }> =>
    ipcRenderer.invoke('category:getAll'),
  getCategoryById: (id: number): Promise<CategoryReturnType> =>
    ipcRenderer.invoke('category:getById', id),
  getCategoryByName: (name: string): Promise<CategoryReturnType> =>
    ipcRenderer.invoke('category:getByName', name),
  createCategory: (name: string): Promise<CategoryReturnType> =>
    ipcRenderer.invoke('category:create', name),
  updateCategory: ({ id, name }: { id: number; name: string }): Promise<CategoryReturnType> =>
    ipcRenderer.invoke('category:update', { id, name }),
  deleteCategory: (id: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('category:delete', id)
}

export const apiProduct = {
  getAllProducts: (): Promise<{
    data: Array<ProductType & { quantity: number; category_name: string }> | null
    error: ErrorType
  }> => ipcRenderer.invoke('product:getAll'),
  getProductById: (id: number): Promise<ProductType> => ipcRenderer.invoke('product:getById', id),
  getProductByCode: (code: number): Promise<{ data: ProductType | null; error: ErrorType }> =>
    ipcRenderer.invoke('product:getByCode', code),
  getProductBySku: (sku: string): Promise<{ data: ProductType | null; error: ErrorType }> =>
    ipcRenderer.invoke('product:getBySku', sku),
  getProductByName: (name: string): Promise<{ data: ProductType | null; error: ErrorType }> =>
    ipcRenderer.invoke('product:getByName', name),
  searchProduct: (
    term: string
  ): Promise<{
    data: Array<ProductType & { quantity: number; category_name: string }> | null
    error: ErrorType
  }> => ipcRenderer.invoke('product:search', term),
  createProduct: (params: Omit<ProductType, 'id'>) => ipcRenderer.invoke('product:create', params),
  updateProduct: (params: ProductType) => ipcRenderer.invoke('product:update', params),
  deleteProduct: (id: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('product:delete', id)
}

export const apiInventory = {
  getAllInventory: (): Promise<{
    data: Array<ProductType & InventoryType>
    error: ErrorType
  }> => ipcRenderer.invoke('inventory:getAll'),
  getInventoryById: (id: number): Promise<{ data: ProdInventoryType | null; error: ErrorType }> =>
    ipcRenderer.invoke('inventory:getById', id),
  createInventory: (params: InventoryType): Promise<{ data: InventoryType; error: ErrorType }> =>
    ipcRenderer.invoke('inventory:create', params),
  updateInventory: (params: InventoryType): Promise<{ data: InventoryType; error: ErrorType }> =>
    ipcRenderer.invoke('inventory:update', params),
  deleteInventory: (id: number): Promise<{ success: boolean; error: ErrorType }> =>
    ipcRenderer.invoke('inventory:delete', id)
}

export const apiElectron = {
  getLocale: (): Promise<string> => ipcRenderer.invoke('get-locale')
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('apiCart', apiCart)
    contextBridge.exposeInMainWorld('apiSale', apiSale)
    contextBridge.exposeInMainWorld('apiUser', apiUser)
    contextBridge.exposeInMainWorld('apiCategory', apiCategory)
    contextBridge.exposeInMainWorld('apiProduct', apiProduct)
    contextBridge.exposeInMainWorld('apiInventory', apiInventory)
    contextBridge.exposeInMainWorld('apiElectron', apiElectron)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
