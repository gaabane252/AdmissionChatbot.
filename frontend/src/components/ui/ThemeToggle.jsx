import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'U beddel Light Mode (Maalin)' : 'U beddel Dark Mode (Habeen)'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative flex items-center justify-center w-8.5 h-8.5 rounded-xl
        transition-all duration-200 active:scale-95 cursor-pointer
        bg-white hover:bg-slate-100 border border-slate-200 text-slate-700
        dark:bg-slate-900 dark:border-slate-800 dark:text-amber-400
        dark:hover:bg-slate-800 dark:hover:border-slate-700
        shadow-sm ${className}
      `}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-90" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 text-slate-600" />
      )}
    </button>
  );
};

export default ThemeToggle;

