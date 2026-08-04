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

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-card">
          <ShieldAlert size={48} className="unauthorized-icon" />
          <h2>Access Denied</h2>
          <p>
            Your account role <strong>({user?.role})</strong> does not have permission to view this resource.
          </p>
          <p className="subtext">Required Role(s): {allowedRoles.join(', ')}</p>
          <a href="/dashboard" className="btn-primary-gradient" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
