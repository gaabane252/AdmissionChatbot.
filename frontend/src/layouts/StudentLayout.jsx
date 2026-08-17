import React from 'react';
import { Outlet } from 'react-router-dom';

const StudentLayout = () => {
  return (
    <div className="h-screen w-screen flex bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 overflow-hidden font-sans select-none sm:select-auto transition-colors duration-300">
      <Outlet />
    </div>
  );
};

export default StudentLayout;
