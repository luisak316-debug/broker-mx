import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { BRAND_DOMAIN, PUBLIC_SITE_URL } from './config/brand';
import { router } from './routes';
import { adminRouter } from './routes/admin';
import { supervisorRouter } from './routes/supervisor';
import { errorHandler, notFound } from './middleware/errorHandler';
import { ADMIN_WEB_PATH } from './config/paths';

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
          PUBLIC_SITE_URL,
          `https://www.${BRAND_DOMAIN}`,
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
  app.use('/api/supervisor', supervisorRouter);

  if (env.isProd && distExists('frontend')) {
    const clientDist = path.join(repoRoot(), 'frontend', 'dist');
    const adminDist = path.join(repoRoot(), 'admin', 'dist');

    if (distExists('admin')) {
      app.use(ADMIN_WEB_PATH, express.static(adminDist, { index: false }));
      app.get(new RegExp(`^${ADMIN_WEB_PATH}(\\/.*)?$`), (_req, res) => {
        res.sendFile(path.join(adminDist, 'index.html'));
      });
    }

    app.use(express.static(clientDist, { index: false }));
    const adminEsc = ADMIN_WEB_PATH.replace(/\//g, '\\/');
    app.get(new RegExp(`^(?!\\/api|${adminEsc}|\\/uploads|\\/ws).*`), (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
