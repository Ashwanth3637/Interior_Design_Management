import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
            <div className="input-icon-wrapper" style={{ position: 'relative' }}>
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyInContent: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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

        {/* Quick Demo Credentials Helper */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
          <span style={{ fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '0.5rem' }}>
            🔑 Quick Click-to-Autofill Credentials:
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {[
              { role: 'Super Admin', email: 'superadmin@demo.com', pass: 'Password123!' },
              { role: 'Admin', email: 'trisha@gmail.com', pass: 'admin123' },
              { role: 'Designer (Haasly)', email: 'haasly@gmail.com', pass: 'emp123' },
              { role: 'Designer (Jacob)', email: 'jacob@gmail.com', pass: 'emp123' },
              { role: 'Site Engineer (Riyas)', email: 'riyas@gmail.com', pass: 'emp123' },
              { role: 'Site Engineer (Smandhana)', email: 'smandhana@gmail.com', pass: 'emp123' },
              { role: 'PM (Ashwanth)', email: 'ashwanth@gmail.com', pass: 'emp123' },
              { role: 'PM (Gaurav)', email: 'gaurav@gmail.com', pass: 'emp123' },
              { role: 'Sales Exec (Veeresh)', email: 'veeresh@gmail.com', pass: 'emp123' },
              { role: 'Accountant (Varshan)', email: 'varshan@gmail.com', pass: 'emp123' },
              { role: 'Client (Raju)', email: 'raju@gmail.com', pass: 'client123' }
            ].map((cred, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setEmail(cred.email);
                  setPassword(cred.pass);
                }}
                style={{
                  textAlign: 'left',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.4rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: '700', color: '#1e293b' }}>{cred.role}</div>
                <div style={{ color: '#2563eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cred.email}</div>
                <div style={{ color: '#64748b' }}>Pass: <code>{cred.pass}</code></div>
              </button>
            ))}
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


