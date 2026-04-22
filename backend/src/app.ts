import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CompatDatabase } from './db/sqlite-compat.js';
import { UserRepository } from './repositories/user.repository.js';
import { BlacklistRepository } from './repositories/blacklist.repository.js';
import { AuthService } from './services/auth.service.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { requireAuth } from './middleware/require-auth.js';
import { errorHandler } from './middleware/error-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AppDeps {
  db: CompatDatabase;
}

export function createApp(deps: AppDeps) {
  const app = express();

  // Body parsing
  app.use(express.json());
  app.use(cookieParser());

  // Serve frontend static files
  const frontendDir = path.resolve(__dirname, '../../frontend');
  app.use(express.static(frontendDir));

  // Repositories
  const userRepo = new UserRepository(deps.db);
  const blacklistRepo = new BlacklistRepository(deps.db);

  // Services
  const authService = new AuthService(userRepo, blacklistRepo);

  // Auth routes: /api/auth/register, /api/auth/login, /api/auth/refresh
  const authRouter = createAuthRouter(authService);
  app.use('/api/auth', authRouter);

  // Protected route: GET /api/me
  app.get('/api/me', requireAuth, (req, res, next) => {
    try {
      const user = userRepo.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ error: { code: 'user_not_found', message: 'User not found' } });
        return;
      }
      res.status(200).json({
        user: { id: user.id, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
