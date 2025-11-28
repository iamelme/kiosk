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

  create(name: string): { success: boolean; error: string } {
    const normalizeName = name?.trim()

    // const found = this._database
    //   .prepare('SELECT id, name FROM categories WHERE name LIKE ?')
    //   .get(`${normalizeName}%`)

    // console.log('found', found)
    // if (found && found.name.toLowerCase() === normalizeName.toLowerCase()) {
    //   return {
    //     success: false,
    //     error: 'Category already existed'
    //   }
    // }
    try {
      const result = this._database
        .prepare('INSERT INTO categories (name) VALUES ( ?) RETURNING *')
        .get(normalizeName)

      if (result) {
        return {
          success: true,
          error: ''
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`)
        console.log('error name', error.name)
        // console.log('error', error.code)
        if (error.name === 'SqliteError') {
          return {
            success: false,
            error: 'Constraint violation: Data already exists or is invalid.'
          }
        }
        // if (error.code === 'SQLITE_CONSTRAINT') {
        //   console.error('Constraint violation: Data already exists or is invalid.')
        //   return {
        //     success: false,
        //     error: 'Constraint violation: Data already exists or is invalid.'
        //   }
        // }
        return {
          success: false,
          error: error.message
        }
      }
      return {
        success: false,
        error: `${error}`
      }
    }

    return {
      success: false,
      error: "Something wen't wrong"
    }
  }

  update({ id, name }: { id: number; name: string }): { success: boolean; error: string } {
    console.log({ id, name })

    const normalizeName = name?.trim()

    const found = this._database.prepare('SELECT id FROM categories WHERE name = ?').get(name)

    console.log('found', found)
    if (found && found.id !== id) {
      return {
        success: false,
        error: 'Category already existed'
      }
    }

    try {
      const stmt = this._database.prepare('UPDATE categories SET name = ? WHERE id = ? RETURNING *')
      const updatedRow = stmt.get(normalizeName, id)
      console.log('updatedRow', updatedRow)
      console.log(`Rows changed: ${updatedRow.changes}`)

      if (updatedRow?.id) {
        return {
          success: true,
          error: ''
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`)
        console.log('error name', error.name)
        // console.log('error', error.code)
        if (error.name === 'SqliteError') {
          return {
            success: false,
            error: 'Constraint violation: Data already exists or is invalid.'
          }
        }
        // if (error.code === 'SQLITE_CONSTRAINT') {
        //   console.error('Constraint violation: Data already exists or is invalid.')
        //   return {
        //     success: false,
        //     error: 'Constraint violation: Data already exists or is invalid.'
        //   }
        // }
        return {
          success: false,
          error: error.message
        }
      }
      return {
        success: false,
        error: `${error}`
      }
    }
    return {
      success: false,
      error: "something wen't wrong"
    }
  }
}
