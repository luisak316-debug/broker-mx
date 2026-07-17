import { createServer } from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { bootstrapDatabaseFast, bootstrapDatabaseSlow } from './lib/bootstrap';
import { setStorageMode } from './routes/index';
import { marketData } from './services/marketData.service';
import { attachPriceFeed } from './sockets/priceFeed';
import { smsStatusLabel } from './services/sms.service';
import { warmMarketNewsCache } from './services/marketNews.service';
import { ADMIN_WEB_PATH } from './config/paths';

async function main(): Promise<void> {
  const boot = await bootstrapDatabaseFast();
  setStorageMode(boot.mode);

  const app = createApp();
  const server = createServer(app);

  attachPriceFeed(server);
  marketData.start();
  warmMarketNewsCache();

  server.listen(env.port, () => {
    /* eslint-disable no-console */
    console.log(`\n  INVERMAX LATAM API`);
    console.log(`  ➜ REST:      http://localhost:${env.port}/api`);
    console.log(`  ➜ WebSocket: ws://localhost:${env.port}/ws/prices`);
    console.log(`  ➜ Moneda base: ${env.baseCurrency}`);
    console.log(`  ➜ SMS registro: ${smsStatusLabel()}`);
    console.log(
      `  ➜ Almacenamiento: ${boot.mode === 'postgres' ? 'PostgreSQL' : 'archivo local (legacy)'}`,
    );
    if (env.isProd) {
      console.log(`  ➜ Web clientes: http://localhost:${env.port}/`);
      console.log(`  ➜ Web admin:    http://localhost:${env.port}${ADMIN_WEB_PATH}/`);
    }
    console.log('');
  });

  bootstrapDatabaseSlow();

  function shutdown(): void {
    marketData.stop();
    server.close(() => process.exit(0));
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Error al iniciar la API:', err);
  process.exit(1);
});
