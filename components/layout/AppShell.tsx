'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const isWorkbench =
    (pathname?.startsWith('/experiments') || pathname?.includes('/experiments/')) &&
    pathname !== '/experiments/create';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-x-hidden font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-64 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Main Sidebar (Hidden on interactive workbench pages to give 100% full space to reaction sheet) */}
      {!isWorkbench && (
        <Suspense fallback={<div className="w-64 bg-slate-950/80 border-r border-white/5" />}>
          <Sidebar />
        </Suspense>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {!isWorkbench && (
          <Suspense fallback={<div className="h-16 bg-slate-950/70 border-b border-white/5" />}>
            <TopBar />
          </Suspense>
        )}
        <main
          className={
            isWorkbench
              ? 'flex-1 w-full h-screen p-0 m-0 overflow-hidden relative'
              : 'flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto'
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
};
