'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BeakerIcon,
  AtomIcon,
  BookOpenIcon,
  AwardIcon,
  ShieldAlertIcon,
  SparklesIcon,
  FlameIcon,
  DropletsIcon,
  SettingsIcon,
} from '@/components/ui/Icons';
import { AppLogo } from '@/components/ui/AppLogo';
import { SettingsModal } from '@/components/settings/SettingsModal';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const mainNavItems = [
    { label: 'Experiment Library', href: '/', icon: HomeIcon },
    { label: 'Periodic Table 3D', href: '/periodic-table', icon: AtomIcon, highlight: true },
    { label: 'Equipment Catalogue', href: '/equipment', icon: BeakerIcon },
    { label: 'Safety Guidelines', href: '/safety', icon: ShieldAlertIcon },
    { label: 'My Progress', href: '/progress', icon: AwardIcon },
  ];

  const coreLabItems = [
    { label: '1. Heating Water', href: '/experiments/exp-heat-water', icon: FlameIcon },
    { label: '2. Sand Filtration', href: '/experiments/exp-filtration', icon: DropletsIcon },
    { label: '3. Salt Evaporation', href: '/experiments/exp-evaporation', icon: SparklesIcon },
    { label: '4. Indicator pH Shift', href: '/experiments/exp-acid-base-indicator', icon: DropletsIcon },
    { label: '5. Volumetric Titration', href: '/experiments/exp-titration', icon: BeakerIcon, badge: 'Popular' },
    { label: '6. Camping Problem I', href: '/experiments/exp-thermochemistry', icon: FlameIcon, badge: 'VLab 94' },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950/80 border-r border-cyan-500/15 backdrop-blur-2xl flex flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5">
        <AppLogo size="md" />
      </div>

      {/* AI Custom Lab Studio Button */}
      <div className="px-4 pt-4 pb-1">
        <Link
          href="/experiments/create"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-violet-500/15 hover:from-cyan-500/25 hover:to-violet-500/25 border border-cyan-500/40 text-xs font-bold text-cyan-200 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all group"
        >
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>AI Experiment Studio</span>
          </div>
          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950">
            NEW
          </span>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* Core Practicals Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-cyan-400 uppercase">
            Core Virtual Practicals
          </div>
          {coreLabItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 shrink-0 ml-1">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* General Tools & Knowledge Section */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Workbench & Tools
          </div>
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Live Status Banner & Settings */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition group"
        >
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
            <span>Lab Settings & API Key</span>
          </div>
          <span className="text-[10px] text-slate-400">⚙️</span>
        </button>

        <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900/90 to-cyan-950/30 border border-cyan-500/20 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-0.5">
            <SparklesIcon className="w-3 h-3" />
            <span className="text-[11px]">NOBOOK × ChemMCP</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            100% self-contained procedural vector rendering with Web Audio synthesis.
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
  );
};
