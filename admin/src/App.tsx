import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ClientProfile } from './pages/ClientProfile';
import { Transactions } from './pages/Transactions';
import { AuditLog } from './pages/AuditLog';
import type { StaffRole } from './types';
import type { ReactNode } from 'react';

function RequireRole({ roles, children }: { roles: StaffRole[]; children: ReactNode }) {
  const { can } = useAuth();
  return can(...roles) ? <>{children}</> : <Navigate to="/" replace />;
}

export function App() {
  const adminBase = import.meta.env.BASE_URL.replace(/\/$/, '');
  return (
    <AuthProvider>
      <BrowserRouter basename={adminBase && adminBase !== '/' ? adminBase : undefined}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="clientes/:id" element={<ClientProfile />} />
            <Route path="transacciones" element={<Transactions />} />
            <Route
              path="auditoria"
              element={
                <RequireRole roles={['COMPLIANCE']}>
                  <AuditLog />
                </RequireRole>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
