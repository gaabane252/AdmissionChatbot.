import React from 'react';
import SnuLogo from '../ui/SnuLogo';

/**
 * Clean & modern AI loading indicator.
 * Displays the SNU emblem and animated typing indicator dots.
 */
const AiLoadingIndicator = () => {
  return (
    <div className="py-4 px-4 md:px-8 flex gap-3.5 md:gap-4 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/40 transition-colors">
      <div className="flex gap-3.5 md:gap-4 max-w-3xl w-full mr-auto items-center">
        {/* SNU Emblem Avatar */}
        <div className="shrink-0 pt-0.5">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-sky-100 to-amber-50 dark:from-sky-900/40 dark:to-slate-900 border border-sky-200 dark:border-sky-700/40 p-1 flex items-center justify-center shadow-sm">
            <SnuLogo className="w-full h-full" />
          </div>
        </div>

        {/* Loading Bubble */}
        <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Jawaabta waa la diyaarinayaa
          </span>
          {/* Animated 3 dots */}
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"
              style={{ animationDuration: '0.9s', animationDelay: '0ms' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"
              style={{ animationDuration: '0.9s', animationDelay: '150ms' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"
              style={{ animationDuration: '0.9s', animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiLoadingIndicator;
