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
        relative flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0
        transition-all duration-200 active:scale-95 cursor-pointer
        bg-slate-100 hover:bg-slate-200 border border-slate-300/90 text-slate-700
        dark:bg-slate-800/90 dark:border-slate-700 dark:text-amber-400
        dark:hover:bg-slate-700 dark:hover:border-slate-600
        shadow-sm ${className}
      `}
    >
      {isDark ? (
        <Sun className="w-4.5 h-4.5 transition-transform duration-300 hover:rotate-90 text-amber-400" />
      ) : (
        <Moon className="w-4.5 h-4.5 transition-transform duration-300 text-slate-700" />
      )}
    </button>
  );
};

export default ThemeToggle;

