import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'https://kingdom-equippers-rpl.vercel.app';

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🌐 Environment:', process.env.NODE_ENV);
console.log('🌐 Custom API URL:', process.env.REACT_APP_API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Test the interceptor immediately
console.log('🧪 Testing axios interceptor setup...');
console.log('🧪 Axios instance created:', !!api);
console.log('🧪 Interceptors attached:', api.interceptors.request.handlers.length > 0);

// 🔹 Add token to requests if available
api.interceptors.request.use((config) => {
  let token = localStorage.getItem('rpl_token');
  const user = localStorage.getItem('rpl_user');
  const userData = user ? JSON.parse(user) : null;
  
  // Clean token if it has quotes around it
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
    localStorage.setItem('rpl_token', token); // Save cleaned token
  }
  
  console.log('🔑 API Request Interceptor:', { 
    url: config.url, 
    token: token ? `${token.substring(0, 20)}...` : 'No token',
    userType: userData?.userType,
    hasAuthHeader: !!config.headers.Authorization
  });
  
 if (token) {
  // Always use Django/DRF style "Token <token>"
  if (!token.startsWith('Token ')) {
    config.headers.Authorization = `Token ${token}`;
  } else {
    config.headers.Authorization = token;
  }
  console.log('✅ Authorization header added:', config.headers.Authorization);
}

  
  // Ensure we have proper headers
  config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  config.headers['Accept'] = config.headers['Accept'] || 'application/json';
  
  // Log final config
  console.log('🔧 Final request config:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    hasAuth: !!config.headers.Authorization
  });
  
  return config;
});

// 🔹 Handle unverified / unauthorized users globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      // If token expired or missing → clear storage
      if (status === 401) {
        localStorage.removeItem('rpl_token');
        localStorage.removeItem('rpl_user');
        // Let the ProtectedRoute handle the redirect
      }

      // If user not verified → clear storage
      if (
        status === 403 ||
        (message && message.toLowerCase().includes('not verified'))
      ) {
        // Let the ProtectedRoute handle the redirect
      }
    }
    return Promise.reject(error);
  }
);

// ================== AUTH API ==================
export const authAPI = {
  // Sign up user
  signUp: async (userData) => {
    try {
      const dataToSend = {
        ...userData,
        age: parseInt(userData.age, 10),
        phone_no: userData.phone_no,
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

  // Forgot password
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

  // Update payment status
  updatePaymentStatus: async (paymentData) => {
    try {
      const response = await api.post('/payments/update-status', paymentData);
      return response.data;
    } catch (error) {
      console.error('Payment status update error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get user payment status
  getUserPaymentStatus: async (userId) => {
    try {
      const response = await api.get(`/payments/user/${userId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting user payment status:', error);
      throw error.response?.data || error.message;
    }
  },
};

// ================== ADMIN API ==================
export const adminAPI = {
  // Get all users
  getAllUsers: async () => {
    try {
      console.log('🚀 adminAPI.getAllUsers called');
      console.log('🔑 Current token:', localStorage.getItem('rpl_token') ? 'Exists' : 'Missing');
      console.log('🌐 API Base URL:', API_BASE_URL);
      console.log('🔗 Full URL:', `${API_BASE_URL}/all-users`);
      console.log('🧪 Using axios instance:', !!api);
      console.log('🧪 Axios instance has interceptors:', api.interceptors.request.handlers.length > 0);
      
      const response = await api.get('/all-users');
      console.log('✅ adminAPI response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ adminAPI error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
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
