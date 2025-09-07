import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1920&q=80')"
           }}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/80 to-red-600/80"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">RPL System</h1>
          <p className="text-red-100 text-lg">Admin Registration</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                minLength="6"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                minLength="6"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Admin Account...
                </div>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-2 text-center">
            <p className="text-gray-600">
              Already have an admin account?{' '}
              <Link 
                to="/login" 
                className="text-red-600 hover:text-red-700 font-semibold transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
            <p className="text-gray-600">
              Need a regular account?{' '}
              <Link 
                to="/signup" 
                className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
              >
                Client Signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignupPage;
