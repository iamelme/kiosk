import { ICartRepository, ReturnType } from '@renderer/interfaces/ICartRepository'
import { ipcMain } from 'electron'

export class CartRepository implements ICartRepository {
  private _database
  constructor(database) {
    this._database = database
    ipcMain.handle('cart:getByUserId', (_, id: number) => this.getByUserId(id))
  }
  getByUserId(id: number): ReturnType {
    try {
      const cart = this._database
        .prepare(
          `
                SELECT  ci.*, p.price FROM cart_items AS ci
                LEFT JOIN carts AS c ON c.id = ci.cart_id
                LEFT JOIN products AS p ON p.id = ci.product_id
                WHERE c.user_id = ?;
                `
        )
        .all(id)

      // get the discount, tax, and compute the total

      if (cart) {
        return {
          data: cart,
          error: ''
        }
      }

      return {
        data: null,
        error: new Error("Something wen't wrong while retrieving the product")
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error("Something wen't wrong while retrieving the product")
        }
      }
      return {
        data: null,
        error: new Error("Something wen't wrong while  retrieving the product")
      }
    }
  }
}
