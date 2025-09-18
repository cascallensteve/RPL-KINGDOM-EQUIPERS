import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import AdminSignupPage from './components/AdminSignupPage';
import EmailVerificationPage from './components/EmailVerificationPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import PaymentPage from './components/PaymentPage';
import Dashboard from './components/Dashboard';
import SimpleAdminDashboard from './admin/SimpleAdminDashboard';
import ContactPage from './components/ContactPage';
import AboutRPLPage from './components/AboutRPLPage';
import AdminExitPage from './components/AdminExitPage';
import SuperAdminSignupPage from './components/SuperAdminSignupPage';
import './App.css';

// Simple Protected Route Component with role support
const ProtectedRoute = ({ children, requireAdmin = false, allowedRoles = null }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute:', { 
    requireAdmin, 
    user: user ? { userType: user.userType, email: user.email } : null, 
    loading,
    pathname: window.location.pathname
  });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#28a745'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Role checks
  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    console.log('User role not allowed for this route, redirecting');
    return <Navigate to="/dashboard" replace />;
  }

  // Legacy admin enforcement
  if (requireAdmin && !['admin', 'super-admin'].includes(user.userType)) {
    console.log('Admin required but user is not admin/super-admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireAdmin && ['admin','super-admin'].includes(user.userType)) {
    console.log('User is admin but trying to access user dashboard, redirecting to admin');
    return <Navigate to="/admin-dashboard" replace />;
  }

  console.log('Access granted');
  return children;
};

// Payment Route Component that redirects if payment is already completed
const ProtectedPaymentRoute = ({ children }) => {
  const { user } = useAuth();
  const paymentCompleted = localStorage.getItem('payment_completed') === 'true' || user?.has_paid;

  if (paymentCompleted) {
    console.log('Payment already completed, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
          <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about-rpl" element={<AboutRPLPage />} />
            <Route path="/admin-exit" element={<AdminExitPage />} />
            <Route 
              path="/admin-signup" 
              element={
                <ProtectedRoute allowedRoles={['super-admin']}>
                  <AdminSignupPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/super-admin-signup" element={<SuperAdminSignupPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route 
              path="/payment" 
              element={
                <ProtectedPaymentRoute>
                  <PaymentPage />
                </ProtectedPaymentRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireAdmin={false}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <SimpleAdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          </div>
        </AuthProvider>
    </Router>
  );
}

export default App;
