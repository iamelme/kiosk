import { ICategoryRepository } from '@renderer/interfaces/ICategoryRepository'
import { CategoryType } from '@renderer/utils/types'
import { ipcMain } from 'electron'

export class CategoryRepository implements ICategoryRepository {
  private _database

  constructor(database) {
    console.log('category', database)
    this._database = database
    // ipcRenderer.
    ipcMain.handle('category:getAll', () => this.getAll())
    ipcMain.handle('category:get', (_, id: number) => this.get(id))
    ipcMain.handle('category:create', (_, name: string) => this.create(name))
    ipcMain.handle('category:update', (_, { id, name }: { id: number; name: string }) =>
      this.update({ id, name })
    )
  }

  getAll(): CategoryType[] {
    console.log('getall top =====>')
    const row = this._database.prepare('SELECT * FROM categories')
    console.log('row ===>', row.all())
    return row.all()
    // return ipcMain.handle('category:getAll', () => row) as unknown as CategoryType[]
  }

  get(id: number): CategoryType {
    const category = this._database.prepare('SELECT * FROM categories WHERE id= ?').get(id)
    return category
  }

  create(name: string): void {
    const stmt = this._database.prepare('INSERT INTO categories (name) VALUES ( ?)')
    stmt.run(name)
  }

  update({ id, name }: { id: number; name: string }): void {
    console.log({ id, name })
    const stmt = this._database.prepare('UPDATE categories SET name = ? WHERE id = ?')
    stmt.run(name, id)
  }
}
