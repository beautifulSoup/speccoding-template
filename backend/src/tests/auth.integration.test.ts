import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Express } from 'express';
import type { CompatDatabase } from '../db/sqlite-compat.js';
import { createTestApp } from './setup.js';

let app: Express;
let db: CompatDatabase;

beforeEach(async () => {
  const ctx = await createTestApp();
  app = ctx.app;
  db = ctx.db;
});

/**
 * Helper: extract a named cookie value from set-cookie header
 */
function extractCookie(headers: any, name: string): string | undefined {
  const cookies = headers['set-cookie'];
  if (!cookies) return undefined;
  const arr = Array.isArray(cookies) ? cookies : [cookies];
  for (const c of arr) {
    const match = c.match(new RegExp(`${name}=([^;]+)`));
    if (match) return match[1];
  }
  return undefined;
}

/**
 * Helper: register + login and return tokens
 */
async function registerAndLogin(testApp: Express, email = 'user@example.com', password = 'Pass1234') {
  await request(testApp)
    .post('/api/auth/register')
    .send({ email, password });

  const loginRes = await request(testApp)
    .post('/api/auth/login')
    .send({ email, password });

  const accessToken = loginRes.body.access_token;
  const refreshToken = extractCookie(loginRes.headers, 'refresh_token');

  return { loginRes, accessToken, refreshToken };
}

// ============================================================
// Registration (Scenarios 1–4)
// ============================================================
describe('Registration', () => {
  it('spec scenario 1: new user registers successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newuser@example.com', password: 'Pass1234' });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBeDefined();
    expect(res.body.user.email).toBe('newuser@example.com');
    // Must NOT contain password or hash
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.password_hash).toBeUndefined();

    // Verify DB has bcrypt hash (never plaintext)
    const row = db.prepare('SELECT password_hash FROM users WHERE email = ?')
      .get('newuser@example.com') as any;
    expect(row.password_hash).toMatch(/^\$2[aby]?\$/); // bcrypt prefix
  });

  it('spec scenario 2: email already registered', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'Pass1234' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'Pass5678' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('email_already_registered');
  });

  it('spec scenario 3: invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'notanemail', password: 'Pass1234' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('invalid_email_format');
  });

  it('spec scenario 4: weak password (too short)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('weak_password');
  });

  it('spec scenario 4: weak password (no letters)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: '12345678' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('weak_password');
  });
});

// ============================================================
// Login (Scenarios 5–8)
// ============================================================
describe('Login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@example.com', password: 'Pass1234' });
  });

  it('spec scenario 5: valid credentials login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Pass1234' });

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(typeof res.body.access_token).toBe('string');
    expect(res.body.expires_in).toBe(900); // 15 minutes

    // Check refresh_token cookie
    const refreshCookie = extractCookie(res.headers, 'refresh_token');
    expect(refreshCookie).toBeDefined();

    // Check HttpOnly flag
    const cookies = res.headers['set-cookie'];
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    expect(cookieStr).toContain('HttpOnly');

    // Verify JWT payload contains required fields
    const decoded = jwt.decode(res.body.access_token) as any;
    expect(decoded.user_id).toBeDefined();
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    expect(decoded.jti).toBeDefined();
  });

  it('spec scenario 6: non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'Pass1234' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('invalid_credentials');
  });

  it('spec scenario 7: wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPass1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('invalid_credentials');
  });

  it('spec scenario 8: login rate limiting', async () => {
    // Make 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'WrongPass1' });
    }

    // The 6th attempt should be rate limited
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPass1' });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('too_many_attempts');
    expect(res.headers['retry-after']).toBeDefined();
  });
});

// ============================================================
// Token Refresh (Scenarios 9–11)
// ============================================================
describe('Token Refresh', () => {
  let refreshToken: string;

  beforeEach(async () => {
    const result = await registerAndLogin(app, 'refresh@example.com', 'Pass1234');
    refreshToken = result.refreshToken!;
  });

  it('spec scenario 9: valid refresh token', async () => {
    expect(refreshToken).toBeDefined();

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refresh_token=${refreshToken}`);

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.expires_in).toBe(900);
  });

  it('spec scenario 10: expired refresh token', async () => {
    const expiredToken = jwt.sign(
      { user_id: 1, jti: 'expired-jti' },
      process.env.JWT_SECRET!,
      { expiresIn: -10 }
    );

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refresh_token=${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('refresh_token_expired');
  });

  it('spec scenario 11: revoked refresh token', async () => {
    expect(refreshToken).toBeDefined();

    // Decode the refresh token to get jti
    const decoded = jwt.decode(refreshToken) as any;
    expect(decoded).not.toBeNull();

    // Add to blacklist directly in DB
    db.prepare('INSERT INTO refresh_token_blacklist (jti, expires_at) VALUES (?, ?)')
      .run(decoded.jti, new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString());

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refresh_token=${refreshToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('refresh_token_revoked');
  });
});

// ============================================================
// Authorization / Protected Routes (Scenarios 12–15)
// ============================================================
describe('Authorization', () => {
  let accessToken: string;

  beforeEach(async () => {
    const result = await registerAndLogin(app, 'auth@example.com', 'Pass1234');
    accessToken = result.accessToken;
  });

  it('spec scenario 12: valid access token accesses protected route', async () => {
    expect(accessToken).toBeDefined();

    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('auth@example.com');
  });

  it('spec scenario 13: no token on protected route', async () => {
    const res = await request(app)
      .get('/api/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('missing_token');
  });

  it('spec scenario 14: expired access token', async () => {
    const expiredToken = jwt.sign(
      { user_id: 1, jti: 'expired-access-jti' },
      process.env.JWT_SECRET!,
      { expiresIn: -10 }
    );

    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('token_expired');
  });

  it('spec scenario 15: tampered access token', async () => {
    expect(accessToken).toBeDefined();

    // Tamper with the token by changing characters
    const tamperedToken = accessToken.slice(0, -5) + 'XXXXX';

    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${tamperedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('invalid_token');
  });
});
