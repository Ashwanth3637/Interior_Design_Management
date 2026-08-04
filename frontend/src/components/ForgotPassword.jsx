import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Lock } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email Request, 2: New Password Form
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/forgotpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setSubmitting(false);

      if (response.ok) {
        setResetToken(data.resetToken);
        setStep(2);
        setMessage('Reset token generated! Enter your new password below.');
      } else {
        setError(data.message || 'Failed to request password reset.');
      }
    } catch (err) {
      setSubmitting(false);
      setError('Server connection error. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:5001/api/auth/resetpassword/${resetToken}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      const data = await response.json();
      setSubmitting(false);

      if (response.ok) {
        setStep(3); // Success Screen
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setSubmitting(false);
      setError('Server connection error. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password?</h1>
          <p>Reset your account access credentials</p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="panel-status success" style={{ marginBottom: '1.25rem' }}>
            <CheckCircle2 size={16} /> {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestToken} className="auth-form">
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

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-gradient auth-submit-btn"
            >
              {submitting ? 'Generating Token...' : 'Get Password Reset Token'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-icon-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="newPassword"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-gradient auth-submit-btn"
            >
              {submitting ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Password Reset Complete!</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your password has been updated securely. You can now sign in with your new password.
            </p>
            <Link to="/login" className="btn-primary-gradient" style={{ textDecoration: 'none' }}>
              Go to Sign In
            </Link>
          </div>
        )}

        {step !== 3 && (
          <div className="auth-footer">
            <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
