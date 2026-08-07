import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, Shield, AlertCircle, Sparkles } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Client',
    phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    const res = await register(formData);
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
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
            <label htmlFor="name">Full Name</label>
            <div className="input-icon-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-icon-wrapper">
                <Phone className="input-icon" size={18} />
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="+91 9345262189"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">User Role</label>
              <div className="input-icon-wrapper">
                <Shield className="input-icon" size={18} />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Super Admin">👑 Super Admin</option>
                  <option value="Admin">🏢 Admin</option>
                  <option value="Project Manager">📋 Project Manager</option>
                  <option value="Designer">🎨 Interior Designer</option>
                  <option value="Site Engineer">👷 Site Engineer</option>
                  <option value="Accountant">💰 Accountant</option>
                  <option value="Sales Executive">🤝 Sales Executive</option>
                  <option value="Client">👤 Client (View Own Project)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary-gradient auth-submit-btn"
          >
            {submitting ? (
              <span className="btn-spinner">Registering...</span>
            ) : (
              <>
                <UserPlus size={18} /> Register Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
