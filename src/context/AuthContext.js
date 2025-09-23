import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync payment status from server and cache locally
  const syncPaymentStatus = async (u) => {
    try {
      const uid = u?.id;
      if (!uid) return;
      const resp = await authAPI.getUserPaymentStatus(uid);
      const paid = !!resp?.has_paid;
      console.log('🔄 Syncing payment status for user:', uid, 'Server says paid:', paid);
      
      if (paid) {
        try { 
          localStorage.setItem(`payment_completed_${uid}`, 'true'); 
          console.log('✅ Payment status cached locally for user:', uid);
        } catch (_) {}
        const merged = { ...u, has_paid: true };
        setUser(merged);
        localStorage.setItem('rpl_user', JSON.stringify(merged));
        console.log('✅ User object updated with payment status:', merged);
      } else {
        // If server says not paid, clear local cache
        try { 
          localStorage.removeItem(`payment_completed_${uid}`); 
          console.log('❌ Payment status cleared locally for user:', uid);
        } catch (_) {}
      }
    } catch (e) {
      console.warn('Payment status sync failed:', e?.message || e);
      // Non-fatal; keep current state
    }
  };

  useEffect(() => {
    // Check for existing token and user data in localStorage
    const savedToken = localStorage.getItem('rpl_token');
    const savedUser = localStorage.getItem('rpl_user');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        
        // Validate user data before setting
        if (userData && userData.id && userData.email) {
          console.log('🔐 Loading user from localStorage:', { 
            id: userData.id, 
            email: userData.email, 
            username: userData.username,
            has_paid: userData.has_paid
          });
          setToken(savedToken);
          setUser(userData);
          // If backend persisted paid state, cache it locally immediately
          try {
            if (userData?.has_paid === true && userData?.id) {
              localStorage.setItem(`payment_completed_${userData.id}`, 'true');
              console.log('✅ Payment status restored from localStorage for user:', userData.id);
            }
          } catch (_) {}
          // Ensure local payment flag reflects server truth (best-effort)
          syncPaymentStatus(userData);
        } else {
          console.warn('🔐 Invalid user data in localStorage, clearing session');
          localStorage.removeItem('rpl_token');
          localStorage.removeItem('rpl_user');
        }
      } catch (error) {
        console.error('🔐 Error parsing user data from localStorage:', error);
        localStorage.removeItem('rpl_token');
        localStorage.removeItem('rpl_user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (authToken, userData) => {
    console.log('🔐 Login called with:', { authToken, userData });
    console.log('🔐 Previous user state:', user);
    console.log('🔐 Previous token state:', token);
    
    // Clear any previous session data to prevent user leakage across accounts
    try {
      // Clear all authentication-related localStorage items
      localStorage.removeItem('rpl_token');
      localStorage.removeItem('rpl_user');
      localStorage.removeItem('temp_user_email');
      
      // Clear any referral tracking data
      localStorage.removeItem('referralTracking');
      localStorage.removeItem('wasReferred');
      localStorage.removeItem('referredBy');
      localStorage.removeItem('userReferralCode');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }

    // Validate userData before setting
    if (!userData || !userData.id) {
      console.error('Invalid userData provided to login:', userData);
      throw new Error('Invalid user data provided');
    }

    console.log('🔐 Setting user data in AuthContext:', {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      userType: userData.userType,
      has_paid: userData.has_paid
    });

    setUser(userData);
    setToken(authToken);
    localStorage.setItem('rpl_token', authToken);
    localStorage.setItem('rpl_user', JSON.stringify(userData));
    // If backend says user has paid, set local flag immediately
    try {
      if (userData?.has_paid === true && userData?.id) {
        localStorage.setItem(`payment_completed_${userData.id}`, 'true');
      }
    } catch (_) {}
    // After login, verify payment status and set local flag to avoid reprompt
    syncPaymentStatus(userData);
    
    console.log('🔐 Login state updated, user:', userData);
    console.log('🔐 localStorage rpl_token:', localStorage.getItem('rpl_token'));
    console.log('🔐 localStorage rpl_user:', localStorage.getItem('rpl_user'));
    
    // Verify the data was set correctly
    setTimeout(() => {
      const storedUser = localStorage.getItem('rpl_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('🔐 Verification - Stored user data:', {
          id: parsedUser.id,
          email: parsedUser.email,
          username: parsedUser.username
        });
      }
    }, 100);
  };

  const logout = () => {
    console.log('🔐 Logout called, clearing all user data');
    
    // Clear state
    setUser(null);
    setToken(null);
    
    // Clear all authentication-related localStorage items
    try {
      localStorage.removeItem('rpl_token');
      localStorage.removeItem('rpl_user');
      localStorage.removeItem('temp_user_email');
      
      // Clear any referral tracking data
      localStorage.removeItem('referralTracking');
      localStorage.removeItem('wasReferred');
      localStorage.removeItem('referredBy');
      localStorage.removeItem('userReferralCode');
      
      console.log('🔐 All user data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing localStorage during logout:', error);
    }
  };

  const updateUser = (userData) => {
    // Validate user data before updating
    if (!userData || !userData.id) {
      console.error('Invalid userData provided to updateUser:', userData);
      return;
    }
    
    setUser(userData);
    localStorage.setItem('rpl_user', JSON.stringify(userData));
  };

  // Function to verify current user data integrity
  const verifyUserData = () => {
    const currentUser = user;
    const storedUser = localStorage.getItem('rpl_user');
    
    if (!currentUser || !storedUser) {
      return false;
    }
    
    try {
      const parsedStoredUser = JSON.parse(storedUser);
      return currentUser.id === parsedStoredUser.id && 
             currentUser.email === parsedStoredUser.email;
    } catch (error) {
      console.error('Error verifying user data:', error);
      return false;
    }
  };

  const isEmailVerified = user?.is_email_verified || false;

  // Helper function to check if user has paid (centralized logic)
  const hasUserPaid = () => {
    return user?.has_paid === true || 
           (user?.id && localStorage.getItem(`payment_completed_${user.id}`) === 'true');
  };

  // Debug: Log user state changes
  useEffect(() => {
    console.log('🔍 AuthContext user state changed:', user);
  }, [user]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    verifyUserData,
    isEmailVerified,
    hasUserPaid
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
