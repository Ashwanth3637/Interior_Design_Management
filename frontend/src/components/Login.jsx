import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await login(email, password);

    setSubmitting(false);
    if (res.success) {
      const role = res.user?.role || '';
      if (['Super Admin', 'SUPER_ADMIN'].includes(role)) {
        navigate('/super-admin');
      } else if (['Admin', 'ADMIN'].includes(role)) {
        navigate('/admin');
      } else if (['Designer', 'INTERIOR_DESIGNER', 'Interior Designer'].includes(role)) {
        navigate('/designer-studio');
      } else if (['Site Engineer', 'SITE_ENGINEER'].includes(role)) {
        navigate('/site-engineer');
      } else if (['Project Manager', 'PROJECT_MANAGER'].includes(role)) {
        navigate('/pm-dashboard');
      } else if (['Accountant', 'ACCOUNTANT'].includes(role)) {
        navigate('/accountant');
      } else if (['Sales Executive', 'SALES_EXECUTIVE'].includes(role)) {
        navigate('/sales-executive');
      } else if (['Client', 'CLIENT', 'Customer'].includes(role)) {
        navigate('/client-portal');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            ← Back to Home
          </Link>
        </div>
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Interior Design Management Portal</p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.8rem' }}>
                Forgot password?
              </Link>
            </div>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary-gradient auth-submit-btn"
          >
            {submitting ? (
              <span className="btn-spinner">Logging in...</span>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Guide */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
          <span style={{ fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>💡 Quick Test Credentials:</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div>
              <strong>Super Admin:</strong> <code style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', color: '#2563eb' }}>admin@company.com</code> / <code style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>Admin123!</code>
            </div>
            <div>
              <strong>Accountant:</strong> <code style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', color: '#2563eb' }}>accountant@company.com</code> / <code style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>Admin123!</code>
            </div>
            <div>
              <strong>Client Portal:</strong> <code style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', color: '#2563eb' }}>jai@gmail.com</code> / <code style={{ backgroundColor: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>Client123!</code>
            </div>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


