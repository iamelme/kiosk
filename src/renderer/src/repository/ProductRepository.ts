import { IProductRepository } from '@renderer/interfaces/IProductRepository'
import { ProductType } from '@renderer/utils/types'
import { ipcMain } from 'electron'

export class ProductRepository implements IProductRepository {
  private _database

  constructor(database) {
    this._database = database
    ipcMain.handle('product:getAll', () => this.getAll())
    ipcMain.handle('product:getById', (_, id: number) => this.getById(id))
    ipcMain.handle('product:create', (_, params: Omit<ProductType, 'id'>) => this.create(params))
    ipcMain.handle('product:update', (_, params: ProductType) => this.update(params))
  }

  getAll(): Array<ProductType & { category_name: string }> {
    const row = this._database.prepare(
      'SELECT p.*, c.name as category_name FROM products AS p LEFT JOIN categories as C ON p.category_id = c.id'
    )
    console.log('row', row)
    return row.all()
  }

  getById(id: number): ProductType {
    return this._database.prepare('SELECT * FROM products WHERE id = ?').get(id)
  }

  create(params: Omit<ProductType, 'id'>): void {
    const { name, description, price, quantity, code, category_id } = params

    const normalizePrice = (price ?? 0) * 100

    console.log('params', params)
    const stmt = this._database.prepare(
      'INSERT INTO products (name, description, price, quantity, code, category_id) VALUES(?, ?, ?, ?, ?, ?)'
    )
    stmt.run(name, description, normalizePrice, quantity, code, category_id)
  }

  update(params: ProductType): void {
    const { id, name, description, price, quantity, code, category_id } = params
    console.log('params', params)

    const normalizePrice = (price ?? 0) * 100

    const stmt = this._database.prepare(
      'UPDATE products  SET name = ?,  description = ? ,  price = ?,  quantity = ?,  code = ?,  category_id = ? WHERE id = ?'
    )

    stmt.run(name, description, normalizePrice, quantity, code, category_id, id)
  }
}
