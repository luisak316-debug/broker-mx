import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { SupervisorLayout } from './components/layout/SupervisorLayout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { ClientsPage } from './pages/ClientsPage';
import { AdvisorsPage } from './pages/AdvisorsPage';
import { AssignContactsPage } from './pages/AssignContactsPage';
import { HistoryPage } from './pages/HistoryPage';
import { CashRequestsPage } from './pages/CashRequestsPage';
import { PortalAtmosphere } from './components/portal/PortalAtmosphere';

function ProtectedLayout() {
  const { staff, loading } = useAuth();
  if (loading) {
    return (
      <div className="portal-page grid min-h-screen place-items-center text-emerald-200/60">
        <PortalAtmosphere />
        <span className="portal-shell">Cargando…</span>
      </div>
    );
  }
  if (!staff) return <Navigate to="/login" replace />;
  return <SupervisorLayout />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Home />} />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="solicitudes" element={<CashRequestsPage />} />
            <Route path="asesores" element={<AdvisorsPage />} />
            <Route path="asignar" element={<AssignContactsPage />} />
            <Route path="historial" element={<HistoryPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
