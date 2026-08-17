import React, { useEffect, useState } from 'react';
import { Sun, Moon, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Shows a brief welcome toast on first load telling the user
 * which theme was applied based on the current time of day.
 */
const ThemeToast = () => {
  const { theme, isAutoMode } = useTheme();
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Only show on first page load when auto mode is active
    const shownKey = 'snu-theme-toast-shown';
    const alreadyShown = sessionStorage.getItem(shownKey);
    if (alreadyShown || !isAutoMode) return;

    // Small delay so page renders first
    const showTimer = setTimeout(() => {
      setVisible(true);
      setAnimate(true);
      sessionStorage.setItem(shownKey, '1');
    }, 800);

    return () => clearTimeout(showTimer);
  }, [isAutoMode]);

  // Auto-hide after 5 seconds
  useEffect(() => {
    if (!visible) return;
    const hideTimer = setTimeout(() => {
      setAnimate(false);
      setTimeout(() => setVisible(false), 400);
    }, 5000);
    return () => clearTimeout(hideTimer);
  }, [visible]);

  if (!visible) return null;

  const isDark = theme === 'dark';
  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? 'Subax wanaagsan 🌅'
      : hour >= 12 && hour < 17
      ? 'Galab wanaagsan ☀️'
      : hour >= 17 && hour < 21
      ? 'Fiid wanaagsan 🌇'
      : 'Habeen wanaagsan 🌙';

  const modeLabel = isDark ? 'Dark Mode' : 'Light Mode';
  const modeDesc = isDark
    ? 'Habeen ayaa la joogo — Dark mode si toos ah ayuu u shaqeeyay'
    : 'Maalinta ayaa la jooga — Light mode si toos ah ayuu u shaqeeyay';

  return (
    <div
      className={`
        fixed bottom-6 right-4 z-[999] max-w-xs
        transition-all duration-400 ease-out
        ${animate
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-4 opacity-0 scale-95'
        }
      `}
    >
      <div className={`
        flex items-start gap-3 p-4 rounded-2xl shadow-2xl
        border backdrop-blur-xl
        ${isDark
          ? 'bg-[#0b1325]/95 border-sky-900/60 text-white shadow-black/60'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/80'
        }
      `}>
        {/* Icon */}
        <div className={`
          w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm
          ${isDark
            ? 'bg-slate-800 border border-slate-700 text-amber-300'
            : 'bg-amber-50 border border-amber-200 text-amber-600'
          }
        `}>
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold leading-tight mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {greeting} — {modeLabel}
          </p>
          <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {modeDesc}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setAnimate(false);
            setTimeout(() => setVisible(false), 400);
          }}
          className={`p-1 rounded-lg transition-colors shrink-0 ${
            isDark
              ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className={`mt-1.5 h-0.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
        <div
          className={`h-full rounded-full ${isDark ? 'bg-sky-500' : 'bg-amber-400'}`}
          style={{
            animation: visible ? 'shrink 5s linear forwards' : 'none',
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default ThemeToast;
