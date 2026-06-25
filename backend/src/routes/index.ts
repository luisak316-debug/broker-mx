import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as market from '../controllers/market.controller';
import * as stocks from '../controllers/stocks.controller';
import * as forex from '../controllers/forex.controller';
import * as commodities from '../controllers/commodities.controller';
import * as portfolio from '../controllers/portfolio.controller';
import * as marketNews from '../controllers/marketNews.controller';
import * as auth from '../controllers/auth.controller';
import * as deposit from '../controllers/depositAccount.controller';

export const router = Router();

// Salud
router.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

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

// Autenticación (simulada)
router.post('/auth/send-otp', asyncHandler(auth.sendOtp));
router.post('/auth/verify-otp', asyncHandler(auth.verifyOtpCode));
router.post('/auth/login', asyncHandler(auth.login));
router.post('/auth/register', asyncHandler(auth.register));
