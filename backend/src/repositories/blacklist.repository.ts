import type { CompatDatabase } from '../db/sqlite-compat.js';

export interface BlacklistEntry {
  jti: string;
  expires_at: string;
}

export class BlacklistRepository {
  constructor(private db: CompatDatabase) {}

  isBlacklisted(jti: string): boolean {
    const row = this.db.prepare(
      'SELECT 1 FROM refresh_token_blacklist WHERE jti = ?'
    ).get(jti);
    return !!row;
  }

  add(jti: string, expiresAt: Date): void {
    this.db.prepare(
      'INSERT OR IGNORE INTO refresh_token_blacklist (jti, expires_at) VALUES (?, ?)'
    ).run(jti, expiresAt.toISOString());
  }

  /**
   * Clean up expired entries (maintenance)
   */
  cleanExpired(): number {
    const result = this.db.prepare(
      "DELETE FROM refresh_token_blacklist WHERE expires_at < datetime('now')"
    ).run();
    return result.changes;
  }
}
