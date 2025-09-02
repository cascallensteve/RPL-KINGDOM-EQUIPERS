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
<<<<<<< HEAD
=======
  const [showPassword, setShowPassword] = useState(false);
>>>>>>> 5b3598e (Initial commit)

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
<<<<<<< HEAD
      // Check for hardcoded admin login
      if (formData.email === 'technoava@gmail.com' && formData.password === 'technova') {
        console.log('Admin login detected!');
        
        // Hardcoded admin user
=======
      // Hardcoded admin login
      if (formData.email === 'technoava@gmail.com' && formData.password === 'technova') {
>>>>>>> 5b3598e (Initial commit)
        const adminUser = {
          id: 999,
          username: 'Techno Admin',
          email: 'technoava@gmail.com',
          userType: 'admin',
          is_email_verified: true,
          registered: true
        };
        
<<<<<<< HEAD
        console.log('Storing admin data:', adminUser);
        
        // Store admin data
        login('admin-token-999', adminUser);
        setSuccess('Admin login successful! Redirecting to admin dashboard...');
        
        console.log('Redirecting to admin dashboard...');
        
=======
        login('admin-token-999', adminUser);
        setSuccess('Admin login successful! Redirecting to admin dashboard...');
        
>>>>>>> 5b3598e (Initial commit)
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 2000);
        return;
      }

<<<<<<< HEAD
      // Regular API login for other users
      const response = await authAPI.login(formData);
      
      if (response.token && response.user) {
        // Store user data
        login(response.token, response.user);
        setSuccess('Login successful! Redirecting...');
        
        // Redirect based on user type and email verification status
        if (response.user.userType === 'admin') {
          // Admin users go directly to admin dashboard
=======
      // Regular API login
      const response = await authAPI.login(formData);
      
      if (response.token && response.user) {
        login(response.token, response.user);
        setSuccess('Login successful! Redirecting...');

        if (response.user.userType === 'admin') {
>>>>>>> 5b3598e (Initial commit)
          setTimeout(() => {
            navigate('/admin-dashboard');
          }, 2000);
        } else {
<<<<<<< HEAD
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
=======
          // Automatically redirect based on email verification
          if (!response.user.is_email_verified) {
            // Store email for verification page to use when sending OTP
            try {
              if (response.user.email) {
                localStorage.setItem('temp_user_email', response.user.email);
              }
            } catch (_) {}
            setTimeout(() => {
              navigate('/verify-email');
            }, 2000);
          } else {
            setTimeout(() => {
              navigate('/payment');
            }, 2000);
>>>>>>> 5b3598e (Initial commit)
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 5b3598e (Initial commit)
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
