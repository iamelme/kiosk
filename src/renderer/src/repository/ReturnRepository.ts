import { ipcMain } from 'electron'
import { IReturnRepository, Return } from '../interfaces/IReturnRepository'
import { ReturnType } from '../utils/types'
import { IInventoryRepository } from '@renderer/interfaces/IInventoryRepository'

export class ReturnRepository implements IReturnRepository {
  private _database
  private _inventory: IInventoryRepository

  constructor(database, inventory: IInventoryRepository) {
    this._database = database
    this._inventory = inventory
    ipcMain.handle('return:create', (_, params: ReturnType) => this.create(params))
  }

  create(params: ReturnType): Return {
    const { sale_id, user_id, items, refund_amount } = params

    console.log({ params })

    try {
      const db = this._database
      const createdAt = new Date().toISOString()

      const insertReturn = db.prepare(
        `
                INSERT INTO returns
                (created_at, refund_amount, sale_id, user_id)
                VALUES(?, ?, ?, ?)
                `
      )

      const insertReturnItem = db.prepare(
        `
                INSERT INTO return_items
                (created_at, return_id, quantity, refund_price, product_id, sale_item_id) 
                VALUES(?, ?, ?, ?, ?, ?);
                `
      )

      const transaction = db.transaction(() => {
        console.log('trans start')

        const res = insertReturn.run(createdAt, refund_amount, sale_id, user_id)

        console.log({ res })
        console.log({ items })

        if (!res.changes) {
          throw new Error('Something went wrong while creating a return order')
        }

        console.log('start items')

        try {
          for (const item of items) {
            const resInv = this._inventory.update({
              quantity: item.quantity + item.old_quantity,
              id: res.lastInsertRowid,
              product_id: item.product_id,
              user_id: item.user_id,
              movement_type: 0,
              reference_type: 'return'
            })

            console.log({ resInv })

            if (!resInv.success && resInv.error instanceof Error) {
              throw new Error(resInv.error.message)
            }

            if (item.available_qty < 1) {
              throw new Error("You can't return this item")
            }

            const resItem = insertReturnItem.run(
              createdAt,
              res.lastInsertRowid,
              item.quantity,
              item.refund_price,
              item.product_id,
              item.sale_item_id
            )

            console.log({ resItem })

            if (!resItem.changes) {
              throw new Error('Something went wrong while creating a return item')
            }
          }
        } catch (error) {
          console.log('item error', error)
        }
      })

      transaction()

      return {
        data: null,
        error: ''
      }
    } catch (error) {
      console.error('error', error)

      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while creating a return order')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while creating a return order')
      }
    }
  }
}
