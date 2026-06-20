import { createServer } from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { marketData } from './services/marketData.service';
import { attachPriceFeed } from './sockets/priceFeed';
import { smsStatusLabel } from './services/sms.service';
import { ADMIN_WEB_PATH } from './config/paths';

const app = createApp();
const server = createServer(app);

attachPriceFeed(server);
marketData.start();

server.listen(env.port, () => {
  /* eslint-disable no-console */
  console.log(`\n  broker.mx API`);
  console.log(`  ➜ REST:      http://localhost:${env.port}/api`);
  console.log(`  ➜ WebSocket: ws://localhost:${env.port}/ws/prices`);
  console.log(`  ➜ Moneda base: ${env.baseCurrency}`);
  console.log(`  ➜ SMS registro: ${smsStatusLabel()}`);
  if (env.isProd) {
    console.log(`  ➜ Web clientes: http://localhost:${env.port}/`);
    console.log(`  ➜ Web admin:    http://localhost:${env.port}${ADMIN_WEB_PATH}/`);
  }
  console.log('');
});

function shutdown(): void {
  marketData.stop();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
