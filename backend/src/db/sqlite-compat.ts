/**
 * SQLite compatibility layer using sql.js (WASM-based SQLite)
 * Provides a better-sqlite3-like synchronous API interface.
 */
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';

/**
 * Statement wrapper — mimics better-sqlite3's prepared statement API.
 */
class StatementWrapper {
  constructor(private db: SqlJsDatabase, private sql: string) {}

  get(... params: any[]): any {
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params);
    if (stmt.step()) {
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      const row: any = {};
      for (let i = 0; i < columns.length; i++) {
        row[columns[i]] = values[i];
      }
      stmt.free();
      return row;
    }
    stmt.free();
    return undefined;
  }

  all(... params: any[]): any[] {
    const results: any[] = [];
    const stmt = this.db.prepare(this.sql);
    stmt.bind(params);
    while (stmt.step()) {
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      const row: any = {};
      for (let i = 0; i < columns.length; i++) {
        row[columns[i]] = values[i];
      }
      results.push(row);
    }
    stmt.free();
    return results;
  }

  run(... params: any[]): { changes: number; lastInsertRowid: number } {
    this.db.run(this.sql, params);
    const changesStmt = this.db.prepare('SELECT changes() as c');
    changesStmt.step();
    const changes = changesStmt.get()[0] as number;
    changesStmt.free();

    const lastIdStmt = this.db.prepare('SELECT last_insert_rowid() as id');
    lastIdStmt.step();
    const lastInsertRowid = lastIdStmt.get()[0] as number;
    lastIdStmt.free();

    return { changes, lastInsertRowid };
  }
}

/**
 * Database wrapper — mimics better-sqlite3's Database class.
 */
export class CompatDatabase {
  public _db: SqlJsDatabase;

  constructor(db: SqlJsDatabase) {
    this._db = db;
  }

  prepare(sql: string): StatementWrapper {
    return new StatementWrapper(this._db, sql);
  }

  exec(sql: string): void {
    this._db.run(sql);
  }

  pragma(pragmaStr: string): void {
    this._db.run(`PRAGMA ${pragmaStr}`);
  }

  close(): void {
    this._db.close();
  }
}

/**
 * Initialize sql.js and create a database (in-memory or file-based is not supported on WASM,
 * so all databases are in-memory for cloud deployment).
 */
let sqlPromise: ReturnType<typeof initSqlJs> | null = null;

function getSql() {
  if (!sqlPromise) {
    sqlPromise = initSqlJs();
  }
  return sqlPromise;
}

/**
 * Create an in-memory database (async init, but returns sync-compatible wrapper).
 */
export async function createDatabase(): Promise<CompatDatabase> {
  const SQL = await getSql();
  const db = new SQL.Database();
  return new CompatDatabase(db);
}

/**
 * Export type alias for compatibility with existing code.
 */
export type Database = CompatDatabase;
