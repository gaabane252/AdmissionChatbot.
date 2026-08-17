import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

/**
 * Daytime  = 06:00 – 18:00  →  light mode
 * Nighttime = 18:00 – 06:00  →  dark mode
 */
const getTimeBasedTheme = () => {
  const h = new Date().getHours();
  return h >= 6 && h < 18 ? 'light' : 'dark';
};

/** Apply the class synchronously on the <html> element */
const applyClass = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
};

/** Resolve initial theme: localStorage → time-based default */
const getInitialTheme = () => {
  const stored = localStorage.getItem('snu-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return getTimeBasedTheme();
};

// Apply immediately before first render to avoid flash
const initialTheme = getInitialTheme();
applyClass(initialTheme);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(initialTheme);
  const [isAutoMode, setIsAutoMode] = useState(() => !localStorage.getItem('snu-theme'));

  // Manual toggle — persists to localStorage and disables auto mode
  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyClass(next);        // instant class update
    setTheme(next);          // React state update (triggers re-render of icons, etc.)
    setIsAutoMode(false);
    localStorage.setItem('snu-theme', next);
  }, [theme]);

  // Re-enable time-based auto mode
  const enableAutoMode = useCallback(() => {
    localStorage.removeItem('snu-theme');
    setIsAutoMode(true);
    const t = getTimeBasedTheme();
    applyClass(t);
    setTheme(t);
  }, []);

  // Auto-switch based on time (checks every minute, only when auto mode is on)
  useEffect(() => {
    if (!isAutoMode) return;

    const check = () => {
      const t = getTimeBasedTheme();
      if (t !== theme) {
        applyClass(t);
        setTheme(t);
      }
    };

    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [isAutoMode, theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAutoMode, enableAutoMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
