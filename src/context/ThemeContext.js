import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem('rpl_theme');
    if (stored === 'light' || stored === 'dark') return stored;
    // fallback to system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  } catch (_) {
    return 'light';
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem('rpl_theme', theme);
    } catch (_) {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return () => {
      // When unmounting (leaving dashboard), ensure dark class is removed
      document.documentElement.classList.remove('dark');
    };
  }, [theme]);

  useEffect(() => {
    // Keep in sync if system changes and user hasn't explicitly chosen (optional enhancement)
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const stored = localStorage.getItem('rpl_theme');
      if (!stored) setTheme(e.matches ? 'dark' : 'light');
    };
    if (mq && mq.addEventListener) mq.addEventListener('change', handler);
    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener('change', handler);
    };
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
