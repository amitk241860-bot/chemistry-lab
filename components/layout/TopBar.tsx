'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchIcon, BookOpenIcon, AtomIcon, SparklesIcon, SettingsIcon } from '@/components/ui/Icons';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { AppLogo } from '@/components/ui/AppLogo';
import { ALL_EXPERIMENTS } from '@/lib/experiments';

export const TopBar: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const filteredExperiments = searchQuery.trim()
    ? ALL_EXPERIMENTS.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  return (
    <header className="h-16 border-b border-cyan-500/15 bg-slate-950/70 backdrop-blur-2xl px-3 sm:px-6 flex items-center justify-between gap-2 sticky top-0 z-30 select-none">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Mobile Brand Logo */}
        <div className="md:hidden shrink-0">
          <AppLogo size="sm" />
        </div>

        {/* Search Bar with Autocomplete Dropdown */}
        <div className="relative flex-1 max-w-[180px] sm:max-w-xs w-full min-w-0">
          <div className="relative flex items-center">
            <SearchIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all"
            />
          </div>

          {isSearchOpen && filteredExperiments.length > 0 && (
            <div
              className="absolute left-0 right-0 mt-2 bg-slate-900 border border-cyan-500/30 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] p-2 z-50 overflow-hidden min-w-[220px]"
              onMouseLeave={() => setIsSearchOpen(false)}
            >
              <div className="text-[10px] text-slate-400 px-2 py-1 uppercase font-semibold">Experiments</div>
              {filteredExperiments.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => {
                    router.push(`/experiments/${exp.id}`);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{exp.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 shrink-0 ml-2">
                    {exp.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Practical Shortcuts & Engine Badge */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/10">
          <Link
            href="/experiments/exp-titration"
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
          >
            Titration
          </Link>
          <Link
            href="/experiments/exp-thermochemistry"
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
          >
            Calorimetry
          </Link>
          <Link
            href="/experiments/exp-heat-water"
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
          >
            Heating
          </Link>
          <Link
            href="/experiments/exp-filtration"
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
          >
            Filtration
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-white/10">
          <Link
            href="/experiments/create"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-[11px] text-cyan-300 font-semibold shadow-sm transition-all"
            title="Create Custom AI Virtual Experiment"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">+ AI Studio</span>
          </Link>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white transition shadow-sm"
            title="Laboratory Settings & Gemini API Key"
            aria-label="Laboratory Settings & Gemini API Key"
          >
            <SettingsIcon className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};
