import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      // Check for hardcoded admin login
      if (formData.email === 'technoava@gmail.com' && formData.password === 'technova') {
        console.log('Admin login detected!');
        
        // Hardcoded admin user
        const adminUser = {
          id: 999,
          username: 'Techno Admin',
          email: 'technoava@gmail.com',
          userType: 'admin',
          is_email_verified: true,
          registered: true
        };
        
        console.log('Storing admin data:', adminUser);
        
        // Store admin data
        login('admin-token-999', adminUser);
        setSuccess('Admin login successful! Redirecting to admin dashboard...');
        
        console.log('Redirecting to admin dashboard...');
        
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 2000);
        return;
      }

      // Regular API login for other users
      const response = await authAPI.login(formData);
      
      if (response.token && response.user) {
        // Store user data
        login(response.token, response.user);
        setSuccess('Login successful! Redirecting...');
        
        // Redirect based on user type and email verification status
        if (response.user.userType === 'admin') {
          // Admin users go directly to admin dashboard
          setTimeout(() => {
            navigate('/admin-dashboard');
          }, 2000);
        } else {
          // Regular users check email verification
          if (response.user.is_email_verified) {
            // Email verified, go to payment page
            setTimeout(() => {
              navigate('/payment');
            }, 2000);
          } else {
            // Email not verified, go to verification page
            setTimeout(() => {
              navigate('/verify-email');
            }, 2000);
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
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
