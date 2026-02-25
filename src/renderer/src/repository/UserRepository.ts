import { SqliteError } from 'better-sqlite3'
import { IUserRepository, ReturnType } from '../interfaces/IUserInterRepository'
import { UserType } from '../shared/utils/types'
import { ipcMain } from 'electron'
import argon2 from 'argon2'

export class UserRepository implements IUserRepository {
  private _database
  constructor(database) {
    this._database = database
    ipcMain.handle('user:create', (_, params: UserType) => this.create(params))
    ipcMain.handle('user:login', (_, params: UserType) => this.login(params))
  }

  async create(params: UserType): Promise<ReturnType> {
    const { user_name, password } = params
    const errorMessage = new Error('Something went wrong while creating a user.')
    try {
      const foundUser = this._database
        .prepare(
          `
        SELECT * FROM users
        WHERE user_name = ?
        `
        )
        .get(user_name)
      if (foundUser?.id) {
        return {
          data: null,
          error: new Error('User is already exists.')
        }
      }
      const hashedPassword = await argon2.hash(password)
      const user = this._database
        .prepare(
          `
            INSERT INTO users (user_name, password)
            VALUES(?, ?)
            `
        )
        .run(user_name, hashedPassword)
      if (user) {
        return {
          data: user,
          error: ''
        }
      }
      return {
        data: null,
        error: errorMessage
      }
    } catch (error) {
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
        error: new Error('Something went wrong while saving the user')
      }
    }
  }

  async login(params: UserType): Promise<ReturnType> {
    const { user_name, password } = params
    try {
      const foundUser = this._database
        .prepare(
          `
        SELECT * FROM users
        WHERE user_name = ?
        `
        )
        .get(user_name)

      console.log('found user', foundUser)

      if (foundUser) {
        if (await argon2.verify(foundUser.password, password)) {
          return {
            data: foundUser,
            error: ''
          }
        } else {
          return {
            data: null,
            error: new Error('User name or password is incorrect.')
          }
        }
      }

      return {
        data: null,
        error: new Error('Something went wrong while signing up.')
      }
    } catch (error) {
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
        error: new Error('Something went wrong while saving the user')
      }
    }
  }
}
