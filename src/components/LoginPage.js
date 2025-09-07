import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';

const backgroundImageUrl = 'https://res.cloudinary.com/dqvsjtkqw/image/upload/v1757231830/group-four-gorgeous-african-american-womans-wear-summer-hat-holding-hands-praying-green-grass-park_zjrnze.webp'; // Replace with your preferred image URL

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  
  // Get the previous path or default to home
  const from = location.state?.from?.pathname || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Function to get dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  useEffect(() => {
    if (user) {
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
      const response = await authAPI.login(formData);
      
      if (response.token && response.user) {
        localStorage.setItem('rpl_token', response.token);
        localStorage.setItem('rpl_user', JSON.stringify(response.user));
        
        login(response.token, response.user);
        setSuccess('Login successful! Redirecting...');

        if (response.user.userType === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          if (!response.user.is_email_verified) {
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
    <div 
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-green-300 opacity-90"></div>

      <div className="relative w-full max-w-md z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(from)}
          className="absolute -top-16 left-0 flex items-center text-white hover:text-yellow-300 transition-colors group"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 mr-1 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>
        
        {/* Logo & Greeting Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-8">
            <img 
              src="/IMAGES/LOGO.png" 
              alt="Kingdom Equippers Logo" 
              className="h-40 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2 animate-fadeIn">
            {getGreeting()}, <span className="underline decoration-yellow-400 decoration-4">welcome back</span>!
          </h1>
          <p className="text-yellow-100 text-lg italic tracking-wide drop-shadow-lg">
            We're glad to see you here.
          </p>
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
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                  <div className="max-w-md w-full space-y-8 relative">
                    <button
                      onClick={() => navigate(from)}
                      className="absolute -top-10 left-0 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="Go back"
                    >
                      <ArrowLeft className="h-5 w-5 mr-1" />
                      <span>Back</span>
                    </button>
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  </div>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
              >
                Create one here
              </Link>
            </p>
          </div>
          
          {/* Admin Link */}
          <div className="text-center mt-4">
            <Link 
              to="/admin-signup" 
              className="text-red-600 hover:text-red-700 font-semibold text-sm transition-colors duration-200"
            >
              🛡️ Admin Registration
            </Link>
          </div>

          {/* Debug Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button 
                type="button" 
                onClick={() => {
                  console.log('=== AUTH DEBUG INFO ===');
                  console.log('localStorage rpl_token:', localStorage.getItem('rpl_token'));
                  console.log('localStorage rpl_user:', localStorage.getItem('rpl_user'));
                  console.log('Current pathname:', window.location.pathname);
                  console.log('======================');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200"
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
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Clear & Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
