import { createDatabase, type CompatDatabase } from './sqlite-compat.js';

let db: CompatDatabase | null = null;

export async function getDatabase(): Promise<CompatDatabase> {
  if (db) return db;
  db = await createDatabase();
  db.pragma('foreign_keys = ON');
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Create an in-memory database for testing
 */
export async function createTestDatabase(): Promise<CompatDatabase> {
  const testDb = await createDatabase();
  testDb.pragma('foreign_keys = ON');
  return testDb;
}

/**
 * Reset the singleton (for testing)
 */
export function resetDatabase(): void {
  db = null;
}

/**
 * Set the singleton database (for testing)
 */
export function setDatabase(newDb: CompatDatabase): void {
  db = newDb;
}
