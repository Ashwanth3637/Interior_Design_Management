import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import EmployeeManagement from './components/EmployeeManagement';
import ProjectManagement from './components/ProjectManagement';
import ClientManagement from './components/ClientManagement';
import DesignerStudio from './components/DesignerStudio';
import ClientPortal from './components/ClientPortal';
import SiteEngineerDashboard from './components/SiteEngineerDashboard';
import ProjectManagerDashboard from './components/ProjectManagerDashboard';
import AccountantDashboard from './components/AccountantDashboard';
import SalesExecutiveDashboard from './components/SalesExecutiveDashboard';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN']}>
                <EmployeeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/designer-studio"
            element={
              <ProtectedRoute allowedRoles={['Designer', 'INTERIOR_DESIGNER', 'Interior Designer', 'Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN']}>
                <DesignerStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN']}>
                <ClientManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-executive"
            element={
              <ProtectedRoute allowedRoles={['SALES_EXECUTIVE', 'Sales Executive', 'Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN']}>
                <SalesExecutiveDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accountant"
            element={
              <ProtectedRoute allowedRoles={['ACCOUNTANT', 'Accountant', 'Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN']}>
                <AccountantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pm-dashboard"
            element={
              <ProtectedRoute allowedRoles={['PROJECT_MANAGER', 'Project Manager', 'Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN']}>
                <ProjectManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/site-engineer"
            element={
              <ProtectedRoute allowedRoles={['SITE_ENGINEER', 'Site Engineer', 'Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN']}>
                <SiteEngineerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-portal"
            element={
              <ProtectedRoute>
                <ClientPortal />
              </ProtectedRoute>
            }
          />

          {/* Role Protected Test Routes */}
          <Route
            path="/admin-only"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <div style={{ padding: '3rem', color: '#fff' }}>
                  <h1>👑 Admin Protected Area</h1>
                  <p>Only users with the 'Admin' role can view this route.</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
