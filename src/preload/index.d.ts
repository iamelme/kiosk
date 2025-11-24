import { ElectronAPI } from '@electron-toolkit/preload'
import { apiCategory, apiProduct } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    apiCategory: typeof apiCategory
    apiProduct: typeof apiProduct
  }
}
