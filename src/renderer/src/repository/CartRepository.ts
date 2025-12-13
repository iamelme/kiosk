import { CartItem, ICartRepository, ReturnType } from '@renderer/interfaces/ICartRepository'
import { ipcMain } from 'electron'

export class CartRepository implements ICartRepository {
  private _database
  constructor(database) {
    this._database = database
    ipcMain.handle('cart:getByUserId', (_, id: number) => this.getByUserId(id))
    ipcMain.handle('cart:insertItem', (_, params: CartItem) => this.insertItem(params))
  }
  getByUserId(id: number): ReturnType {
    try {
      let cartItems, cart
      const transaction = this._database.transaction(() => {
        cartItems = this._database
          .prepare(
            `
                SELECT  ci.*, p.price, p.name, p.sku, p.code, i.quantity AS product_quantity
                FROM cart_items AS ci
                LEFT JOIN products AS p ON p.id = ci.product_id
                LEFT JOIN inventory AS i ON i.product_id = p.id
                WHERE ci.user_id = ?;
                `
          )
          .all(id)

        cart = this._database
          .prepare(
            `
            SELECT c.id, c.sub_total, c.discount, c.total 
            FROM carts AS c
            WHERE user_id = ?
            `
          )
          .get(id)

        // get the discount, tax, and compute the total
      })
      transaction()

      console.log('cart', cart, cartItems)

      if (cart) {
        return {
          data: {
            ...cart,
            items: cartItems
          },
          error: ''
        }
      }

      return {
        data: null,
        error: new Error("Something wen't wrong while retrieving the product.")
      }
    } catch (error) {
      console.log('inside catch', error)
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

  insertItem(params: CartItem): ReturnType {
    const { cart_id, product_id, user_id } = params
    try {
      const transaction = this._database.transaction(() => {
        const foundItem = this._database
          .prepare(
            `
          SELECT ci.*, i.quantity AS product_quantity 
          FROM cart_items AS ci
          LEFT JOIN inventory AS i ON ci.product_id = i.product_id
          WHERE ci.product_id = ?;
          `
          )
          .get(product_id)

        // check if product is in the cart items
        // then update the cart item's quantity if not exceed to product's quantity

        console.log({ foundItem })

        if (foundItem && foundItem.quantity < foundItem.product_quantity) {
          this._database
            .prepare(
              `
            UPDATE cart_items
            SET quantity = quantity + 1
            WHERE id = ?
            `
            )
            .run(foundItem.id)
        } else {
          this._database
            .prepare(
              `
            INSERT INTO cart_items (quantity, cart_id, product_id, user_id)
            VALUES(1, ?, ?, ?)
            `
            )
            .run(cart_id, product_id, user_id)
        }

        // select all items
        // calculate the subtotal, discount, and total

        const items = this._database
          .prepare(
            `SELECT * 
            FROM cart_items AS ci
            LEFT JOIN products AS p ON p.id = ci.product_id
            WHERE cart_id = ?`
          )
          .all(cart_id)

        console.log('from insert', { items })

        const subTotal = items?.reduce((acc, cur) => (acc += cur.quantity * cur.price), 0)

        const cartDiscount = this._database
          .prepare(
            `SELECT discount 
          FROM carts
          WHERE id = ?
          `
          )
          .get(cart_id)

        console.log('discount', cartDiscount, subTotal)

        const total = (subTotal || 0) - (cartDiscount.discount ?? 0)

        console.log('total', total)

        this._database
          .prepare(
            `UPDATE carts
          SET sub_total = ?,
          total = ?
          WHERE id = ?`
          )
          .run(subTotal, total, cart_id)

        console.log('done inserting')
      })

      transaction()

      return {
        data: null,
        error: new Error("Something wen't wrong while creating an item the product")
      }
    } catch (error) {
      console.log('error insert ', error)

      if (error instanceof Error) {
        return {
          data: null,
          error: new Error("Something wen't wrong while creating an item the product")
        }
      }
      return {
        data: null,
        error: new Error("Something wen't wrong while creating an item the product")
      }
    }
  }
}
