// Debug utilities for troubleshooting user authentication issues

export const debugUserData = () => {
  const token = localStorage.getItem('rpl_token');
  const user = localStorage.getItem('rpl_user');
  
  console.log('🔍 Debug User Data:');
  console.log('Token exists:', !!token);
  console.log('User data exists:', !!user);
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User ID:', userData.id);
      console.log('User Email:', userData.email);
      console.log('User Username:', userData.username);
      console.log('User Type:', userData.userType);
      console.log('Has Paid:', userData.has_paid);
      console.log('Referral Code:', userData.referral_code);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  // Check for any other user-related data in localStorage
  const allKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    allKeys.push(localStorage.key(i));
  }
  
  const userRelatedKeys = allKeys.filter(key => 
    key.includes('user') || 
    key.includes('payment') || 
    key.includes('referral') ||
    key.includes('rpl')
  );
  
  console.log('User-related localStorage keys:', userRelatedKeys);
  
  return {
    token: !!token,
    user: !!user,
    userData: user ? JSON.parse(user) : null,
    userRelatedKeys
  };
};

export const clearAllUserData = () => {
  console.log('🧹 Clearing all user data...');
  
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('user') || 
      key.includes('payment') || 
      key.includes('referral') ||
      key.includes('rpl') ||
      key.includes('temp')
    )) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log('Removing:', key);
    localStorage.removeItem(key);
  });
  
  console.log('🧹 Cleared', keysToRemove.length, 'items from localStorage');
  return keysToRemove.length;
};

// Debug payment information
export const debugPaymentInfo = () => {
  const user = localStorage.getItem('rpl_user');
  const userData = user ? JSON.parse(user) : null;
  
  console.log('💰 Payment Debug Info:');
  console.log('Current User:', {
    id: userData?.id,
    email: userData?.email,
    username: userData?.username,
    has_paid: userData?.has_paid
  });
  
  // Check for any payment-related data
  const paymentKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('payment')) {
      paymentKeys.push(key);
    }
  }
  
  console.log('Payment-related localStorage keys:', paymentKeys);
  
  paymentKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value);
  });
  
  return {
    user: userData,
    paymentKeys,
    paymentData: paymentKeys.reduce((acc, key) => {
      acc[key] = localStorage.getItem(key);
      return acc;
    }, {})
  };
};

// Test payment concept
export const testPaymentConcept = () => {
  const user = localStorage.getItem('rpl_user');
  const userData = user ? JSON.parse(user) : null;
  
  console.log('🧪 Testing Payment Concept:');
  console.log('================================');
  console.log('📱 Scenario: User A uses User B\'s phone number to pay');
  console.log('👤 Current logged-in user:', userData?.username);
  console.log('📧 User email:', userData?.email);
  console.log('🆔 User ID:', userData?.id);
  console.log('');
  console.log('✅ Expected behavior:');
  console.log('  - Payment should be credited to:', userData?.username);
  console.log('  - Admin should see details for:', userData?.username);
  console.log('  - Phone number can be used for multiple users');
  console.log('');
  console.log('🔍 To test: Use any phone number and check console logs during payment');
  
  return {
    currentUser: userData,
    concept: 'One phone number can pay for multiple users, payment always goes to logged-in user'
  };
};

// Test referral flow
export const testReferralFlow = () => {
  const user = localStorage.getItem('rpl_user');
  const userData = user ? JSON.parse(user) : null;
  
  console.log('🔗 Testing Referral Flow:');
  console.log('================================');
  console.log('👤 Current logged-in user:', userData?.username);
  console.log('📧 User email:', userData?.email);
  console.log('🆔 User ID:', userData?.id);
  console.log('💰 Has paid:', userData?.has_paid);
  console.log('🔗 Referred by:', userData?.referred_by);
  console.log('🎫 Referral code:', userData?.referral_code);
  console.log('');
  console.log('✅ Expected behavior for referred users:');
  console.log('  - Should be logged in as their own account');
  console.log('  - Should be prompted to pay (not skip payment)');
  console.log('  - Should see their own profile, not referrer\'s profile');
  console.log('');
  console.log('🔍 To test: Register a new user with referral code and check console logs');
  
  return {
    currentUser: userData,
    concept: 'Referred users should be logged in as themselves and prompted to pay'
  };
};

// Test payment persistence
export const testPaymentPersistence = () => {
  const user = localStorage.getItem('rpl_user');
  const userData = user ? JSON.parse(user) : null;
  
  console.log('💰 Testing Payment Persistence:');
  console.log('================================');
  console.log('👤 Current logged-in user:', userData?.username);
  console.log('📧 User email:', userData?.email);
  console.log('🆔 User ID:', userData?.id);
  console.log('💰 Has paid (from user data):', userData?.has_paid);
  
  // Check local storage
  const localKey = userData?.id ? `payment_completed_${userData.id}` : null;
  const localPaymentStatus = localKey ? localStorage.getItem(localKey) : null;
  console.log('💾 Local storage payment status:', localPaymentStatus);
  
  console.log('');
  console.log('✅ Expected behavior:');
  console.log('  - If has_paid = true: Should go directly to dashboard');
  console.log('  - If has_paid = false: Should go to payment page');
  console.log('  - Payment should be ONE-TIME only');
  console.log('  - After payment, should never be prompted again');
  console.log('');
  console.log('🔍 To test: Login with different users and check routing');
  
  return {
    currentUser: userData,
    localPaymentStatus,
    concept: 'Payment should be one-time only - no repeated prompts'
  };
};

// Make these available globally for debugging
if (typeof window !== 'undefined') {
  window.debugUserData = debugUserData;
  window.clearAllUserData = clearAllUserData;
  window.debugPaymentInfo = debugPaymentInfo;
  window.testPaymentConcept = testPaymentConcept;
  window.testReferralFlow = testReferralFlow;
  window.testPaymentPersistence = testPaymentPersistence;
}
