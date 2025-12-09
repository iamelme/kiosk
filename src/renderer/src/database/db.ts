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
            CREATE TABLE IF NOT EXISTS users(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME,
              user_name TEXT NOT NULL,
              password TEXT NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS categories(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT
            );

            CREATE TABLE IF NOT EXISTS products(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                sku TEXT UNIQUE NOT NULL,
                description TEXT NOT NULL,
                price INTEGER DEFAULT 0,
                code INTEGER UNIQUE DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                category_id INTEGER,
                FOREIGN KEY (category_id) REFERENCES categories(id)           
            );

            CREATE TABLE IF NOT EXISTS counts(
                products INTEGER DEFAULT 0,
                categories INTEGER DEFAULT 0
            );

            INSERT INTO counts (products, categories) 
            SELECT 0, 0
            WHERE NOT EXISTS (SELECT 1 FROM counts);

            CREATE TABLE IF NOT EXISTS inventory(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              quantity INTEGER DEFAULT 0,
              product_id INTEGER,
              FOREIGN KEY (product_id) REFERENCES products(id)
            );
            
            CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(product_id, name, sku, code);

            CREATE TRIGGER IF NOT EXISTS products_after_insert 
            AFTER INSERT ON products
            BEGIN

              INSERT INTO inventory (product_id) VALUES(NEW.id);
              UPDATE counts SET products = products + 1;

              INSERT INTO products_fts (product_id, name, sku, code) 
              VALUES(NEW.id, NEW.name, NEW.sku, NEW.code);
            END;

            CREATE TRIGGER IF NOT EXISTS products_after_update 
            AFTER UPDATE ON products
            BEGIN

              UPDATE products_fts 
              SET name = NEW.name, sku = NEW.sku, code = NEW.code
              WHERE product_id = OLD.id;
            END;

            CREATE TRIGGER IF NOT EXISTS products_after_delete
            AFTER DELETE ON products
            BEGIN

              UPDATE counts SET products = products - 1;
              
              DELETE FROM inventory 
              WHERE product_id = OLD.id;
              
              DELETE FROM products_fts
              WHERE product_id = OLD.id;
            END;

            `
    )

    console.log('database is created')
  }
}
