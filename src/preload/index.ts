import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { CategoryType, ErrorType, InventoryType, ProductType } from '../renderer/src/utils/types'

type CategoryReturnType = {
  data: CategoryType | null
  error: ErrorType
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
  }> => ipcRenderer.invoke('inventory:getAll')
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
