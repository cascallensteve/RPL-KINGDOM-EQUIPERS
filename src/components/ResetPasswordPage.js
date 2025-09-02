import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './AuthPages.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    token: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Get email from localStorage (set in forgot password step)
    const resetEmail = localStorage.getItem('reset_email');
    if (resetEmail) {
      setEmail(resetEmail);
    } else {
      // Redirect to forgot password if no email found
      navigate('/forgot-password');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.token.trim()) {
      setError('Please enter the reset code from your email');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    if (formData.new_password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.resetPassword({
        email: email,
        token: formData.token,
        new_password: formData.new_password
      });
      
      setSuccess(response.message || 'Password reset successfully!');
      
      // Clear stored email
      localStorage.removeItem('reset_email');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.detail || err.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForgotPassword = () => {
    localStorage.removeItem('reset_email');
    navigate('/forgot-password');
  };

  if (!email) {
    return <div className="page-container">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="logo">
          <h1>RPL System</h1>
          <p>Reset your password</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="reset-info">
            <p className="text-center mb-4">
              We've sent a reset code to <strong>{email}</strong>
            </p>
            <p className="text-center mb-4 text-muted">
              Enter the code from your email and create a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="token" className="form-label">Reset Code</label>
              <input
                type="text"
                id="token"
                name="token"
                className="form-control text-center"
                value={formData.token}
                onChange={handleChange}
                required
                placeholder="Enter reset code"
                style={{ fontSize: '18px', letterSpacing: '4px' }}
              />
              <small className="form-help">Enter the 6-digit code sent to your email</small>
            </div>

            <div className="form-group">
              <label htmlFor="new_password" className="form-label">New Password</label>
              <div className="password-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="new_password"
                  name="new_password"
                  className="form-control"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  placeholder="Enter new password"
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <small className="form-help">Password must be at least 6 characters long</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password" className="form-label">Confirm New Password</label>
              <div className="password-input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  name="confirm_password"
                  className="form-control"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-100"
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : 'Reset Password'}
            </button>
          </form>

          <div className="reset-actions">
            <button 
              type="button" 
              className="btn-secondary w-100"
              onClick={handleBackToForgotPassword}
            >
              Back to Forgot Password
            </button>
            
            <div className="link-text">
              Remember your password? <Link to="/login">Sign in here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
