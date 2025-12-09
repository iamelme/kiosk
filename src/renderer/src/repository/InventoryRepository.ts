import {
  IInventoryRepository,
  ProductInventoryType,
  ProdInventoryType
} from '@renderer/interfaces/IInventoryRepository'
import { InventoryType, ErrorType } from '@renderer/utils/types'
import { ipcMain } from 'electron'

export class InventoryRepository implements IInventoryRepository {
  private _database

  constructor(database) {
    this._database = database
    ipcMain.handle('inventory:getAll', () => this.getAll())
    ipcMain.handle('inventory:getById', (_, id: number) => this.getById(id))
    ipcMain.handle('inventory:create', (_, params: InventoryType) => this.create(params))
    ipcMain.handle('inventory:update', (_, params: InventoryType) => this.update(params))
    ipcMain.handle('inventory:delete', (_, id: number) => this.delete(id))
  }

  getAll(): { data: Array<ProductInventoryType> | null; error: ErrorType } {
    try {
      const products = this._database
        .prepare(
          `
        SELECT  i.id, i.quantity, p.name, p.id AS product_id
        FROM inventory i
        LEFT JOIN products p ON i.product_id = p.id
        LIMIT 20
        `
        )
        .all()

      console.log({ products })

      return {
        data: products,
        error: ''
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error("Something wen't wrong while searching the product")
        }
      }
      return {
        data: null,
        error: new Error("Something wen't wrong while searching the product")
      }
    }
  }
  getById(id: number): { data: ProdInventoryType | null; error: ErrorType } {
    try {
      const product = this._database
        .prepare(
          `
            SELECT i.*, p.name AS product_name, p.sku AS product_sku
            FROM inventory AS i
            LEFT JOIN products AS p ON i.product_id = p.id
            WHERE i.id = ?
            `
        )
        .get(id)

      if (product) {
        return {
          data: product,
          error: ''
        }
      }

      return {
        data: null,
        error: "Couldn't find an inventory."
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error("Something wen't wrong while searching the product")
        }
      }
      return {
        data: null,
        error: new Error("Something wen't wrong while searching the product")
      }
    }
  }
  create(params: InventoryType): { data: InventoryType | null; error: ErrorType } {
    const { quantity, product_id } = params
    try {
      const product = this._database
        .prepare(
          `INSERT INTO inventory (quantity, product_id)
        VALUES(?, ?) RETURNING *`
        )
        .run(quantity, product_id)

      if (product) {
        return {
          data: product,
          error: ''
        }
      }

      return {
        data: null,
        error: "Something wen't wrong while saving an inventory."
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error("Something wen't wrong while searching the product")
        }
      }
      return {
        data: null,
        error: new Error("Something wen't wrong while searching the product")
      }
    }
  }
  update(params: InventoryType): { data: InventoryType | null; error: ErrorType } {
    const { quantity, id } = params

    console.log('params', params)
    const errorMessage = new Error("Something wen't wrong while updating an inventory.")

    try {
      console.log('inside try catch')
      const product = this._database
        .prepare(
          `UPDATE inventory 
          SET quantity = ?
          WHERE id = ?`
        )
        .run(quantity, id)

      console.log({ product })

      if (product) {
        return {
          data: product,
          error: ''
        }
      }

      return {
        data: null,
        error: errorMessage
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: errorMessage
        }
      }
      return {
        data: null,
        error: errorMessage
      }
    }
  }
  delete(id: number): { success: boolean; error: ErrorType } {
    const errorMessage = new Error("Something wen't wrong while updating an inventory.")
    try {
      this._database.prepare(`DELETE FROM inventory WHERE id = ?`).run(id)

      return {
        success: true,
        error: errorMessage
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: errorMessage
        }
      }
      return {
        success: false,
        error: errorMessage
      }
    }
  }
}
