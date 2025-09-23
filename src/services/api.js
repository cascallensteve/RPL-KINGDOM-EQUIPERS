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

// 🔹 Add token to requests if available
api.interceptors.request.use((config) => {
  let token = localStorage.getItem('rpl_token');
  const user = localStorage.getItem('rpl_user');
  const userData = user ? JSON.parse(user) : null;

  // Check if this is a public endpoint that should skip auth
  const publicEndpoints = ['/login', '/signUp', '/admin-signUp', '/super-admin-signUp', '/verify-email', '/forgot-password', '/reset-password', '/resend-verification-otp', '/newsletters/subscribe', '/newsletters/contact-us'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  // Clean token if it has quotes around it
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
    localStorage.setItem('rpl_token', token); // Save cleaned token
  }
  
  // Validate user data integrity
  if (userData && (!userData.id || !userData.email)) {
    console.warn('🔑 Invalid user data detected in API interceptor, clearing session');
    localStorage.removeItem('rpl_token');
    localStorage.removeItem('rpl_user');
    token = null;
  }
  
  console.log('🔑 API Request Interceptor:', { 
    url: config.url, 
    token: token ? `${token.substring(0, 20)}...` : 'No token',
    userType: userData?.userType,
    userId: userData?.id,
    hasAuthHeader: !!config.headers.Authorization,
    isPublicEndpoint
  });
  
  // Only add auth header for non-public endpoints
  if (!isPublicEndpoint && token) {
    // Prefer DRF Token scheme by default; preserve explicit prefixes if present
    const hasPrefix = token.startsWith('Bearer ') || token.startsWith('Token ');
    config.headers.Authorization = hasPrefix ? token : `Token ${token}`;
    console.log('✅ Authorization header added (scheme):', String(config.headers.Authorization).split(' ')[0]);
  } else if (isPublicEndpoint && config.headers.Authorization) {
    delete config.headers.Authorization;
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

console.log('🧪 Interceptors attached (after setup):', api.interceptors.request.handlers.length > 0);

// Helper to normalize API errors to proper Error instances
const throwApiError = (error, defaultMessage = 'Request failed') => {
  try {
    const data = error?.response?.data;
    if (data && typeof data === 'object') {
      const msg = data.detail || data.message || defaultMessage;
      const err = new Error(msg);
      Object.assign(err, data);
      throw err;
    }
    const msg = error?.message || String(data) || defaultMessage;
    throw new Error(msg);
  } catch (e) {
    // If something goes wrong while constructing error, rethrow a safe Error
    if (e instanceof Error) throw e;
    throw new Error(defaultMessage);
  }
};


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
      // Normalize age: if it's a range like "26-35", parseInt will give 26 which backend accepts
      const base = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        age: parseInt(userData.age, 10),
        gender: userData.gender,
        phone_no: userData.phone_no,
        county: userData.county,
        subcounty: userData.subcounty || null,
      };

      // Only include referrer_code if provided and non-empty (do NOT set user's own referral_code)
      const dataToSend = { ...base };
      if (userData.referralCode && String(userData.referralCode).trim().length > 0) {
        dataToSend.referrer_code = String(userData.referralCode).trim();
      }
      
      console.log('Sending signup data:', dataToSend);
      const response = await api.post('/signUp', dataToSend);
      return response.data;
    } catch (error) {
      const resp = error.response?.data;
      console.error('Signup error:', resp || error.message);
      // Prefer readable messages
      if (resp && typeof resp === 'object') {
        const fieldErrors = [];
        for (const [key, val] of Object.entries(resp)) {
          if (Array.isArray(val)) fieldErrors.push(`${key}: ${val.join(', ')}`);
          else if (typeof val === 'string') fieldErrors.push(`${key}: ${val}`);
        }
        const message = fieldErrors.length ? fieldErrors.join(' | ') : (resp.detail || 'Registration failed');
        const err = new Error(message);
        Object.assign(err, resp);
        throw err;
      }
      throwApiError(error, 'Registration failed');
    }
  },

  // Admin sign up
  adminSignUp: async (adminData) => {
    try {
      const response = await api.post('/admin-signUp', adminData);
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // Super Admin sign up
  superAdminSignUp: async (data) => {
    try {
      const response = await api.post('/super-admin-signUp', data);
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // Verify email
  verifyEmail: async (verificationData) => {
    try {
      const response = await api.post('/verify-email', verificationData);
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // Reset password
  resetPassword: async (resetData) => {
    try {
      const response = await api.post('/reset-password', resetData);
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // Resend verification OTP
  resendVerificationOTP: async (email) => {
    try {
      const response = await api.post('/resend-verification-otp', { email });
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },




  // Make payment
  makePayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/pay', paymentData);
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // Update payment status
  updatePaymentStatus: async (paymentData) => {
    try {
      const response = await api.post('/payments/update-status', paymentData);
      return response.data;
    } catch (error) {
      console.error('Payment status update error:', error);
      throwApiError(error);
    }
  },

  // Get user payment status
  getUserPaymentStatus: async (userId) => {
    try {
      const response = await api.get(`/payments/user/${userId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting user payment status:', error);
      throwApiError(error);
    }
  },

  // Check transaction status by CheckoutRequestID
  getTransactionStatus: async (checkoutRequestId) => {
    try {
      const attempts = [
        `/payments/transaction-status/${checkoutRequestId}/`,
        `/payments/transaction-status/${checkoutRequestId}`,
      ];
      let lastError = null;
      for (const url of attempts) {
        try {
          const response = await api.get(url);
          return response.data; // expected: { status: 'success'|'failed'|..., receipt, transaction_id, amount }
        } catch (err) {
          lastError = err;
          const status = err?.response?.status || 0;
          const retriable = [404, 405, 301, 302, 307, 308];
          if (!retriable.includes(status)) break;
        }
      }
      throwApiError(lastError || new Error('Failed to check transaction status'));
    } catch (error) {
      throwApiError(error);
    }
  },
};

// ================== CONTACT / INQUIRIES API ==================
export const contactAPI = {
  // Public: Send contact message
  sendContact: async ({ full_name, email, phone_number, subject, message }) => {
    try {
      const payload = { full_name, email, phone_number, subject, message };
      const response = await api.post('/newsletters/contact-us', payload);
      return response.data; // { message, contact }
    } catch (error) {
      throwApiError(error);
    }
  },

  // Admin/Superadmin: View all contacts
  getAllContacts: async () => {
    try {
      const response = await api.get('/newsletters/all-contacts');
      return response.data; // { message, contacts: [] }
    } catch (error) {
      throwApiError(error);
    }
  },

  // Admin: View contact details
  getContactDetails: async (contactId) => {
    try {
      const response = await api.get(`/newsletters/contact-details/${contactId}/`);
      return response.data; // { message, contact }
    } catch (error) {
      throwApiError(error);
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
      throwApiError(error);
    }
  },

  // Get user details
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/user-details/${userId}/`);
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  // Get all transactions (super-admin only)
  getAllTransactions: async () => {
    try {
      const response = await api.get('/payments/all-transactions');
      return response.data; // { message, transactions: [...] }
    } catch (error) {
      throwApiError(error);
    }
  },

  // Get transaction details by transaction_id (super-admin only)
  getTransactionDetails: async (transactionId) => {
    try {
      const response = await api.get(`/payments/transaction-details/${transactionId}/`);
      return response.data; // { message, transaction: {...} }
    } catch (error) {
      throwApiError(error);
    }
  },

  // Get rewards for a specific user (admin, super-admin, or owner)
  getUserRewards: async (userId) => {
    try {
      const response = await api.get(`/referrals/rewards/${userId}/`);
      return response.data; // { total_rewards, details }
    } catch (error) {
      throwApiError(error);
    }
  },

  // Get all referrals (admin or super-admin)
  getAllReferrals: async () => {
    try {
      const response = await api.get('/referrals/all-referrals');
      return response.data; // Array of referrals
    } catch (error) {
      throwApiError(error);
    }
  },

  // Get referrals for a specific user (admin, super-admin or owner)
  getUserReferrals: async (userId) => {
    try {
      const response = await api.get(`/referrals/my-referrals/${userId}/`);
      return response.data; // { message, referrals: [...] }
    } catch (error) {
      throwApiError(error);
    }
  },

  // Get referral details by id (admin, super-admin or owner)
  getReferralDetails: async (referralId) => {
    try {
      const response = await api.get(`/referrals/referral-details/${referralId}/`);
      return response.data; // { message, referral: {...} }
    } catch (error) {
      throwApiError(error);
    }
  },
};

// ================== NEWSLETTER API ==================
export const newsletterAPI = {
  // Public subscribe to newsletter
  subscribe: async (email) => {
    try {
      // Try multiple payload and URL variants for backend compatibility
      const attempts = [
        { url: '/newsletters/subscribe', payload: { email } },
        { url: '/newsletters/subscribe/', payload: { email } },
        { url: '/newsletters/subscribe', payload: { subscriber_email: email } },
        { url: '/newsletters/subscribe/', payload: { subscriber_email: email } },
      ];

      let lastError = null;
      for (const attempt of attempts) {
        try {
          const response = await api.post(attempt.url, attempt.payload);
          // Normalize success shape
          const msg = response?.data?.message || 'Subscribed successfully!';
          return { message: msg };
        } catch (err) {
          // If already subscribed, treat as success
          const data = err?.response?.data;
          const status = err?.response?.status;
          const text = typeof data === 'string' ? data : (data?.detail || data?.message || '');
          if (
            status === 200 ||
            (typeof text === 'string' && /already\s*subscrib(ed|er)/i.test(text)) ||
            (data && (data.already_subscribed || data.subscribed === true))
          ) {
            return { message: 'Already subscribed.' };
          }

          // Save error and continue to next variant on common path errors
          lastError = err;
          const retriableStatus = [404, 405, 308, 301, 302, 307];
          if (!retriableStatus.includes(status || 0)) {
            break; // do not continue if it's a validation or server error
          }
        }
      }

      // Surface backend validation details when present
      const resp = lastError?.response?.data;
      if (resp && typeof resp === 'object') {
        const msgs = [];
        for (const [k, v] of Object.entries(resp)) {
          if (Array.isArray(v)) msgs.push(`${k}: ${v.join(', ')}`);
          else if (typeof v === 'string') msgs.push(`${k}: ${v}`);
        }
        if (msgs.length) {
          const err = new Error(msgs.join(' | '));
          Object.assign(err, resp);
          throw err;
        }
      }
      throwApiError(lastError || new Error('Subscription failed'));
    } catch (error) {
      // Surface backend validation details when present
      const resp = error.response?.data;
      if (resp && typeof resp === 'object') {
        const msgs = [];
        for (const [k, v] of Object.entries(resp)) {
          if (Array.isArray(v)) msgs.push(`${k}: ${v.join(', ')}`);
          else if (typeof v === 'string') msgs.push(`${k}: ${v}`);
        }
        if (msgs.length) {
          const err = new Error(msgs.join(' | '));
          Object.assign(err, resp);
          throw err;
        }
      }
      throwApiError(error);
    }
  },

  // Admin: send newsletter to subscribers
  sendNewsletter: async ({ subject, body }) => {
    try {
      const attempts = [
        { url: '/newsletters/send-newsletter', payload: { subject, body } },
        { url: '/newsletters/send-newsletter/', payload: { subject, body } },
      ];
      let lastError = null;
      for (const a of attempts) {
        try {
          const response = await api.post(a.url, a.payload);
          return response.data; // { message }
        } catch (err) {
          lastError = err;
          const status = err?.response?.status || 0;
          const retriable = [404, 405, 301, 302, 307, 308];
          if (!retriable.includes(status)) break;
        }
      }
      console.error('Newsletter send failed. Last attempted URL:', lastError?.config?.url, 'Status:', lastError?.response?.status, 'Data:', lastError?.response?.data);
      throwApiError(lastError || new Error('Failed to send newsletter'));
    } catch (error) {
      throwApiError(error);
    }
  },

  // Admin: fetch all newsletters
  getAllNewsletters: async () => {
    try {
      const attempts = [
        { url: '/newsletters/all-newsletters' },
        { url: '/newsletters/all-newsletters/' },
      ];
      let lastError = null;
      for (const a of attempts) {
        try {
          const response = await api.get(a.url);
          return response.data; // { message, Newsletters: [...] }
        } catch (err) {
          lastError = err;
          const status = err?.response?.status || 0;
          const retriable = [404, 405, 301, 302, 307, 308];
          if (!retriable.includes(status)) break;
        }
      }
      console.error('Fetch all newsletters failed. Last attempted URL:', lastError?.config?.url, 'Status:', lastError?.response?.status, 'Data:', lastError?.response?.data);
      throwApiError(lastError || new Error('Failed to fetch newsletters'));
    } catch (error) {
      throwApiError(error);
    }
  },

  // Admin: fetch newsletter details
  getNewsletterDetail: async (newsletterId) => {
    try {
      const attempts = [
        `/newsletters/newsletter-detail/${newsletterId}/`,
        `/newsletters/newsletter-detail/${newsletterId}`,
      ];
      let lastError = null;
      for (const url of attempts) {
        try {
          const response = await api.get(url);
          return response.data; // { message, Newsletter }
        } catch (err) {
          lastError = err;
          const status = err?.response?.status || 0;
          const retriable = [404, 405, 301, 302, 307, 308];
          if (!retriable.includes(status)) break;
        }
      }
      console.error('Newsletter detail failed. Last attempted URL:', lastError?.config?.url, 'Status:', lastError?.response?.status, 'Data:', lastError?.response?.data);
      throwApiError(lastError || new Error('Failed to fetch newsletter details'));
    } catch (error) {
      throwApiError(error);
    }
  },

  // Admin: fetch newsletter subscribers list (endpoint variants supported)
  getSubscribers: async () => {
    try {
      // If an explicit path is provided via env, use it first.
      const explicitPath = process.env.REACT_APP_NEWSLETTER_SUBSCRIBERS_PATH;
      const attempts = [
        ...(explicitPath ? [{ url: explicitPath }] : []),
        { url: '/newsletters/all-subscribers' },
        { url: '/newsletters/all-subscribers/' },
        { url: '/newsletters/subscribers' },
        { url: '/newsletters/subscribers/' },
      ];

      let lastError = null;
      for (const attempt of attempts) {
        try {
          const response = await api.get(attempt.url);
          const data = response?.data;
          // Normalize possible shapes
          const list = Array.isArray(data)
            ? data
            : (Array.isArray(data?.subscribers) ? data.subscribers
              : (Array.isArray(data?.Subscribers) ? data.Subscribers
                : (Array.isArray(data?.results) ? data.results : null)));
          if (Array.isArray(list)) return { subscribers: list };
          // If server returns object per-subscriber under a key
          if (data && typeof data === 'object') {
            const firstArray = Object.values(data).find(v => Array.isArray(v));
            if (Array.isArray(firstArray)) return { subscribers: firstArray };
          }
          // Fallback: treat success with no array as empty list
          return { subscribers: [] };
        } catch (err) {
          lastError = err;
          const status = err?.response?.status || 0;
          const retriableStatus = [404, 405, 308, 301, 302, 307];
          if (!retriableStatus.includes(status)) break;
        }
      }

      // If all variants produced 404s, surface a graceful not-found signal
      const status = lastError?.response?.status || 0;
      if (status === 404) {
        console.warn('Newsletter subscribers endpoint not found (404). Tried variants:', attempts.map(a => a.url));
        return { subscribers: [], __notFound: true };
      }
      console.error('Failed to fetch subscribers. Last attempted URL:', lastError?.config?.url, 'Status:', status, 'Data:', lastError?.response?.data);
      throwApiError(lastError || new Error('Failed to fetch subscribers'));
    } catch (error) {
      throwApiError(error);
    }
  },
};

export default api;
