'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BeakerIcon,
  BookOpenIcon,
  SparklesIcon,
  DropletsIcon,
  AwardIcon,
  AtomIcon,
  ShieldAlertIcon,
  XIcon,
  MenuIcon,
} from '../ui/Icons';
import { CURRICULUM } from '../../data/curriculum';
import { CORE_EXPERIMENTS } from '../../lib/experiments/fiveExperiments';

export interface MobileNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
}

export const MOBILE_PRIMARY_TABS: MobileNavItem[] = [
  {
    id: 'lab',
    label: 'Lab',
    href: '/',
    icon: BeakerIcon,
  },
  {
    id: 'experiments',
    label: 'Experiments',
    href: '/experiments/exp-titration',
    icon: BookOpenIcon,
  },
  {
    id: 'ai-studio',
    label: 'AI Studio',
    href: '/experiments/create',
    icon: SparklesIcon,
    badge: 'AI',
  },
  {
    id: 'stockroom',
    label: 'Stockroom',
    href: '/equipment',
    icon: DropletsIcon,
  },
  {
    id: 'history',
    label: 'History',
    href: '/progress',
    icon: AwardIcon,
  },
];

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const isTabActive = (tab: MobileNavItem): boolean => {
    if (tab.id === 'lab') {
      return pathname === '/';
    }
    if (tab.id === 'ai-studio') {
      return pathname.startsWith('/experiments/create') || pathname.startsWith('/experiments/custom');
    }
    if (tab.id === 'experiments') {
      return (
        pathname.startsWith('/classes') ||
        (pathname.startsWith('/experiments/') &&
          !pathname.startsWith('/experiments/create') &&
          !pathname.startsWith('/experiments/custom'))
      );
    }
    return pathname.startsWith(tab.href);
  };

  const curriculumClasses = Object.values(CURRICULUM);

  return (
    <>
      {/* Expandable Quick Experiments & Reference Sheet */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end animate-fade-in"
          onClick={() => setDrawerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Laboratory Navigation Menu"
        >
          <div
            className="bg-slate-900 border-t border-cyan-500/30 rounded-t-3xl p-4 pb-24 max-h-[82vh] overflow-y-auto shadow-[0_-12px_40px_rgba(0,0,0,0.75)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Virtual Chemistry Lab Directory
                </h2>
                <p className="text-xs text-slate-400">
                  Quick-switch experiments, reference tools, or safety protocols
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Core Experiments List */}
            <div className="mb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Core Interactive Lab Experiments
              </div>
              <div className="grid grid-cols-1 gap-2">
                {CORE_EXPERIMENTS.map((exp) => {
                  const active = pathname === `/experiments/${exp.id}`;
                  return (
                    <Link
                      key={exp.id}
                      href={`/experiments/${exp.id}`}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between p-3 min-h-[48px] rounded-xl border transition-all ${
                        active
                          ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                          : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold truncate">{exp.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{exp.category}</div>
                      </div>
                      <span className="shrink-0 text-[10px] font-mono px-2 py-1 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">
                        Open Lab
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Curriculum Levels */}
            <div className="mb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Curriculum Classes (Class 9 – Class 12)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {curriculumClasses.map((cls) => {
                  const active = pathname === `/classes/${cls.classId}`;
                  return (
                    <Link
                      key={cls.classId}
                      href={`/classes/${cls.classId}`}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 min-h-[48px] rounded-xl border text-xs font-semibold transition-all ${
                        active
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>Class {cls.classId}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {cls.chapters.length} ch
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Reference Tools (Periodic Table & Lab Safety) */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Reference & Safety
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/periodic-table"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 min-h-[48px] rounded-xl border text-xs font-semibold ${
                    pathname.startsWith('/periodic-table')
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <AtomIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Periodic Table</span>
                </Link>
                <Link
                  href="/safety"
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 min-h-[48px] rounded-xl border text-xs font-semibold ${
                    pathname.startsWith('/safety')
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <ShieldAlertIcon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Safety Rules</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar for Narrow Mobile / Android Screens */}
      <nav
        aria-label="Mobile Primary Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-1.5 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,10px))] shadow-[0_-6px_28px_rgba(0,0,0,0.65)]"
      >
        <div className="grid grid-cols-6 gap-1 items-center max-w-lg mx-auto">
          {MOBILE_PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setDrawerOpen(false)}
                className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all select-none focus:outline-none focus:ring-2 focus:ring-cyan-400/70 ${
                  active
                    ? 'text-cyan-400 bg-cyan-500/15 border border-cyan-500/35 shadow-[0_0_12px_rgba(34,211,238,0.18)]'
                    : 'text-slate-400 hover:text-slate-200 active:scale-95 border border-transparent'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-3 px-1 py-0.2 text-[8px] font-extrabold uppercase rounded bg-purple-500 text-white leading-tight">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-full">
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* Directory / All Experiments Sheet Trigger */}
          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-expanded={drawerOpen}
            aria-label="Open all experiments and reference menu"
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all select-none focus:outline-none focus:ring-2 focus:ring-cyan-400/70 ${
              drawerOpen
                ? 'text-cyan-400 bg-cyan-500/15 border border-cyan-500/35'
                : 'text-slate-400 hover:text-slate-200 active:scale-95 border border-transparent'
            }`}
          >
            <MenuIcon className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-full">
              All Labs
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
