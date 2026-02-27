import { ICategoryRepository, ReturnType } from '../interfaces/ICategoryRepository'
import { CategoryType } from '../shared/utils/types'
import { ipcMain } from 'electron'

export class CategoryRepository implements ICategoryRepository {
  private _database

  constructor(database) {
    this._database = database
    // ipcRenderer.
    ipcMain.handle('category:getAll', () => this.getAll())
    ipcMain.handle('category:getById', (_, id: number) => this.getById(id))
    ipcMain.handle('category:getByName', (_, name: string) => this.getByName(name))
    ipcMain.handle('category:create', (_, name: string) => this.create(name))
    ipcMain.handle('category:update', (_, { id, name }: { id: number; name: string }) =>
      this.update({ id, name })
    )
    ipcMain.handle('category:delete', (_, id: number) => this.delete(id))
  }

  getAll(): { data: CategoryType[] | null; error: Error | string } {
    try {
      const categories = this._database.prepare('SELECT * FROM categories').all()

      if (categories) {
        return {
          data: categories,
          error: ''
        }
      }

      return {
        data: null,
        error: new Error('Something went wrong while retrieving the products')
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while deleting the product')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while deleting the product')
      }
    }
  }

  getById(id: number): ReturnType {
    try {
      const category = this._database.prepare('SELECT * FROM categories WHERE id= ?').get(id)
      if (category) {
        return {
          data: category,
          error: ''
        }
      }

      return {
        data: null,
        error: new Error('Something went wrong while retrieving the products')
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while deleting the product')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while deleting the product')
      }
    }
  }

  getByName(name: string): ReturnType {
    try {
      const category = this._database
        .prepare('SELECT * FROM categories WHERE LOWER(name) = ?')
        .get(name)

      console.log('repo category', category)

      if (category) {
        return {
          data: category,
          error: ''
        }
      }

      return {
        data: null,
        error: new Error('Something went wrong while saving a category')
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: new Error('Something went wrong while saving a category')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while saving a category')
      }
    }
  }

  create(name: string): ReturnType {
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
      const category = this._database
        .prepare('INSERT INTO categories (name) VALUES ( ?) RETURNING *')
        .get(normalizeName)

      console.log('create category', category)

      if (category) {
        return {
          data: category,
          error: ''
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while saving a category')
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`)
        console.log('error name', error.name)
        if (error instanceof Error) {
          return {
            data: null,
            error: new Error('Something went wrong while saving a category.')
          }
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while saving a category')
      }
    }
  }

  update({ id, name }: { id: number; name: string }): ReturnType {
    console.log({ id, name })

    const normalizeName = name?.trim()

    // const found = this._database.prepare('SELECT id FROM categories WHERE name = ?').get(name)

    // console.log('found', found)
    // if (found && found.id !== id) {
    //   return {
    //     data: null,
    //     error: new Error('Category already existed')
    //   }
    // }

    try {
      const stmt = this._database.prepare('UPDATE categories SET name = ? WHERE id = ? RETURNING *')
      const updatedRow = stmt.get(normalizeName, id)
      console.log('updatedRow', updatedRow)
      console.log(`Rows changed: ${updatedRow.changes}`)

      if (updatedRow?.id) {
        return {
          data: updatedRow,
          error: ''
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while updating a category')
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`)
        console.log('error name', error.name)
        return {
          data: null,
          error: new Error('Something went wrong while updating the category.')
        }
      }
      return {
        data: null,
        error: new Error('Something went wrong while updating the category.')
      }
    }
  }

  delete(id: number): { success: boolean; error: Error | string } {
    try {
      const stmt = this._database.prepare('DELETE FROM categories WHERE id = ?')

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
          error: new Error('Something went wrong while deleting the product')
        }
      }
      return {
        success: false,
        error: new Error('Something went wrong while deleting the product')
      }
    }
  }
}
