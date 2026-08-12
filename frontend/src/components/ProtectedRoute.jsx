import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="auth-loading-spinner">
        <div className="spinner"></div>
        <p>Verifying authentication credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user?.role || '').toUpperCase();
  const isSuperAdmin = userRole.includes('SUPER_ADMIN') || userRole === 'SUPER ADMIN';
  const isAdmin = userRole === 'ADMIN' || userRole === 'ADMINISTRATOR';

  if (allowedRoles.length > 0 && !isAdmin && !allowedRoles.includes(user?.role)) {
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-card">
          <ShieldAlert size={48} className="unauthorized-icon" />
          <h2>Access Restricted</h2>
          <p>
            {isSuperAdmin
              ? `Super Admin permissions are restricted strictly to Employee Management (/employees) and View-Only Projects (/projects). Operational role dashboards are reserved for Admins and operational staff.`
              : `Your account role (${user?.role}) does not have permission to view this resource.`}
          </p>
          <a
            href={isSuperAdmin ? "/super-admin" : "/dashboard"}
            className="btn-primary-gradient"
            style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}
          >
            {isSuperAdmin ? "Return to Super Admin Console" : "Return to Dashboard"}
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
