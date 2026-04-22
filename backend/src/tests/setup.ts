import { createDatabase, type CompatDatabase } from '../db/sqlite-compat.js';
import { runMigrations } from '../db/migrate.js';
import { createApp } from '../app.js';
import type { Express } from 'express';

// Set JWT_SECRET for tests
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';

export async function createTestApp(): Promise<{ app: Express; db: CompatDatabase }> {
  const db = await createDatabase();
  db.pragma('foreign_keys = ON');

  // Run migrations on in-memory DB
  runMigrations(db, 'up');

  const app = createApp({ db });

  return { app, db };
}
