import { ElectronAPI } from '@electron-toolkit/preload'
import {
  apiCart,
  apiSale,
  apiUser,
  apiCategory,
  apiElectron,
  apiInventory,
  apiProduct
} from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    apiCart: typeof apiCart
    apiSale: typeof apiSale
    apiUser: typeof apiUser
    apiCategory: typeof apiCategory
    apiProduct: typeof apiProduct
    apiInventory: typeof apiInventory
    apiElectron: typeof apiElectron
  }
}
