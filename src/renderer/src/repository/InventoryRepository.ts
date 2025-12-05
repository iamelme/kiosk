import {
  IInventoryRepository,
  ProductInventoryType
} from '@renderer/interfaces/IInventoryRepository'
import { ProductType, InventoryType, ErrorType } from '@renderer/utils/types'
import { ipcMain } from 'electron'

export class InventoryRepository implements IInventoryRepository {
  private _database

  constructor(database) {
    this._database = database
    ipcMain.handle('inventory:getAll', () => this.getAll())
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
  getById(id: number): { data: (ProductType & InventoryType) | null; error: ErrorType } {
    try {
      const product = this._database
        .prepare(
          `
            SELECT * FROM inventory 
            WHERE id = ?
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
}
