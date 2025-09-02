import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.forgotPassword(email);
      
      setSuccess(response.message || 'Password reset code sent to your email!');
      
      // Store email for the next step
      localStorage.setItem('reset_email', email);
      
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        navigate('/reset-password');
      }, 2000);
    } catch (err) {
      setError(err.detail || err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="logo">
          <h1>RPL System</h1>
          <p>Forgot your password?</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="forgot-info">
            <p className="text-center mb-4">
              Enter your email address and we'll send you a password reset code.
            </p>
            <p className="text-center mb-4 text-muted">
              The reset code will be valid for 15 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary w-100"
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : 'Send Reset Code'}
            </button>
          </form>

          <div className="link-text">
            Remember your password? <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;


