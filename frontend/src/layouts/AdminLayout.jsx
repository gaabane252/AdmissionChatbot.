import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, LogOut, Menu, X, ArrowLeft } from 'lucide-react';
import SnuLogo from '../components/ui/SnuLogo';
import ThemeToggle from '../components/ui/ThemeToggle';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Documents', path: '/admin/documents', icon: FileText },
  ];

  return (
    <div className="h-screen w-screen flex bg-slate-100 dark:bg-[#030712] text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors">
      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#070d1a] border-b border-slate-200 dark:border-sky-950/80 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2.5">
          <SnuLogo className="w-7 h-7" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-white font-display">SNU Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay on mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:relative z-50 w-64 h-full bg-white dark:bg-[#070d18] border-r border-slate-200 dark:border-sky-950/80 flex flex-col justify-between transition-all duration-300 ease-out shadow-xl md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header */}
          <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-slate-800/80 gap-3">
            <SnuLogo className="w-8 h-8" />
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-xs text-slate-900 dark:text-white leading-none tracking-tight font-display truncate">
                SNU AI Admin
              </h1>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium tracking-wide">
                Management Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-100 text-sky-900 border border-sky-300 shadow-sm dark:bg-gradient-to-r dark:from-sky-600/20 dark:to-sky-900/30 dark:text-sky-300 dark:border-sky-500/40 dark:shadow-sky-500/10'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Quick Link back to Student Chat */}
            <NavLink
              to="/student/chat"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-sky-600 dark:hover:text-sky-300 transition-colors border border-transparent"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Student Chat View</span>
            </NavLink>
          </nav>
        </div>

        {/* User Footer / Sign Out & Theme Switcher */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Theme</span>
            <ThemeToggle />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">
                Authorized Admin
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <main className="flex-1 h-full overflow-y-auto pt-16 md:pt-0 bg-slate-50 dark:bg-[#050b18] custom-scrollbar transition-colors">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
