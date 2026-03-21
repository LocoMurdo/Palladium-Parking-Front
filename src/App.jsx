import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ParkingSessionsPage from './pages/ParkingSessionsPage';
import CreateParkingSessionPage from './pages/CreateParkingSessionPage';
import CashRegisterPage from './pages/CashRegisterPage';
import VehiclesPage from './pages/VehiclesPage';
import CreateVehiclePage from './pages/CreateVehiclePage';
import RatesPage from './pages/RatesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import UsersPage from './pages/UsersPage';
import CreateUserPage from './pages/CreateUserPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/parking-sessions"
            element={
              <ProtectedRoute>
                <ParkingSessionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-session"
            element={
              <ProtectedRoute>
                <CreateParkingSessionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cash-register"
            element={
              <ProtectedRoute>
                <CashRegisterPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <VehiclesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-vehicle"
            element={
              <ProtectedRoute>
                <CreateVehiclePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rates"
            element={
              <ProtectedRoute>
                <RatesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-user"
            element={
              <ProtectedRoute>
                <CreateUserPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
