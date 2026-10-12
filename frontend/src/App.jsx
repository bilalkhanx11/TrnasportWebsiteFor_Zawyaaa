import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Public
import HomePage from './pages/public/HomePage';

// Auth
import LoginPage from './pages/dashboard/LoginPage';

// Dashboard
import DashboardLayout from './components/dashboard/DashboardLayout';
import OverviewPage from './pages/dashboard/OverviewPage';
import DriversPage from './pages/dashboard/DriversPage';
import FleetPage from './pages/dashboard/FleetPage';
import ClientsPage from './pages/dashboard/ClientsPage';
import TripsPage from './pages/dashboard/TripsPage';
import TripDetailPage from './pages/dashboard/TripDetailPage';
import TrackingPage from './pages/dashboard/TrackingPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import AuditPage from './pages/dashboard/AuditPage';

// Driver
import DriverTripPage from './pages/driver/DriverTripPage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Driver tracking link — no auth needed */}
      <Route path="/driver/trip/:token" element={<DriverTripPage />} />

      {/* Dashboard — protected */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<OverviewPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="fleet" element={<FleetPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/:id" element={<TripDetailPage />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="audit" element={<AuditPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', background: '#0B1F33', color: '#fff', fontSize: '13px' },
              success: { iconTheme: { primary: '#C7A45D', secondary: '#0B1F33' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              duration: 3000,
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
