import React from 'react';
import { Outlet } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';
import ThemeToast from '../components/ui/ThemeToast';
import { ShieldCheck, HelpCircle, Globe } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-sky-500 selection:text-white transition-colors duration-300">
      {/* Ambient background subtle lighting (ultra-soft, professional) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-sky-400/10 via-sky-500/5 to-transparent dark:from-sky-600/10 dark:via-sky-900/5 blur-3xl" />
        <div className="absolute -bottom-40 right-10 w-[500px] h-[400px] bg-gradient-to-t from-blue-500/5 to-transparent dark:from-blue-600/5 blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SNU AI Admission Portal • Online</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://snu.edu.so"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>snu.edu.so</span>
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-auto">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Bottom Institutional Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-500 relative z-20 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Nidaam ammaan ah oo sugan • Somali National University</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            Aasaaskii 1954 • Est. 1954
          </span>
          <span>•</span>
          <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            Admissions Office
          </span>
        </div>
      </footer>

      {/* Time-based theme toast */}
      <ThemeToast />
    </div>
  );
};

export default AuthLayout;

