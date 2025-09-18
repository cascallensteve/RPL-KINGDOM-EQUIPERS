import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

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
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
             style={{
               backgroundImage: "url('https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1920&q=80')"
             }}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/80 to-indigo-600/80"></div>
        </div>
        <div className="relative z-10 text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1920&q=80')"
           }}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/80 to-indigo-600/80"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img
              src="/IMAGES/LOGO.png"
              alt="Kingdom Equippers Logo"
              className="h-32 w-auto object-contain"
            />
          </div>
          <p className="text-indigo-100 text-lg">Reset your password</p>
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

          {/* Reset Info */}
          <div className="text-center mb-8">
            <p className="text-gray-700 mb-4">
              We've sent a reset code to <strong className="text-indigo-600">{email}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              Enter the code from your email and create a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reset Code Field */}
            <div>
              <label htmlFor="token" className="block text-sm font-semibold text-gray-700 mb-2">
                Reset Code
              </label>
              <input
                type="text"
                id="token"
                name="token"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                value={formData.token}
                onChange={handleChange}
                required
                placeholder="000000"
              />
              <small className="text-gray-500 text-sm mt-1 block">Enter the 6-digit code sent to your email</small>
            </div>

            {/* New Password Field */}
            <div>
              <label htmlFor="new_password" className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="new_password"
                  name="new_password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  placeholder="Enter new password"
                  minLength="6"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <small className="text-gray-500 text-sm mt-1 block">Password must be at least 6 characters long</small>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  name="confirm_password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Actions */}
          <div className="mt-6 space-y-4">
            <button 
              type="button" 
              className="w-full bg-transparent border-2 border-indigo-500 text-indigo-600 font-semibold py-3 px-6 rounded-lg hover:bg-indigo-50 transition-all duration-200"
              onClick={handleBackToForgotPassword}
            >
              Back to Forgot Password
            </button>
            
            <div className="text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link 
                  to="/login" 
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
