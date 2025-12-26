import { CartItem, ICartRepository, ReturnType } from '@renderer/interfaces/ICartRepository'
import { ipcMain } from 'electron'

export class CartRepository implements ICartRepository {
  private _database
  constructor(database) {
    this._database = database
    ipcMain.handle('cart:getByUserId', (_, id: number) => this.getByUserId(id))
    ipcMain.handle(
      'cart:updateDiscount',
      (_, params: { discount: number; total: number; cart_id: number }) =>
        this.updateDiscount(params)
    )
    ipcMain.handle(
      'cart:updateItemQty',
      (_, params: { id: number; cart_id: number; quantity: number }) => this.updateItemQty(params)
    )
    ipcMain.handle('cart:insertItem', (_, params: CartItem) => this.insertItem(params))
    ipcMain.handle('cart:removeItem', (_, id: number, cart_id: number) =>
      this.removeItem(id, cart_id)
    )
    ipcMain.handle('cart:deleteAllItems', (_, cart_id: number) => this.deleteAllItems(cart_id))
  }
  getByUserId(id: number): ReturnType {
    try {
      const transaction = this._database.transaction(() => {
        const cartItems = this._database
          .prepare(
            `
                SELECT  ci.*, p.price, p.cost, p.name, p.sku, p.code, i.quantity AS product_quantity
                FROM cart_items AS ci
                LEFT JOIN products AS p ON p.id = ci.product_id
                LEFT JOIN inventory AS i ON i.product_id = p.id
                WHERE ci.user_id = ?;
                `
          )
          .all(id)

        const cart = this._database
          .prepare(
            `
            SELECT c.id, c.sub_total, c.discount, c.total 
            FROM carts AS c
            WHERE user_id = ?
            `
          )
          .get(id)

        // get the discount, tax, and compute the total

        return {
          ...cart,
          items: cartItems
        }
      })
      const res = transaction()

      if (!res) {
        throw new Error('Something went wrong while retrieving the product.')
      }
      return {
        data: res,
        error: ''
      }
    } catch (error) {
      console.log('inside catch', error)
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while retrieving the product')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while  retrieving the product')
      }
    }
  }

  updateDiscount(params: { discount: number; total: number; cart_id: number }): {
    success: boolean
    error: Error | string
  } {
    const { discount, cart_id } = params
    const normalizeDiscount = discount * 100
    try {
      console.log({ normalizeDiscount })
      const db = this._database

      const transaction = db.transaction(() => {
        const cart = db
          .prepare(
            `
        SELECT sub_total, id
        FROM carts
        WHERE id = ?
        `
          )
          .get(cart_id)
        const normalizeTotal = cart.sub_total - normalizeDiscount

        db.prepare(
          `UPDATE carts
        SET discount = ?,
        total = ?
        WHERE id = ?
        `
        ).run(normalizeDiscount, normalizeTotal, cart_id)

        return true
      })

      const res = transaction()

      if (!res) {
        throw new Error('Something went wrong while updating the discount.')
      }

      return {
        success: true,
        error: ''
      }
    } catch (error) {
      console.log('inside catch', error)
      if (error instanceof Error) {
        return {
          success: false,
          error: new Error('Something went wrong while retrieving the product')
        }
      }
      return {
        success: false,
        error: new Error('Something went wrong while  retrieving the product')
      }
    }
  }

  updateItemQty(params: { id: number; cart_id: number; quantity: number }): {
    success: boolean
    error: Error | string
  } {
    const { id, cart_id, quantity } = params

    try {
      const db = this._database
      const transaction = db.transaction(() => {
        console.log('transaction start')
        db.prepare(
          `
          UPDATE cart_items
          SET quantity = ?
          WHERE id = ?
          `
        ).run(quantity, id)

        const items = db
          .prepare(
            `SELECT ci.quantity, p.price, c.discount
          FROM cart_items AS ci
          LEFT JOIN products AS p ON p.id = ci.product_id
          LEFT JOIN carts AS c ON ci.cart_id = c.id
          WHERE ci.cart_id = ?`
          )
          .all(cart_id)

        console.log({ items })

        const subTotal = items?.reduce((acc, cur) => (acc += cur.price * cur.quantity), 0)
        const total = subTotal - items?.[0]?.discount

        db.prepare(
          `
          UPDATE carts
          SET sub_total = ?,
          total = ?
          WHERE id = ?
          `
        ).run(subTotal, total, cart_id)

        return true
      })

      const res = transaction()

      if (!res) {
        throw new Error('Something went wrong while retrieving the product')
      }

      return {
        success: true,
        error: ''
      }
    } catch (error) {
      console.log('inside catch', error)
      if (error instanceof Error) {
        return {
          success: false,
          error: new Error('Something went wrong while retrieving the product')
        }
      }
      return {
        success: false,
        error: new Error('Something went wrong while  retrieving the product')
      }
    }
  }

  insertItem(params: CartItem): ReturnType {
    const { cart_id, product_id, user_id } = params
    try {
      let items
      const db = this._database
      const transaction = db.transaction(() => {
        const foundItem = db
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

        if (foundItem) {
          if (foundItem.quantity >= foundItem.product_quantity) {
            throw new Error('You cannot add more to this product')
          }

          db.prepare(
            `
            UPDATE cart_items
            SET quantity = quantity + 1
            WHERE id = ?
            `
          ).run(foundItem.id)
        } else {
          // check product inventory

          const product = db
            .prepare(
              `
            SELECT quantity
            FROM inventory
            WHERE product_id = ?
            `
            )
            .get(product_id)

          if (product.quantity < 1) {
            throw new Error('Product is out of stock')
          }

          db.prepare(
            `
            INSERT INTO cart_items (quantity, cart_id, product_id, user_id)
            VALUES(1, ?, ?, ?)
            `
          ).run(cart_id, product_id, user_id)
        }

        // select all items
        // calculate the subtotal, discount, and total

        items = db
          .prepare(
            `SELECT * 
            FROM cart_items AS ci
            LEFT JOIN products AS p ON p.id = ci.product_id
            WHERE cart_id = ?`
          )
          .all(cart_id)

        console.log('from insert', { items })

        const subTotal = items?.reduce((acc, cur) => (acc += cur.quantity * cur.price), 0)

        const cartDiscount = db
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

        db.prepare(
          `UPDATE carts
          SET sub_total = ?,
          total = ?
          WHERE id = ?`
        ).run(subTotal, total, cart_id)

        console.log('done inserting')

        return {
          data: items,
          error: ''
        }
      })

      const res = transaction()

      if (!res) {
        throw new Error('Something went wrong while creating an item the product')
      }

      return {
        data: items,
        error: ''
      }
    } catch (error) {
      console.log('error insert ', error)

      if (error instanceof Error) {
        return {
          data: null,
          error: new Error(
            error.message ?? 'Something went wrong while creating an item the product'
          )
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while creating an item the product')
      }
    }
  }

  removeItem(id: number, cart_id: number): { success: boolean; error: Error | string } {
    try {
      const transaction = this._database.transaction(() => {
        this._database
          .prepare(
            `DELETE FROM cart_items
            WHERE id = ?
          `
          )
          .run(id)

        console.log('2nd')

        // calculate the cart

        const items = this._database
          .prepare(
            `
          SELECT p.price, ci.quantity
          FROM cart_items AS ci
          LEFT JOIN products AS p ON ci.product_id = p.id
          WHERE cart_id = ?
          `
          )
          .all(cart_id)

        console.log('items', items)

        if (!items.length) {
          this._database
            .prepare(
              `
            UPDATE carts
            SET sub_total = 0,
            discount = 0,
            total = 0
            WHERE id = ?
            `
            )
            .run(cart_id)

          return true
        }

        const cart = this._database
          .prepare(
            `
          SELECT discount
          FROM carts
          WHERE id = ?
          `
          )
          .get(cart_id)
        console.log(cart)

        const subTotal = items.reduce((acc, cur) => (acc += cur.price * cur.quantity), 0)
        const total = subTotal - (cart?.discount ?? 0)

        this._database
          .prepare(
            `
            UPDATE carts
            SET sub_total = ?,
            total = ?
            WHERE id = ?
            `
          )
          .run(subTotal, total, cart_id)

        return true
      })

      const res = transaction()

      if (!res) throw new Error('Something went wrong while deleting the cart')

      return {
        success: true,
        error: ''
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: new Error(
            error.message ?? 'Something went wrong while deleting an item the product'
          )
        }
      }
      return {
        success: false,
        error: new Error('Something went wrong while deleting an item the product')
      }
    }
  }

  deleteAllItems(cart_id: number): { success: boolean; error: Error | string } {
    try {
      const transaction = this._database.transaction(() => {
        this._database
          .prepare(
            `DELETE FROM cart_items
        WHERE cart_id = ?`
          )
          .run(cart_id)

        this._database
          .prepare(
            `UPDATE carts
          SET discount = 0,
          sub_total = 0,
          total = 0
          WHERE id = ?
          `
          )
          .run(cart_id)

        return true
      })

      const res = transaction()

      if (!res) throw new Error('Something went wrong while deleting the cart')

      return {
        success: true,
        error: ''
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: new Error(
            error.message ?? 'Something went wrong while deleting an item the product'
          )
        }
      }
      return {
        success: false,
        error: new Error('Something went wrong while deleting an item the product')
      }
    }
  }
}
