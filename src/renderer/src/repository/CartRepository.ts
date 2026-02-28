import { Database } from 'better-sqlite3'
import { CartItem, ICartRepository, ReturnType } from '../interfaces/ICartRepository'
import { ipcMain } from 'electron'
import { CartItemType, InventoryType, ReturnCartType } from '@renderer/shared/utils/types'

export class CartRepository implements ICartRepository {
  private _database: Database
  constructor(database: Database) {
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
      const db = this._database

      const stmtItems = `
                SELECT  ci.*, p.price, p.cost, p.name, p.sku, p.code, i.quantity AS product_quantity
                FROM cart_items AS ci
                LEFT JOIN products AS p ON p.id = ci.product_id
                LEFT JOIN inventory AS i ON i.product_id = p.id
                WHERE ci.user_id = ?;
                `


      const stmtCarts = `
            SELECT c.id, c.sub_total, c.discount, c.total
            FROM carts AS c
            WHERE user_id = ?
            `
      const transaction = db.transaction(() => {
        const cartItems = db
          .prepare(stmtItems)
          .all(id)

        const cart = db
          .prepare(stmtCarts)
          .get(id) as ReturnCartType

        return {
          ...cart,
          items: cartItems as CartItemType[]
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

      const stmtCarts = `
        SELECT sub_total, id
        FROM carts
        WHERE id = ?
        `

      const stmtCartUpdate = `UPDATE carts
        SET discount = ?,
        total = ?
        WHERE id = ?
        `

      const transaction = db.transaction(() => {
        const cart = db
          .prepare(stmtCarts)
          .get(cart_id) as ReturnCartType
        const normalizeTotal = cart.sub_total - normalizeDiscount

        db.prepare(
          stmtCartUpdate
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
      const stmtCartItemsUpdate = `
          UPDATE cart_items
          SET quantity = ?
          WHERE id = ?
          `
      const stmtCartItems = `SELECT ci.quantity, p.price, c.discount
          FROM cart_items AS ci
          LEFT JOIN products AS p ON p.id = ci.product_id
          LEFT JOIN carts AS c ON ci.cart_id = c.id
          WHERE ci.cart_id = ?`

      const transaction = db.transaction(() => {
        console.log('transaction start')
        db.prepare(
          stmtCartItemsUpdate
        ).run(quantity, id)

        const items = db
          .prepare(
            stmtCartItems
          )
          .all(cart_id) as Array<CartItemType & { discount: number }>

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
      const db = this._database

      const stmtCartItems = `
          SELECT ci.*, i.quantity AS product_quantity
          FROM cart_items AS ci
          LEFT JOIN inventory AS i ON ci.product_id = i.product_id
          WHERE ci.product_id = ?;
          `
      const stmtCartItemsUpdate = `
            UPDATE cart_items
            SET quantity = quantity + 1
            WHERE id = ?
            `
      const stmtInv = `
            SELECT quantity
            FROM inventory
            WHERE product_id = ?
            `
      const stmtCartItemsBtm = `
            INSERT INTO cart_items (quantity, cart_id, product_id, user_id)
            VALUES(1, ?, ?, ?)
            `
      const stmtCartItemsProd = `SELECT *
            FROM cart_items AS ci
            LEFT JOIN products AS p ON p.id = ci.product_id
            WHERE cart_id = ?`
      const stmtDiscount = `SELECT discount
          FROM carts
          WHERE id = ?
          `
      const stmtCartUpdate = `UPDATE carts
          SET sub_total = ?,
          total = ?
          WHERE id = ?`

      const transaction = db.transaction(() => {
        const foundItem = db
          .prepare(
            stmtCartItems
          )
          .get(product_id) as CartItemType & { quantity: number }

        // check if product is in the cart items
        // then update the cart item's quantity if not exceed to product's quantity

        console.log({ foundItem })

        if (foundItem) {
          if (foundItem.quantity >= foundItem.product_quantity) {
            throw new Error('You cannot add more to this product')
          }

          db.prepare(
            stmtCartItemsUpdate
          ).run(foundItem.id)

        } else {
          // check product inventory

          const product = db
            .prepare(
              stmtInv
            )
            .get(product_id) as InventoryType

          if (product.quantity < 1) {
            throw new Error('Product is out of stock')
          }

          db.prepare(
            stmtCartItemsBtm
          ).run(cart_id, product_id, user_id)
        }

        // select all items
        // calculate the subtotal, discount, and total

        const items = db
          .prepare(
            stmtCartItemsProd
          )
          .all(cart_id) as CartItemType[]

        console.log('from insert', { items })

        const subTotal = items?.reduce((acc, cur) => (acc += cur.quantity * cur.price), 0)

        const cartDiscount = db
          .prepare(
            stmtDiscount
          )
          .get(cart_id) as ReturnCartType

        console.log('discount', cartDiscount, subTotal)

        const total = (subTotal || 0) - (cartDiscount.discount ?? 0)

        console.log('total', total)

        db.prepare(
          stmtCartUpdate
        ).run(subTotal, total, cart_id)

        console.log('done inserting')

        return {
          data: {
            id: cart_id,
            items,
            sub_total: subTotal,
            discount: cartDiscount.discount,
            total
          },
          error: ''
        }
      })

      const res = transaction()

      if (!res) {
        throw new Error('Something went wrong while creating an item the product')
      }

      return {
        data: res.data,
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
      const db = this._database
      const stmtDel = `DELETE FROM cart_items
            WHERE id = ?
          `
      const stmtCartItems = `
          SELECT p.price, ci.quantity
          FROM cart_items AS ci
          LEFT JOIN products AS p ON ci.product_id = p.id
          WHERE cart_id = ?
          `
      const stmtCartUpdate = `
            UPDATE carts
            SET sub_total = 0,
            discount = 0,
            total = 0
            WHERE id = ?
            `
      const stmtDis = `
          SELECT discount
          FROM carts
          WHERE id = ?
          `
      const stmtCartFinUpdate = `
            UPDATE carts
            SET sub_total = ?,
            total = ?
            WHERE id = ?
            `
      const transaction = db.transaction(() => {
        db
          .prepare(
            stmtDel
          )
          .run(id)


        // calculate the cart

        const items = db
          .prepare(
            stmtCartItems
          )
          .all(cart_id) as CartItemType[]

        console.log('items', items)

        if (!items.length) {
          db
            .prepare(
              stmtCartUpdate
            )
            .run(cart_id)

          return true
        }

        const cart = db
          .prepare(
            stmtDis
          )
          .get(cart_id) as ReturnCartType
        console.log(cart)

        const subTotal = items.reduce((acc, cur) => (acc += cur.price * cur.quantity), 0)
        const total = subTotal - (cart?.discount ?? 0)

        db
          .prepare(
            stmtCartFinUpdate
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
      const db = this._database
      const stmt = `DELETE FROM cart_items
        WHERE cart_id = ?`
      const stmtUpdate = `UPDATE carts
          SET discount = 0,
          sub_total = 0,
          total = 0
          WHERE id = ?
          `
      const transaction = db.transaction(() => {
        db
          .prepare(
            stmt
          )
          .run(cart_id)

        db
          .prepare(
            stmtUpdate
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
