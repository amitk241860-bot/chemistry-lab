'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  // Check if we are inside an active experiment workspace
  const isExperimentRunner =
    (pathname.startsWith('/experiments/') && pathname !== '/experiments/create') ||
    (pathname.includes('/classes/') && pathname.includes('/experiments/'));

  if (isExperimentRunner) {
    return (
      <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50 pb-20 md:pb-0">
        {children}
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-x-hidden">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
};
