import { SaleItem, ISaleRepository, ReturnType } from '@renderer/interfaces/ISaleRepository'
import { PlaceOrderType, SaleType } from '@renderer/utils/types'
import { ipcMain } from 'electron'

export class SaleRepository implements ISaleRepository {
  private _database
  constructor(database) {
    this._database = database
    ipcMain.handle('sale:getAll', (_, user_id: number) => this.getAll(user_id))
    ipcMain.handle('sale:getByUserId', (_, id: number) => this.getByUserId(id))
    ipcMain.handle('sale:insertItem', (_, params: SaleItem) => this.insertItem(params))
    ipcMain.handle('sale:placeOrder', (_, params: PlaceOrderType) => this.placeOrder(params))
    ipcMain.handle('sale:deleteAllItems', (_, sale_id: number) => this.deleteAllItems(sale_id))
  }
  getAll(user_id: number): { data: SaleType[] | null; error: Error | string } {
    try {
      const db = this._database

      const sales = db
        .prepare(
          `SELECT * 
        FROM sales
        WHERE user_id = ?
        `
        )
        .all(user_id)

      if (!sales) {
        throw new Error('Sorry no sales')
      }

      return {
        data: sales,
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

  getByUserId(id: number): ReturnType {
    try {
      let saleItems, sale
      const transaction = this._database.transaction(() => {
        console.log('transaction start')

        saleItems = this._database
          .prepare(
            `
                SELECT  si.*, p.price, p.name, p.sku, p.code, i.quantity AS product_quantity
                FROM sale_items AS si
                LEFT JOIN products AS p ON p.id = si.product_id
                LEFT JOIN inventory AS i ON i.product_id = p.id
                WHERE si.user_id = ?;
                `
          )
          .all(id)

        sale = this._database
          .prepare(
            `
            SELECT s.id, s.sub_total, s.discount, s.total 
            FROM sales AS s
            WHERE user_id = ?
            `
          )
          .get(id)

        console.log('sale get by user ', sale)

        if (!sale) {
          sale = this.create(id).data
          console.log('create sale', sale)
        }

        // get the discount, tax, and compute the total
      })
      transaction()

      // console.log('sale', sale, saleItems)

      if (sale) {
        return {
          data: {
            ...sale,
            items: saleItems
          },
          error: ''
        }
      }

      return {
        data: null,
        error: new Error('Something went wrong while retrieving the product.')
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

  create(user_id: number): ReturnType {
    try {
      const stmt = this._database.prepare(`
        INSERT INTO sales (status, user_id)
        VALUES(?, ?)
        RETURNING id
        `)

      const sale = stmt.get('in-progress', user_id)

      console.log('returning sale', sale)

      if (!sale) {
        throw new Error('Something went wrong while creating a sale')
      }

      return {
        data: sale,
        error: ''
      }
    } catch (error) {
      console.log('inside catch', error)
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while creating a sale')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while creating a sale')
      }
    }
  }

  placeOrder(params: PlaceOrderType): ReturnType {
    const { cart, amount, reference_number, method, user_id } = params
    try {
      const transaction = this._database.transaction(() => {
        console.log('place order start', params)

        const saleId = this.create(user_id).data?.id

        if (!saleId) {
          return false
        }

        this._database
          .prepare(
            `
          UPDATE sales
          SET status = ?,
          sub_total = ?,
          discount = ?,
          total = ?
          WHERE id = ?
          `
          )
          .run('complete', cart.sub_total, cart.discount, cart.total, saleId)

        console.log('cart items', cart.items)

        try {
          const saleItemsStmt = this._database.prepare(`
            INSERT INTO sale_items (quantity, unit_price, unit_cost, line_total, sale_id, product_id, user_id)
            VALUES(?, ?, ?, ?, ?, ?, ?)
            `)

          const invStmt = this._database.prepare(
            `
            UPDATE inventory
            SET quantity = quantity - ?
            WHERE product_id = ?
            `
          )

          const invMovStmt = this._database.prepare(
            `INSERT INTO inventory_movement (movement_type, reference_type, quantity, reference_id, product_id, user_id)
          VALUES(?, ?, ?, ?, ?, ?)
          `
          )
          for (const item of cart.items) {
            const line_total = item.quantity * item.price

            saleItemsStmt.run(
              item.quantity,
              item.price,
              item.cost,
              line_total,
              saleId,
              item.product_id,
              item.user_id
            )

            invStmt.run(item.quantity, item.product_id)
            invMovStmt.run(0, 'sales', item.quantity, saleId, item.product_id, item.user_id)
          }
        } catch (error) {
          console.error(error)
        }

        console.log('after loop')

        const normalizeAmount = amount * 100

        this._database
          .prepare(
            `
          INSERT INTO payments (amount, reference_number, method, sale_id)
          VALUES(?, ?, ?, ?)
          `
          )
          .run(normalizeAmount, reference_number, method, saleId)

        return true
      })

      const result = transaction()

      console.log('result transaction', result)

      if (!result) {
        throw new Error('Something went wrong while creating an item the product')
      }

      return {
        data: null,
        error: ''
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while creating a sale')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while creating a sale')
      }
    }
  }

  insertItem(params: SaleItem): ReturnType {
    const { sale_id, product_id, user_id } = params
    try {
      let items
      let saleId = sale_id
      const transaction = this._database.transaction(() => {
        if (!sale_id) {
          const sale = this.create(user_id).data
          if (sale) {
            saleId = sale.id
          }
        }

        const foundItem = this._database
          .prepare(
            `
          SELECT si.*, i.quantity AS product_quantity 
          FROM sale_items AS si
          LEFT JOIN inventory AS i ON si.product_id = i.product_id
          WHERE si.product_id = ?;
          `
          )
          .get(product_id)

        // check if product is in the sale items
        // then update the sale item's quantity if not exceed to product's quantity

        console.log({ foundItem })

        if (foundItem) {
          if (foundItem.quantity >= foundItem.product_quantity) {
            throw new Error('You cannot add more to this product')
          }

          this._database
            .prepare(
              `
            UPDATE sale_items
            SET quantity = quantity + 1
            WHERE id = ?
            `
            )
            .run(foundItem.id)
        } else {
          this._database
            .prepare(
              `
            INSERT INTO sale_items (quantity, sale_id, product_id, user_id)
            VALUES(1, ?, ?, ?)
            `
            )
            .run(saleId, product_id, user_id)
        }

        // select all items
        // calculate the subtotal, discount, and total

        items = this._database
          .prepare(
            `SELECT * 
            FROM sale_items AS si
            LEFT JOIN products AS p ON p.id = si.product_id
            WHERE sale_id = ?`
          )
          .all(saleId)

        console.log('from insert', { items })

        const subTotal = items?.reduce((acc, cur) => (acc += cur.quantity * cur.price), 0)

        const saleDiscount = this._database
          .prepare(
            `SELECT discount 
          FROM sales
          WHERE id = ?
          `
          )
          .get(saleId)

        console.log('discount', saleDiscount, subTotal)

        const total = (subTotal || 0) - (saleDiscount.discount ?? 0)

        console.log('total', total)

        this._database
          .prepare(
            `UPDATE sales
          SET sub_total = ?,
          total = ?
          WHERE id = ?`
          )
          .run(subTotal, total, saleId)

        console.log('done inserting')

        return {
          data: items,
          error: ''
        }
      })

      const result = transaction()

      if (!result) {
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

  deleteAllItems(sale_id: number): { success: boolean; error: Error | string } {
    try {
      const transaction = this._database.transaction(() => {
        this._database
          .prepare(
            `DELETE FROM sale_items
        WHERE sale_id = ?`
          )
          .run(sale_id)

        this._database
          .prepare(
            `UPDATE sales
          SET discount = 0,
          sub_total = 0,
          total = 0
          WHERE id = ?
          `
          )
          .run(sale_id)
      })

      transaction()

      return {
        success: true,
        error: new Error('Something went wrong while deleting the sale')
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
