import type { CompatDatabase } from '../db/sqlite-compat.js';
import type { User } from '../models/user.model.js';

export class UserRepository {
  constructor(private db: CompatDatabase) {}

  findById(id: number): User | null {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
    return row || null;
  }

  findByEmail(email: string): User | null {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
    return row || null;
  }

  create(data: { email: string; passwordHash: string }): User {
    // sql.js doesn't support RETURNING, so insert then query
    const result = this.db.prepare(
      `INSERT INTO users (email, password_hash) VALUES (?, ?)`
    ).run(data.email, data.passwordHash);

    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
    return row;
  }
}
