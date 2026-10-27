'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  AtomIcon,
  SparklesIcon,
  BeakerIcon,
  FlameIcon,
  DropletsIcon,
  ShieldAlertIcon,
  AwardIcon,
  SettingsIcon,
  XIcon,
  MenuIcon,
} from '@/components/ui/Icons';
import { SettingsModal } from '@/components/settings/SettingsModal';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // If inside an active workbench, keep workbench uncluttered unless user taps drawer
  const isWorkbench =
    (pathname?.startsWith('/experiments') || pathname?.includes('/experiments/')) &&
    pathname !== '/experiments/create';

  const navItems = [
    { label: 'Labs', href: '/', icon: HomeIcon },
    { label: 'Periodic 3D', href: '/periodic-table', icon: AtomIcon },
    { label: 'AI Studio', href: '/experiments/create', icon: SparklesIcon, highlight: true },
    { label: 'Apparatus', href: '/equipment', icon: BeakerIcon },
  ];

  const corePracticals = [
    { label: '1. Heating Water', href: '/experiments/exp-heat-water', icon: FlameIcon },
    { label: '2. Sand Filtration', href: '/experiments/exp-filtration', icon: DropletsIcon },
    { label: '3. Salt Evaporation', href: '/experiments/exp-evaporation', icon: SparklesIcon },
    { label: '4. Indicator pH Shift', href: '/experiments/exp-acid-base-indicator', icon: DropletsIcon },
    { label: '5. Volumetric Titration', href: '/experiments/exp-titration', icon: BeakerIcon },
    { label: '6. Camping Problem I', href: '/experiments/exp-thermochemistry', icon: FlameIcon },
  ];

  return (
    <>
      {/* Floating Bottom Navigation Bar (Visible only on mobile devices: md:hidden) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-cyan-500/20 shadow-[0_-10px_30px_rgba(0,0,0,0.85)] px-3 pt-2 pb-3 flex items-center justify-around select-none"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : item.highlight
                  ? 'text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              )}
              <div
                className={`p-1 rounded-lg ${
                  item.highlight
                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-cyan-400' : ''}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* More / Menu Drawer Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all ${
            isDrawerOpen ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="p-1">
            <MenuIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
        </button>
      </nav>

      {/* Slide-Up Mobile Menu Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative bg-slate-900 border-t border-cyan-500/30 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.9)] max-h-[85vh] overflow-y-auto p-5 space-y-4 animate-in slide-in-from-bottom duration-300">
            {/* Grab handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="text-cyan-400">Virtual Chemistry Lab</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    Mobile
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select practical, view safety, or setup AI API key
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Core Practicals List */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block px-1">
                Core Interactive Practicals
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {corePracticals.map((p) => {
                  const Icon = p.icon;
                  const isActive = pathname === p.href;
                  return (
                    <Link
                      key={p.href}
                      href={p.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'bg-slate-950/60 text-slate-200 hover:bg-slate-800 border border-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate">{p.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Secondary Links & Settings */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <Link
                  href="/safety"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 text-slate-300 hover:text-white border border-white/5"
                >
                  <ShieldAlertIcon className="w-4 h-4 text-rose-400" />
                  <span>Lab Safety</span>
                </Link>
                <Link
                  href="/progress"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 text-slate-300 hover:text-white border border-white/5"
                >
                  <AwardIcon className="w-4 h-4 text-amber-400" />
                  <span>My Progress</span>
                </Link>
              </div>

              {/* API Key Settings Button */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 text-xs font-bold text-violet-200 hover:text-white transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <SettingsIcon className="w-4 h-4 text-violet-400" />
                  <span>Google Gemini API Key & Model</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/30 text-violet-300">
                  Settings
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal triggered from Mobile Nav */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
