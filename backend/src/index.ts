import { createDatabase } from './db/sqlite-compat.js';
import { createApp } from './app.js';
import { runMigrations } from './db/migrate.js';

// Fail-fast: check JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

async function main() {
  // Initialize database (in-memory, WASM-based SQLite)
  const db = await createDatabase();
  db.pragma('foreign_keys = ON');

  // Run migrations
  console.log('Running database migrations...');
  runMigrations(db, 'up');

  // Create and start app
  const app = createApp({ db });
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down...');
    db.close();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down...');
    db.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
