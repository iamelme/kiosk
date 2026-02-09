import { ipcMain } from 'electron'
import { IReturnRepository, Return } from '../interfaces/IReturnRepository'
import { ReturnType } from '../utils/types'

export default class ReturnRepository implements IReturnRepository {
  private _database

  constructor(database) {
    this._database = database
    ipcMain.handle('return:create', (_, params: ReturnType) => this.create(params))
  }

  create({ sale_id, user_id, items, refund_amount }: ReturnType): Return {
    try {
      const db = this._database

      const transaction = db.transaction(() => {
        const refund = db
          .prepare(
            `
                INSERT INTO refund
                (refund_amount, sale_id, user_id)
                VALUES(?, ?, ?)
                `
          )
          .run(refund_amount, sale_id, user_id)

        if (!refund.changes) {
          throw new Error('Something went wrong while creating a return order')
        }

        for (let i = 0; i < items?.length; i++) {
          const item = items[i]

          const resItem = db
            .prepare(
              `
                INSERT INTO refund_items
                (return_id, quantity, refund_price) 
                `
            )
            .run(refund.lastInsertROWID, item.quantity, item.refund_price)

          if (!resItem.changes) {
            throw new Error('Something went wrong while creating a return item')
          }
        }
      })

      transaction()

      return {
        data: null,
        error: ''
      }
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while updating the product')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while updating the product')
      }
    }
  }
}
