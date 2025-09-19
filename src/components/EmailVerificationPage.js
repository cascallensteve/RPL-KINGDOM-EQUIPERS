import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [autoSent, setAutoSent] = useState(false);

  useEffect(() => {
    // Prefer logged-in user's email; fallback to stored email
    // Prefer the email captured during signup to avoid using inviter's email if they are logged in
    const preferred = (localStorage.getItem('temp_user_email') || user?.email || '').trim().toLowerCase();
    if (preferred) {
      setEmail(preferred);
      try {
        // Keep storage in sync to avoid stale values from signup
        localStorage.setItem('temp_user_email', preferred);
      } catch (_) {}
    } else {
      // Redirect to login if no email found
      navigate('/login');
    }
  }, [user, navigate]);

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
      
      // Check if this is an admin user
      const storedUser = localStorage.getItem('rpl_user');
      const isAdmin = storedUser ? JSON.parse(storedUser).userType === 'admin' : false;
      
      if (response.detail === "Email already verified.") {
        if (isAdmin) {
          setSuccess('Admin email already verified! Redirecting to admin dashboard...');
          setTimeout(() => {
            navigate('/admin-dashboard');
          }, 2000);
        } else {
          setSuccess('Email already verified! Redirecting to payment...');
          setTimeout(() => {
            navigate('/payment');
          }, 2000);
        }
      } else {
        if (isAdmin) {
          setSuccess('Admin email verified successfully! Redirecting to admin dashboard...');
          setTimeout(() => {
            navigate('/admin-dashboard');
          }, 2000);
        } else {
          setSuccess('Email verified successfully! Redirecting to payment...');
          setTimeout(() => {
            navigate('/payment');
          }, 2000);
        }
      }
      
      // Update user context if available
      if (user) {
        updateUser({ ...user, is_email_verified: true });
      }
      
      // Clear temporary email
      localStorage.removeItem('temp_user_email');
      
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
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
             style={{
               backgroundImage: "url('https://res.cloudinary.com/dqvsjtkqw/image/upload/v1757230094/top-view-patients-standing-circle-holding-hands_xy4dcg.webp')"
             }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 to-blue-600/80"></div>
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
             backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80')"
           }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 to-blue-600/80"></div>
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
          <p className="text-blue-100 text-lg">Verify your email</p>
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

          {/* Verification Info */}
          <div className="text-center mb-8">
            <p className="text-gray-700 mb-4">
              We've sent a verification code to <strong className="text-blue-600">{email}</strong>
            </p>
            <p className="text-gray-600 text-sm">
              Please check your email and enter the 6-digit code below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest"
                value={otp}
                onChange={handleChange}
                required
                placeholder="000000"
                maxLength="6"
                pattern="[0-9]{6}"
              />
            </div>

            {/* Verify Button */}
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Actions */}
          <div className="mt-6 space-y-4">
            <button 
              type="button" 
              className="w-full bg-transparent border-2 border-blue-500 text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleResendOTP}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Resend Code'
              )}
            </button>
            
            <div className="text-center">
              <button 
                type="button" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
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
