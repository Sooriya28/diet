import 'dotenv/config';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import path from 'path';
import authRoutes from './backend/routes/authRoutes.ts';
import memberRoutes from './backend/routes/memberRoutes.ts';
import menuRoutes from './backend/routes/menuRoutes.ts';
import userRoutes from './backend/routes/userRoutes.ts';
import { initializeStorage } from './backend/services/jsonStorage.ts';

async function startServer(): Promise<void> {
  await initializeStorage();

  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      storage: 'local-json',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/menus', menuRoutes);
  app.use('/api/user', memberRoutes);

  // Unmatched API routes must return JSON 404
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Global error handler (no stack traces or sensitive internals exposed)
  app.use(
    (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({ error: 'Malformed JSON request body.' });
        return;
      }
      const message =
        err instanceof Error ? err.message : 'An unexpected server error occurred.';
      console.error('[Server Error]:', message);
      res.status(500).json({ error: message });
    }
  );

  // Frontend middleware / static serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Diet Card Management System listening on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
