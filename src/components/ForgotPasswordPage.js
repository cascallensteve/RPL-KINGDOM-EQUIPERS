import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
           style={{
             backgroundImage: "url('https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1920&q=80')"
           }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/80 to-purple-600/80"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">RPL System</h1>
          <p className="text-purple-100 text-lg">Forgot your password?</p>
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

          {/* Info Section */}
          <div className="text-center mb-8">
            <p className="text-gray-700 mb-4">
              Enter your email address and we'll send you a password reset code.
            </p>
            <p className="text-gray-600 text-sm">
              The reset code will be valid for 15 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Reset Code...
                </div>
              ) : (
                'Send Reset Code'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Remember your password?{' '}
              <Link 
                to="/login" 
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;


