import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ClientAuthProvider, useClientAuth } from './auth/ClientAuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './pages/Landing';
import { Register } from './pages/Register';
import { LoginClient } from './pages/LoginClient';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Stocks } from './pages/Stocks';
import { Commodities } from './pages/Commodities';
import { Forex } from './pages/Forex';
import { Crypto } from './pages/Crypto';
import { Fund } from './pages/Fund';
import { Indexes } from './pages/Indexes';
import { Profile } from './pages/Profile';

function RequireClient({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useClientAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <LoginClient /> },
  { path: '/recuperar', element: <ForgotPassword /> },
  { path: '/registro', element: <Register /> },
  {
    path: '/app',
    element: (
      <RequireClient>
        <AppLayout />
      </RequireClient>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'acciones', element: <Stocks /> },
      { path: 'commodities', element: <Commodities /> },
      { path: 'forex', element: <Forex /> },
      { path: 'indices', element: <Indexes /> },
      { path: 'cripto', element: <Crypto /> },
      { path: 'fondear', element: <Fund /> },
      { path: 'perfil', element: <Profile /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function App() {
  return (
    <ClientAuthProvider>
      <RouterProvider router={router} />
    </ClientAuthProvider>
  );
}
