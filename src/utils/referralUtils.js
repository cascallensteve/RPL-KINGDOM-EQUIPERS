// DEPRECATED: This module is no longer used. Referral codes are generated and managed by the backend.
// Do NOT import from this file. It remains only to avoid breaking imports during refactors.
// Please use `user.referral_code` from authenticated user data and backend referral endpoints.
//
// If you find usages of these helpers, replace them with backend-driven logic.
// You can safely delete this file once you confirm there are no imports.
// Generate a random referral code
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Get the current user's referral code or generate a new one
const getOrCreateReferralCode = () => {
  const storedCode = localStorage.getItem('userReferralCode');
  if (storedCode) return storedCode;
  
  const newCode = generateReferralCode();
  localStorage.setItem('userReferralCode', newCode);
  return newCode;
};

// Track a referral (to be called when a new user signs up with a referral code)
const trackReferral = (referralCode) => {
  try {
    // Get existing referrals or initialize empty array
    const referrals = JSON.parse(localStorage.getItem('referralTracking') || '[]');
    
    // Add new referral
    referrals.push({
      code: referralCode,
      timestamp: new Date().toISOString(),
      // You can add more data here if needed
    });
    
    // Save back to localStorage
    localStorage.setItem('referralTracking', JSON.stringify(referrals));
    
    // Also store that this user was referred (optional)
    localStorage.setItem('wasReferred', 'true');
    localStorage.setItem('referredBy', referralCode);
    
    return true;
  } catch (error) {
    console.error('Error tracking referral:', error);
    return false;
  }
};

// Get referral statistics
const getReferralStats = () => {
  try {
    const referrals = JSON.parse(localStorage.getItem('referralTracking') || '[]');
    const userCode = localStorage.getItem('userReferralCode');
    
    // Count how many times the current user's code was used
    const userReferrals = referrals.filter(ref => ref.code === userCode);
    
    return {
      totalReferrals: userReferrals.length,
      referralCode: userCode,
      referralLink: `${window.location.origin}/signup?ref=${userCode}`,
      referrals: userReferrals,
      wasReferred: localStorage.getItem('wasReferred') === 'true',
      referredBy: localStorage.getItem('referredBy') || null
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return {
      totalReferrals: 0,
      referralCode: '',
      referralLink: '',
      referrals: [],
      wasReferred: false,
      referredBy: null
    };
  }
};

export {
  generateReferralCode,
  getOrCreateReferralCode,
  trackReferral,
  getReferralStats
};
