'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

function readTheme() {
  // Runs synchronously on the client during the lazy useState init,
  // so the first render already has the correct value — no flash.
  if (typeof window === 'undefined') return true; // SSR: default dark
  const stored = localStorage.getItem('theme');
  return stored ? stored === 'dark' : true;
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(readTheme);

  // Sync the data-theme attribute after hydration
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      const theme = next ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
