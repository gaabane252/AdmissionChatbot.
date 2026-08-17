import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SnuLogo from '../ui/SnuLogo';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#030712] gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl animate-pulse"></div>
          <SnuLogo className="w-14 h-14 relative animate-bounce duration-1000" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-sky-300">Hubinta Aqoonsiga...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
