import { IProductRepository } from '@renderer/interfaces/IProductRepository'
import { ProductType } from '@renderer/utils/types'
import { ipcMain } from 'electron'
import { SqliteError } from 'better-sqlite3'

export class ProductRepository implements IProductRepository {
  private _database

  constructor(database) {
    this._database = database
    ipcMain.handle('product:getAll', () => this.getAll())
    ipcMain.handle('product:getById', (_, id: number) => this.getById(id))
    ipcMain.handle('product:getByCode', (_, code: number) => this.getByCode(code))
    ipcMain.handle('product:getByName', (_, name: string) => this.getByName(name))
    ipcMain.handle('product:getBySku', (_, sku: string) => this.getBySku(sku))
    ipcMain.handle('product:create', (_, params: Omit<ProductType, 'id'>) => this.create(params))
    ipcMain.handle('product:update', (_, params: ProductType) => this.update(params))
    ipcMain.handle('product:delete', (_, id: number) => this.delete(id))
  }

  getAll(): Array<ProductType & { category_name: string }> {
    const row = this._database.prepare(
      'SELECT p.*, c.name as category_name FROM products AS p LEFT JOIN categories as C ON p.category_id = c.id'
    )
    console.log('row', row)
    return row.all()
  }

  getById(id: number): { data: ProductType | null; error: string } {
    return this._database.prepare('SELECT * FROM products WHERE id = ?').get(id)
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
          error: new Error("Something wen't wrong while searching the product")
        }
      }
      return {
        data: null,
        error: new Error("Something wen't wrong while searching the product")
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
          error: new Error("Something wen't wrong while searching the product")
        }
      }
      return {
        data: null,
        error: new Error("Something wen't wrong while searching the product")
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
          error: new Error("Something wen't wrong while searching the product")
        }
      }
      return {
        data: null,
        error: new Error("Something wen't wrong while searching the product")
      }
    }
  }

  create(params: Omit<ProductType, 'id'>): { data: ProductType | null; error: Error | string } {
    const { name, sku, description, price, quantity, code, category_id } = params

    const normalizePrice = (price ?? 0) * 100
    const normalizeSKU = sku?.trim()?.toLowerCase()?.replace(/ /g, '-')

    console.log('params', params)

    let product

    try {
      const transaction = this._database.transaction(() => {
        const stmt = this._database.prepare(
          'INSERT INTO products (name, sku, description, price, quantity, code, category_id) VALUES(?, ?, ?, ?, ?, ?, ?) RETURNING *'
        )
        product = stmt.run(
          name,
          normalizeSKU,
          description,
          normalizePrice,
          quantity,
          code,
          category_id
        )

        this._database.prepare('UPDATE counts SET products = products + 1').run()
      })
      transaction()

      if (product) {
        return {
          data: product,
          error: ''
        }
      }

      throw new Error('Error while creating a new product')
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
        error: new Error("Something wen't wrong while saving the product")
      }
    }
  }

  update(params: ProductType): { data: ProductType | null; error: Error | string } {
    const { id, name, sku, description, price, quantity, code, category_id } = params
    console.log('params', params)

    const normalizePrice = (price ?? 0) * 100
    const normalizeSKU = sku?.trim()?.toLowerCase()?.replace(/ /g, '-')

    try {
      const stmt = this._database.prepare(
        'UPDATE products  SET name = ?, sku = ?,  description = ? ,  price = ?,  quantity = ?,  code = ?,  category_id = ? WHERE id = ? RETURNING *'
      )

      const product = stmt.all(
        name,
        normalizeSKU,
        description,
        normalizePrice,
        quantity,
        code,
        category_id,
        id
      )

      console.log('product returning', product)

      if (product) {
        return {
          data: product,
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
          error: new Error("Something wen't wrong while updating the product")
        }
      }
      return {
        data: null,
        error: new Error("Something wen't wrong while updating the product")
      }
    }
  }

  delete(id: number): { success: boolean; error: Error | string } {
    try {
      const stmt = this._database.prepare('DELETE FROM products WHERE id = ?')

      stmt.run(id)

      return {
        success: true,
        error: ''
      }
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        return {
          success: false,
          error: new Error("Something wen't wrong while updating the product")
        }
      }
      return {
        success: false,
        error: new Error("Something wen't wrong while updating the product")
      }
    }
  }
}
