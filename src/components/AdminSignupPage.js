import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './AdminSignupPage.css';

const AdminSignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Use admin signup endpoint
      const response = await authAPI.adminSignUp({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.token && response.user) {
        console.log('🔐 Admin Signup Response:', response);
        console.log('🔐 Admin User Type:', response.user.userType);
        console.log('🔐 Admin Token:', response.token ? 'Token received' : 'No token');
        
        // Check if email verification is required
        if (!response.user.is_email_verified) {
          setSuccess('Admin account created successfully! Please verify your email to access the admin dashboard.');
          
          // Store email for verification page
          localStorage.setItem('temp_user_email', response.user.email);
          
          // Redirect to email verification after a delay
          setTimeout(() => {
            navigate('/verify-email', { replace: true });
          }, 3000);
        } else {
          // Email already verified, store admin data and redirect to dashboard
          localStorage.setItem('rpl_token', response.token);
          localStorage.setItem('rpl_user', JSON.stringify(response.user));
          
          setSuccess('Admin account verified! Redirecting to admin dashboard...');
          
          // Redirect to admin dashboard after a short delay
          setTimeout(() => {
            navigate('/admin-dashboard', { replace: true });
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Admin signup error:', err);
      setError(err.detail || err.message || 'Admin signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container">
        <div className="logo">
          <h1>RPL System</h1>
          <p>Admin Registration</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Full Name</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

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
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Already have an admin account?{' '}
              <Link to="/login">Sign In</Link>
            </p>
            <p>
              Need a regular account?{' '}
              <Link to="/signup">Client Signup</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignupPage;
