import { join } from 'path'
import Database from 'better-sqlite3'
// import { type Database as DatabaseType, Database } from 'better-sqlite3'
import { app } from 'electron'

// const dbPath =
//   process.env.NODE_ENV === 'development'
//     ? './demo_table.db'
//     : join(process.resourcesPath, './demo_table.db')

// export const db = new Database(dbPath)
// db.pragma('journal_mode = WAL')

export class AppDatabase {
  private db

  constructor() {
    const dbPath = join(app.getPath('userData'), 'kiosk.sqlite')
    console.log('dbpath', dbPath)

    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.setUp()
  }

  setUp(): void {
    this.db.exec(
      `
            CREATE TABLE IF NOT EXISTS categories(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT
            );

            CREATE TABLE IF NOT EXISTS products(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT NOT NULL,
                price INTEGER DEFAULT 0,
                quantity INTEGER DEFAULT 0,
                code INTEGER UNIQUE DEFAULT 0,
                category_id INTEGER,
                FOREIGN KEY (category_id) REFERENCES categories(id)           
            );
            `
    )

    console.log('database is created')
  }
}
