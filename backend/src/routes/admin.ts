import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAuth, requireRole } from '../middleware/auth';
import * as auth from '../controllers/admin/auth.controller';
import * as clientsCtrl from '../controllers/admin/clients.controller';
import * as finance from '../controllers/admin/finance.controller';
import * as deposit from '../controllers/admin/depositAccount.controller';
import * as txns from '../controllers/admin/transactions.controller';
import * as audit from '../controllers/admin/audit.controller';
import * as metrics from '../controllers/admin/metrics.controller';

export const adminRouter = Router();

// --- Público ---
adminRouter.post('/auth/login', asyncHandler(auth.login));

// --- Protegido (requiere sesión de personal interno) ---
adminRouter.use(requireAuth);

adminRouter.get('/auth/me', asyncHandler(auth.me));
adminRouter.get('/metrics', asyncHandler(metrics.dashboardMetrics));

// Módulo 1: Gestión de clientes (CRM)
adminRouter.get('/clients', asyncHandler(clientsCtrl.listClientsHandler));
adminRouter.get('/clients/:id', asyncHandler(clientsCtrl.getClient));
adminRouter.patch(
  '/clients/:id/access',
  requireRole('ADMIN', 'COMPLIANCE'),
  asyncHandler(clientsCtrl.updateClientAccess),
);

// Módulo 2: Control de saldos y finanzas (edición crítica)
adminRouter.patch(
  '/clients/:id/balance',
  requireRole('ADVISOR', 'COMPLIANCE'),
  asyncHandler(finance.updateBalance),
);
adminRouter.post(
  '/clients/:id/funds',
  requireRole('ADVISOR', 'COMPLIANCE'),
  asyncHandler(finance.adjustFunds),
);
adminRouter.post(
  '/clients/:id/bonus',
  requireRole('ADVISOR', 'COMPLIANCE'),
  asyncHandler(finance.grantBonus),
);
adminRouter.post(
  '/clients/:id/commission',
  requireRole('ADVISOR', 'COMPLIANCE'),
  asyncHandler(finance.chargeCommission),
);

// Cuenta de depósito bancaria asignada por cliente
adminRouter.put(
  '/clients/:id/deposit-account',
  requireRole('ADVISOR', 'COMPLIANCE'),
  asyncHandler(deposit.updateDepositAccount),
);

// Módulo 3: Historial de transacciones y solicitudes de efectivo
adminRouter.get('/transactions', asyncHandler(txns.listTransactions));

// Módulo 4: Bitácora de auditoría (solo cumplimiento / admin)
adminRouter.get('/audit', requireRole('COMPLIANCE'), asyncHandler(audit.listAudit));
