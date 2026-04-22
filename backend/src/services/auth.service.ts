import type { UserRepository } from '../repositories/user.repository.js';
import type { BlacklistRepository } from '../repositories/blacklist.repository.js';
import * as password from '../utils/password.js';
import * as jwt from '../utils/jwt.js';
import { toPublicUser, type UserPublic } from '../models/user.model.js';
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  RefreshTokenExpiredError,
  RefreshTokenRevokedError,
} from '../errors/auth.errors.js';

export interface RegisterResult {
  user: UserPublic;
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RefreshResult {
  access_token: string;
  expires_in: number;
}

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private blacklistRepo: BlacklistRepository
  ) {}

  /**
   * Register a new user
   */
  async register(email: string, pwd: string): Promise<RegisterResult> {
    // Check if email already exists
    const existing = this.userRepo.findByEmail(email);
    if (existing) {
      throw new EmailAlreadyRegisteredError();
    }

    // Hash password and create user
    const passwordHash = await password.hash(pwd);
    const user = this.userRepo.create({ email, passwordHash });

    return { user: toPublicUser(user) };
  }

  /**
   * Login with email and password
   */
  async login(email: string, pwd: string): Promise<LoginResult> {
    // Find user by email
    const user = this.userRepo.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Verify password
    const valid = await password.verify(pwd, user.password_hash);
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    // Generate tokens
    const access_token = jwt.sign({ user_id: user.id }, 'access');
    const refresh_token = jwt.sign({ user_id: user.id }, 'refresh');

    return {
      access_token,
      refresh_token,
      expires_in: jwt.ACCESS_TTL,
    };
  }

  /**
   * Refresh an access token using a refresh token
   */
  refresh(refreshToken: string): RefreshResult {
    let payload: jwt.JwtPayload;

    try {
      payload = jwt.verify(refreshToken);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new RefreshTokenExpiredError();
      }
      throw new RefreshTokenExpiredError();
    }

    // Check if refresh token is blacklisted
    if (this.blacklistRepo.isBlacklisted(payload.jti)) {
      throw new RefreshTokenRevokedError();
    }

    // Issue new access token
    const access_token = jwt.sign({ user_id: payload.user_id }, 'access');

    return {
      access_token,
      expires_in: jwt.ACCESS_TTL,
    };
  }

  /**
   * Revoke a refresh token (add to blacklist)
   */
  revokeRefresh(jti: string, expiresAt: Date): void {
    this.blacklistRepo.add(jti, expiresAt);
  }
}
