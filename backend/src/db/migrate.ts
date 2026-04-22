import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createDatabase, type CompatDatabase } from './sqlite-compat.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseMigration(content: string): { up: string; down: string } {
  const parts = content.split('-- Down');
  const up = parts[0].replace('-- Up', '').trim();
  const down = (parts[1] || '').trim();
  return { up, down };
}

export function runMigrations(db: CompatDatabase, direction: 'up' | 'down' = 'up'): void {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  // Ensure migrations tracking table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  if (direction === 'up') {
    for (const file of files) {
      const applied = db.prepare('SELECT 1 FROM _migrations WHERE name = ?').get(file);
      if (applied) continue;

      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      const { up } = parseMigration(content);

      console.log(`  ▶ Applying migration: ${file}`);
      // Execute each statement separately (sql.js doesn't support multi-statement in run)
      const statements = up.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const stmt of statements) {
        db.exec(stmt);
      }
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
    }
    console.log('✅ All migrations applied.');
  } else {
    // Reverse order for down
    const reversedFiles = [...files].reverse();
    for (const file of reversedFiles) {
      const applied = db.prepare('SELECT 1 FROM _migrations WHERE name = ?').get(file);
      if (!applied) continue;

      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      const { down } = parseMigration(content);

      console.log(`  ◀ Reverting migration: ${file}`);
      const statements = down.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const stmt of statements) {
        db.exec(stmt);
      }
      db.prepare('DELETE FROM _migrations WHERE name = ?').run(file);
    }
    console.log('✅ All migrations reverted.');
  }
}

// CLI entry point
if (process.argv[1] && process.argv[1].includes('migrate')) {
  const direction = process.argv[2] === 'down' ? 'down' : 'up';

  console.log(`Running migrations (${direction})...`);
  const db = await createDatabase();
  db.pragma('foreign_keys = ON');
  runMigrations(db, direction);
  db.close();
}
