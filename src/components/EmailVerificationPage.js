import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './AuthPages.css';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
<<<<<<< HEAD

  useEffect(() => {
    // Get email from user context or localStorage
    const userEmail = user?.email || localStorage.getItem('temp_user_email');
    if (userEmail) {
      setEmail(userEmail);
=======
  const [autoSent, setAutoSent] = useState(false);

  useEffect(() => {
    // Prefer logged-in user's email; fallback to stored email
    const preferred = (user?.email || localStorage.getItem('temp_user_email') || '').trim().toLowerCase();
    if (preferred) {
      setEmail(preferred);
      try {
        // Keep storage in sync to avoid stale values from signup
        localStorage.setItem('temp_user_email', preferred);
      } catch (_) {}
>>>>>>> 5b3598e (Initial commit)
    } else {
      // Redirect to login if no email found
      navigate('/login');
    }
  }, [user, navigate]);

<<<<<<< HEAD
=======
  // Auto-send OTP once when email is known
  useEffect(() => {
    if (!email || autoSent) return;
    const send = async () => {
      setResendLoading(true);
      setError('');
      try {
        const response = await authAPI.resendVerificationOTP(email);
        setSuccess(response.message || 'Verification code sent. Please check your email.');
      } catch (err) {
        setError(err.detail || err.message || 'Failed to send verification code. Please try again.');
      } finally {
        setResendLoading(false);
        setAutoSent(true);
      }
    };
    send();
  }, [email, autoSent]);

>>>>>>> 5b3598e (Initial commit)
  const handleChange = (e) => {
    setOtp(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.verifyEmail({ otp, email });
      
      if (response.detail === "Email already verified.") {
        setSuccess('Email already verified! Redirecting to payment...');
        
        // Update user context if available
        if (user) {
          updateUser({ ...user, is_email_verified: true });
        }
        
        // Clear temporary email
        localStorage.removeItem('temp_user_email');
        
        // Redirect to payment page
        setTimeout(() => {
          navigate('/payment');
        }, 2000);
      } else {
        setSuccess('Email verified successfully! Redirecting to payment...');
        
        // Update user context if available
        if (user) {
          updateUser({ ...user, is_email_verified: true });
        }
        
        // Clear temporary email
        localStorage.removeItem('temp_user_email');
        
        // Redirect to payment page
        setTimeout(() => {
          navigate('/payment');
        }, 2000);
      }
    } catch (err) {
      setError(err.detail || err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.resendVerificationOTP(email);
      setSuccess(response.message || 'OTP resent! Please check your email.');
    } catch (err) {
      setError(err.detail || err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return <div className="page-container">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="logo">
          <h1>RPL System</h1>
          <p>Verify your email</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="verification-info">
            <p className="text-center mb-4">
              We've sent a verification code to <strong>{email}</strong>
            </p>
            <p className="text-center mb-4 text-muted">
              Please check your email and enter the 6-digit code below
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="otp" className="form-label">Verification Code</label>
              <input
                type="text"
                id="otp"
                name="otp"
                className="form-control text-center"
                value={otp}
                onChange={handleChange}
                required
                placeholder="Enter 6-digit code"
                maxLength="6"
                pattern="[0-9]{6}"
                style={{ fontSize: '24px', letterSpacing: '8px' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary w-100"
              disabled={loading || otp.length !== 6}
            >
              {loading ? <span className="loading"></span> : 'Verify Email'}
            </button>
          </form>

          <div className="verification-actions">
            <button 
              type="button" 
              className="btn-secondary w-100"
              onClick={handleResendOTP}
              disabled={resendLoading}
            >
              {resendLoading ? <span className="loading"></span> : 'Resend Code'}
            </button>
            
            <div className="link-text">
              <button 
                type="button" 
                className="btn-link"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
