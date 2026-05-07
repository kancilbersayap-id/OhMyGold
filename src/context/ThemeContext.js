'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Always start with the server default (dark) so SSR and first client render
  // produce identical HTML. The inline script in app/layout.js has already set
  // `data-theme` on <html> from localStorage before paint, so CSS variables are
  // correct from the start — only the toggle's icon may flip on mount.
  const [isDark, setIsDark] = useState(true);

  // After hydration, sync state with the value the inline script applied.
  useEffect(() => {
    const applied = document.documentElement.getAttribute('data-theme');
    setIsDark(applied !== 'light');
  }, []);

  // Keep the data-theme attribute in sync with state changes from toggling.
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
