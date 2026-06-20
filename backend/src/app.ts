import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { router } from './routes';
import { adminRouter } from './routes/admin';
import { errorHandler, notFound } from './middleware/errorHandler';

function repoRoot(): string {
  return path.resolve(__dirname, '..', '..');
}

function distExists(subdir: 'frontend' | 'admin'): boolean {
  const dir = path.join(repoRoot(), subdir, 'dist');
  return fs.existsSync(path.join(dir, 'index.html'));
}

export function createApp(): express.Express {
  const app = express();

  if (env.isProd) app.set('trust proxy', 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = new Set([
          ...env.corsOrigin,
          'https://localhost',
          'capacitor://localhost',
          'http://localhost',
        ]);
        if (!origin || allowed.has(origin)) callback(null, true);
        else if (origin.endsWith('.vercel.app')) callback(null, true);
        else callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '15mb' }));
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.use('/api', router);
  app.use('/api/admin', adminRouter);

  if (env.isProd && distExists('frontend')) {
    const clientDist = path.join(repoRoot(), 'frontend', 'dist');
    const adminDist = path.join(repoRoot(), 'admin', 'dist');

    if (distExists('admin')) {
      app.use('/admin', express.static(adminDist, { index: false }));
      app.get(/^\/admin(\/.*)?$/, (_req, res) => {
        res.sendFile(path.join(adminDist, 'index.html'));
      });
    }

    app.use(express.static(clientDist, { index: false }));
    app.get(/^(?!\/api|\/admin|\/uploads|\/ws).*/, (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
