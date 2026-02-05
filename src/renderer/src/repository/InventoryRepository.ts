import {
  IInventoryRepository,
  ProductInventoryType,
  ProdInventoryType
} from '@renderer/interfaces/IInventoryRepository'
import { InventoryType, ErrorType, Direction } from '@renderer/utils/types'
import { ipcMain } from 'electron'

export class InventoryRepository implements IInventoryRepository {
  private _database

  constructor(database) {
    this._database = database
    ipcMain.handle(
      'inventory:getAll',
      (_, params: { pageSize: number; cursorId: number; userId: number; direction?: Direction }) =>
        this.getAll(params)
    )
    ipcMain.handle('inventory:getById', (_, id: number) => this.getById(id))
    ipcMain.handle('inventory:create', (_, params: InventoryType) => this.create(params))
    ipcMain.handle('inventory:update', (_, params: InventoryType) => this.update(params))
    ipcMain.handle('inventory:delete', (_, id: number) => this.delete(id))
  }

  getAll(params: { pageSize: number; cursorId: number; direction?: Direction }): {
    data: Array<ProductInventoryType> | null
    error: ErrorType
  } {
    try {
      const { cursorId, direction = 'next', pageSize } = params
      const db = this._database

      let stmt = `
         SELECT  i.id, i.quantity, p.name, p.id AS product_id
         FROM inventory i
         LEFT JOIN products p ON i.product_id = p.id
          WHERE  i.id > ?
         LIMIT ?
      `

      if (direction === 'prev') {
        stmt = `
         SELECT  i.id, i.quantity, p.name, p.id AS product_id
         FROM inventory i
         LEFT JOIN products p ON i.product_id = p.id
          WHERE  i.id < ?
          ORDER BY i.id DESC
         LIMIT ?
      `
      }

      const products = db.prepare(stmt).all(cursorId, pageSize + 1)

      if (!products) {
        throw new Error('Something went wrong while retreiving the products')
      }

      return {
        data: products,
        error: ''
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while searching the product')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while searching the product')
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
          error: new Error('Something went wrong while searching the product')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while searching the product')
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
        error: 'Something went wrong while saving an inventory.'
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while searching the product')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while searching the product')
      }
    }
  }
  update(params: InventoryType): { success: boolean; error: ErrorType } {
    const {
      quantity,
      id,
      product_id,
      user_id,
      movement_type = 0,
      reference_type = 'adjustment'
    } = params

    console.log('params', params)
    const errorMessage = new Error('Something went wrong while updating an inventory.')

    const db = this._database

    try {
      const transaction = db.transaction(() => {
        const inventory = db
          .prepare(
            `UPDATE inventory 
          SET quantity = ?
          WHERE id = ?`
          )
          .run(quantity, id)

        if (!inventory.changes) {
          throw new Error(errorMessage.message)
        }

        const insertInvMv = db
          .prepare(
            `INSERT INTO inventory_movement (movement_type, reference_type, quantity, reference_id, product_id, user_id)
          VALUES(?, ?, ?, ?, ?, ?)
        `
          )
          .run(movement_type, reference_type, quantity, id, product_id, user_id)

        if (!insertInvMv.changes) {
          throw new Error(errorMessage.message)
        }

        return true
      })

      const res = transaction()

      if (!res) {
        throw new Error(errorMessage.message)
      }

      return {
        success: true,
        error: ''
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
  delete(id: number): { success: boolean; error: ErrorType } {
    const errorMessage = new Error('Something went wrong while updating an inventory.')
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
