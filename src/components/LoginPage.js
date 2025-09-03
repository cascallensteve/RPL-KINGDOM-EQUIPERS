import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in and redirect them
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting:', user);
      // Let ProtectedRoute handle the redirect instead of doing it here
      if (user.userType === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // API login for all users (including admin)
      const response = await authAPI.login(formData);
      
      if (response.token && response.user) {
        console.log('🔐 API Login Response:', response);
        console.log('🔐 User Type:', response.user.userType);
        console.log('🔐 Token:', response.token ? 'Token received' : 'No token');
        console.log('🔐 Token length:', response.token?.length || 0);
        console.log('🔐 Token preview:', response.token?.substring(0, 20) + '...');
        
        // Store token immediately to verify it's saved
        localStorage.setItem('rpl_token', response.token);
        localStorage.setItem('rpl_user', JSON.stringify(response.user));
        
        console.log('🔐 Stored token in localStorage:', localStorage.getItem('rpl_token') ? 'Success' : 'Failed');
        console.log('🔐 Stored user in localStorage:', localStorage.getItem('rpl_user') ? 'Success' : 'Failed');
        
        login(response.token, response.user);
        setSuccess('Login successful! Redirecting...');

        // Use React Router navigation
        if (response.user.userType === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          // Automatically redirect based on email verification
          if (!response.user.is_email_verified) {
            // Store email for verification page to use when sending OTP
            try {
              if (response.user.email) {
                localStorage.setItem('temp_user_email', response.user.email);
              }
            } catch (_) {}
            navigate('/verify-email', { replace: true });
          } else {
            navigate('/payment', { replace: true });
          }
        }
      }
    } catch (err) {
      setError(err.detail || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="logo">
          <h1>RPL System</h1>
          <p>Welcome back</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Forgot your password?</Link>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-100"
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : 'Sign In'}
            </button>
          </form>

          <div className="link-text">
            Don't have an account? <Link to="/signup">Create one here</Link>
          </div>
          
          <div className="admin-link">
            <Link to="/admin-signup" style={{ color: '#dc2626', fontWeight: '600' }}>
              🛡️ Admin Registration
            </Link>
          </div>

          {/* Debug Section */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={() => {
                console.log('=== AUTH DEBUG INFO ===');
                console.log('localStorage rpl_token:', localStorage.getItem('rpl_token'));
                console.log('localStorage rpl_user:', localStorage.getItem('rpl_user'));
                console.log('Current pathname:', window.location.pathname);
                console.log('======================');
              }}
              style={{ 
                background: '#007bff', 
                color: 'white',
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                marginRight: '10px'
              }}
            >
              Debug Auth State
            </button>

            <button 
              type="button" 
              onClick={() => {
                localStorage.clear();
                console.log('Cleared localStorage');
                window.location.reload();
              }}
              style={{ 
                background: '#dc3545', 
                color: 'white',
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
