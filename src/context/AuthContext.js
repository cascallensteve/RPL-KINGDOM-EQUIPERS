import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Check for existing token and user data in localStorage
    const savedToken = localStorage.getItem('rpl_token');
    const savedUser = localStorage.getItem('rpl_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = (authToken, userData) => {
    console.log('🔐 Login called with:', { authToken, userData });
    console.log('🔐 Previous user state:', user);
    console.log('🔐 Previous token state:', token);
    
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('rpl_token', authToken);
    localStorage.setItem('rpl_user', JSON.stringify(userData));
    
    console.log('🔐 Login state updated, user:', userData);
    console.log('🔐 localStorage rpl_token:', localStorage.getItem('rpl_token'));
    console.log('🔐 localStorage rpl_user:', localStorage.getItem('rpl_user'));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rpl_token');
    localStorage.removeItem('rpl_user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('rpl_user', JSON.stringify(userData));
  };

  const isEmailVerified = user?.is_email_verified || false;

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
    isEmailVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
