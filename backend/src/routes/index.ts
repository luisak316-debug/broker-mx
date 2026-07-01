import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { pingDatabase, type StorageMode } from '../lib/bootstrap';
import { isDatabaseEnabled } from '../lib/database';
import * as market from '../controllers/market.controller';
import * as stocks from '../controllers/stocks.controller';
import * as forex from '../controllers/forex.controller';
import * as commodities from '../controllers/commodities.controller';
import * as portfolio from '../controllers/portfolio.controller';
import * as marketNews from '../controllers/marketNews.controller';
import * as auth from '../controllers/auth.controller';
import * as deposit from '../controllers/depositAccount.controller';
import * as cashRequest from '../controllers/cashRequest.controller';
import * as profile from '../controllers/profile.controller';

export const router = Router();

let storageMode: StorageMode = isDatabaseEnabled() ? 'postgres' : 'legacy';

export function setStorageMode(mode: StorageMode): void {
  storageMode = mode;
}

// Salud
router.get('/health', async (_req, res) => {
  const dbOk = await pingDatabase();
  res.json({
    status: dbOk ? 'ok' : 'degraded',
    storage: storageMode,
    database: isDatabaseEnabled() ? (dbOk ? 'connected' : 'unreachable') : 'legacy-file',
    ts: new Date().toISOString(),
  });
});

// Noticias diarias (landing — 4 mercados + destacado)
router.get('/market-news', asyncHandler(marketNews.getMarketNews));

// Catálogo y mercado (compartido por los 4 módulos)
router.get('/instruments', asyncHandler(market.listInstruments));
router.get('/quotes', asyncHandler(market.getQuotes));
router.get('/quotes/:symbol', asyncHandler(market.getQuote));
router.get('/candles/:symbol', asyncHandler(market.getCandles));

// Módulo 1: Bolsa de Valores (Acciones)
router.get('/stocks/:symbol/dividends', asyncHandler(stocks.getDividends));

// Módulo 2: Materias Primas (Commodities)
router.get('/commodities/alerts', asyncHandler(commodities.volatilityAlerts));

// Módulo 3: Divisas (Forex)
router.get('/forex/convert', asyncHandler(forex.convert));

// Módulo 4: Cripto comparte /quotes y /candles (mercado 24/7)

// Trading simulado y portafolio (balances en MXN, historial de transacciones)
router.post('/orders', asyncHandler(portfolio.placeOrder));
router.get('/portfolio/:userId', asyncHandler(portfolio.getPortfolio));

// Cuenta de depósito asignada (vista del cliente: "Fondear cuenta")
router.get('/deposit-account/:clientId', asyncHandler(deposit.getDepositAccount));
router.post('/cash-requests/withdraw', asyncHandler(cashRequest.requestWithdrawal));

// Foto de perfil (captura en tiempo real desde la app del cliente)
router.post('/profile/:clientId/photo', asyncHandler(profile.uploadProfilePhoto));

// Autenticación (simulada)
router.post('/auth/send-otp', asyncHandler(auth.sendOtp));
router.post('/auth/verify-otp', asyncHandler(auth.verifyOtpCode));
router.post('/auth/login', asyncHandler(auth.login));
router.post('/auth/register', asyncHandler(auth.register));
router.post('/auth/recovery/send-otp', asyncHandler(auth.sendRecoveryOtp));
router.post('/auth/recovery/reset-password', asyncHandler(auth.resetPassword));
