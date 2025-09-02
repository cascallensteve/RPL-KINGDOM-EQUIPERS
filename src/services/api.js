import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://kingdom-equippers-rpl.vercel.app';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rpl_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const authAPI = {
  // Sign up user
  signUp: async (userData) => {
    try {
      // Ensure age is sent as integer and format phone number
      const dataToSend = {
        ...userData,
        age: parseInt(userData.age, 10),
        phone_no: userData.phone_no // Keep original format as backend expects
      };
      
      const response = await api.post('/signUp', dataToSend);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin sign up
  adminSignUp: async (adminData) => {
    try {
      const response = await api.post('/admin-signUp', adminData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify email
  verifyEmail: async (verificationData) => {
    try {
      const response = await api.post('/verify-email', verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Forgot password - request reset code
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Reset password
  resetPassword: async (resetData) => {
    try {
      const response = await api.post('/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Resend verification OTP
  resendVerificationOTP: async (email) => {
    try {
      const response = await api.post('/resend-verification-otp', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Make payment
  makePayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/pay', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Admin API functions
export const adminAPI = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/all-users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user details
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/user-details/${userId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;
