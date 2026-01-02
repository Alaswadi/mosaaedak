import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

// Admin pages
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import PaymentApprovals from './pages/PaymentApprovals';

// Customer pages
import CustomerDashboard from './pages/CustomerDashboard';
import TopUp from './pages/TopUp';
import BotConfig from './pages/BotConfig';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route wrapper
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/dashboard" : "/customer/dashboard"} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Admin Routes */}
      <Route path="/dashboard" element={<ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute requireAdmin><Users /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute requireAdmin><PaymentApprovals /></ProtectedRoute>} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/topup" element={<ProtectedRoute><TopUp /></ProtectedRoute>} />
      <Route path="/customer/bot-config" element={<ProtectedRoute><BotConfig /></ProtectedRoute>} />

      {/* Redirect root based on auth status */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
