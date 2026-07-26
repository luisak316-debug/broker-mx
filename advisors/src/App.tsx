import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AdvisorLayout } from './components/layout/AdvisorLayout';
import { PortalAtmosphere } from './components/portal/PortalAtmosphere';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { ContactsPage } from './pages/ContactsPage';

function ProtectedLayout() {
  const { staff, loading } = useAuth();
  if (loading) {
    return (
      <div className="portal-page grid min-h-screen place-items-center text-slate-500">
        <PortalAtmosphere />
        <span className="portal-shell">Cargando…</span>
      </div>
    );
  }
  if (!staff) return <Navigate to="/login" replace />;
  return <AdvisorLayout />;
}

export function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return (
    <AuthProvider>
      <BrowserRouter basename={base && base !== '/' ? base : undefined}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Home />} />
            <Route path="contactos" element={<ContactsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
