import { IProductRepository, ReturnType } from '../interfaces/IProductRepository'
import { Direction, ProductType } from '../shared/utils/types'
import { ipcMain } from 'electron'
import { SqliteError } from 'better-sqlite3'
import { IInventoryRepository } from '../interfaces/IInventoryRepository'

export class ProductRepository implements IProductRepository {
  private _database
  private _inventory: IInventoryRepository

  constructor(database, inventory: IInventoryRepository) {
    this._database = database
    this._inventory = inventory
    ipcMain.handle(
      'product:getAll',
      (_, params: { pageSize: number; cursorId: number; userId: number; direction?: Direction }) =>
        this.getAll(params)
    )
    ipcMain.handle('product:getById', (_, id: number) => this.getById(id))
    ipcMain.handle('product:getByCode', (_, code: number) => this.getByCode(code))
    ipcMain.handle('product:getByName', (_, name: string) => this.getByName(name))
    ipcMain.handle('product:getBySku', (_, sku: string) => this.getBySku(sku))
    ipcMain.handle('product:search', (_, term: string) => this.search(term))
    ipcMain.handle('product:create', (_, params: Omit<ProductType, 'id'>) => this.create(params))
    ipcMain.handle('product:update', (_, params: ProductType & { user_id: number }) => this.update(params))
    ipcMain.handle('product:delete', (_, id: number) => this.delete(id))
  }

  getAll(params: { pageSize: number; cursorId: number; userId: number; direction?: Direction }): {
    data: Array<ProductType & { quantity: number; category_name: string }> | null
    error: Error | ''
  } {
    const { cursorId, direction = 'next', pageSize } = params
    console.log(params)

    try {
      const db = this._database

      let stmt = `
      SELECT p.*, i.quantity, c.name as category_name
        FROM products AS p
        LEFT JOIN categories as c ON p.category_id = c.id
        LEFT JOIN inventory as i ON p.id = i.product_id
        WHERE p.is_active = 1 AND p.id > ?
        LIMIT ?`

      if (direction === 'prev') {
        stmt = `
         SELECT p.*, i.quantity, c.name as category_name
        FROM products AS p
        LEFT JOIN categories as c ON p.category_id = c.id
        LEFT JOIN inventory as i ON p.id = i.product_id
        WHERE p.is_active = 1 AND p.id < ?
        ORDER BY id DESC
        LIMIT ? `
      }

      const products = db.prepare(stmt).all(cursorId, pageSize + 1)

      console.log('products', products)

      // const products = this._database
      //   .prepare(
      //     `SELECT p.*, i.quantity, c.name as category_name
      //   FROM products AS p
      //   LEFT JOIN categories as c ON p.category_id = c.id
      //   LEFT JOIN inventory as i ON p.id = i.product_id
      //   WHERE p.is_active = 1
      //   LIMIT 20
      //   `
      //   )
      //   .all()

      if (!products) {
        throw new Error('Sorry no products')
      }

      return {
        data: products,
        error: ''
      }
    } catch (error) {
      console.log(error)

      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while retrieving products')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while retrieving products')
      }
    }
  }

  getById(id: number): ReturnType {

    const db = this._database
    const prodStmt = db.prepare('SELECT * FROM products WHERE id = ?')
    const invStmt = db.prepare(`
                                 SELECT
                                   *
                                  FROM
                                   inventory
                                  WHERE
                                    product_id = ?
                                 `)

    try {
      const transaction = db.transaction(() => {

        const product = prodStmt.get(id)
        const inventory = invStmt.get(id)

        return {
          ...product,
          inventory_id: inventory.id,
          quantity: inventory.quantity ?? 0
        }
      })

      const product = transaction()


      if (!product) {
        throw new Error("Sorry can't retrieve this product")
      }

      return {
        data: product,
        error: ''
      }
    } catch (error) {
      console.log(error)

      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while retrieving products')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while retrieving products')
      }
    }
  }

  getByName(name: string): { data: ProductType | null; error: Error | string } {
    const normalizeName = name?.trim()?.toLowerCase()
    try {
      const product = this._database
        .prepare('SELECT * FROM products WHERE LOWER(name) = ?')
        .get(normalizeName)

      if (product) {
        return {
          data: product,
          error: ''
        }
      }

      return {
        data: null,
        error: new Error('Product not found')
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

  getByCode(code: number): { data: ProductType | null; error: Error | string } {
    try {
      const product = this._database.prepare('SELECT * FROM products WHERE code = ?').get(code)
      if (product) {
        return {
          data: product,
          error: ''
        }
      }

      return {
        data: null,
        error: new Error('Product not found')
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

  getBySku(sku: string): { data: ProductType | null; error: Error | string } {
    try {
      const normalizeSKU = sku?.trim()?.toLowerCase()?.replace(/ /g, '-')
      const product = this._database
        .prepare('SELECT * FROM products WHERE sku = ?')
        .get(normalizeSKU)

      if (product) {
        return {
          data: product,
          error: ''
        }
      }

      return {
        data: null,
        error: new Error('Product not found')
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

  search(term: string): {
    data: Array<ProductType & { quantity: number; category_name: string }> | null
    error: Error | string
  } {
    try {
      const normalizeTerm = term?.trim()
      const products = this._database
        .prepare(
          `SELECT p.name, p.sku, p.code, p.price, c.name AS category_name, i.quantity
        FROM products p
          INNER JOIN products_fts pf ON p.id = pf.product_id
          LEFT JOIN categories as c ON p.category_id = c.id
          LEFT JOIN inventory as i ON p.id = i.product_id
        WHERE
          products_fts MATCH ?
        ORDER BY rank
        LIMIT 10`
        )
        .all(normalizeTerm)

      console.log('normalize term', normalizeTerm)

      console.log('search products', products)

      if (products.length) {
        return {
          data: products,
          error: ''
        }
      }
      return {
        data: null,
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

  create(params: Omit<ProductType, 'id'>): { data: ProductType | null; error: Error | string } {
    const { name, sku, description, price, code, category_id } = params

    const normalizePrice = (price ?? 0) * 100
    const normalizeSKU = sku?.trim()?.toLowerCase()?.replace(/ /g, '-')

    console.log('params', params)

    let product

    try {
      // const transaction = this._database.transaction(() => {
      const stmt = this._database.prepare(
        'INSERT INTO products (name, sku, description, price, code, category_id) VALUES(?, ?, ?, ?, ?, ?) RETURNING *'
      )
      product = stmt.run(name, normalizeSKU, description, normalizePrice, code, category_id)

      // this._database
      //   .prepare(
      //     `
      //     INSERT INTO inventory (product_id)
      //     VALUES(?)`
      //   )
      //   .run(product.lastInsertRowid)

      // this._database.prepare('UPDATE counts SET products = products + 1').run()
      // })
      // transaction()

      if (product) {
        return {
          data: product,
          error: ''
        }
      }

      return {
        data: null,
        error: new Error('Something went wrong while creating a product.')
      }
    } catch (error) {
      console.error('catch error ===>', error)
      //   if (error instanceof Error) throw new Error(error.message)
      if (error instanceof SqliteError) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return {
            data: null,
            error: new Error('Data needs to be unique')
          }
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while saving the product')
      }
    }
  }

  update(params: ProductType & { user_id: number }): { data: ProductType | null; error: Error | string } {
    const { id, name, sku, description, price, cost, code, quantity, category_id, user_id, inventory_id } = params
    // console.log('params', params)

    const normalizePrice = (price ?? 0) * 100
    const normalizeCost = (cost ?? 0) * 100
    const normalizeSKU = sku?.trim()?.toUpperCase()?.replace(/ /g, '-')

    const db = this._database

    try {
      const stmt = db.prepare(
        'UPDATE products  SET name = ?, sku = ?,  description = ? ,  price = ?, cost = ?,  code = ?,  category_id = ? WHERE id = ? RETURNING *'
      )

      const transaction = db.transaction(() => {

        stmt.all(
          name,
          normalizeSKU,
          description,
          normalizePrice,
          normalizeCost,
          code,
          category_id,
          id
        )

        this._inventory.update({
          quantity,
          id: inventory_id,
          product_id: id,
          user_id,
        })

      })

      transaction()

      if (transaction) {
        return {
          data: null,
          error: ''
        }
      }

      return {
        data: null,
        error: new Error('Error while updating the product')
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

  delete(id: number): { success: boolean; error: Error | string } {
    try {
      // const transaction = this._database.transaction(() => {
      this._database.prepare('DELETE FROM products WHERE id = ?').run(id)

      //   this._database.prepare('UPDATE counts SET products = products - 1').run()
      // })

      // transaction()

      return {
        success: true,
        error: ''
      }
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        return {
          success: false,
          error: new Error('Something went wrong while updating the product')
        }
      }
      return {
        success: false,
        error: new Error('Something went wrong while updating the product')
      }
    }
  }
}
