'use client';

import React, { useState, useMemo } from 'react';
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
  CheckIcon,
} from '@/components/ui/Icons';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { loadSettings } from '@/lib/settings/settingsStore';
import { playStepChime } from '@/lib/audio/sounds';

export interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string;
}

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'tools'>('all');

  // Load user settings to check Gemini API Key status
  const [hasApiKey, setHasApiKey] = useState(false);
  React.useEffect(() => {
    try {
      const s = loadSettings();
      setHasApiKey(Boolean(s.geminiApiKey && s.geminiApiKey.trim().length > 5));
    } catch {
      setHasApiKey(false);
    }
  }, [isSettingsOpen, isDrawerOpen]);

  const navItems: MobileNavItem[] = [
    { label: 'Labs', href: '/', icon: HomeIcon },
    { label: 'Periodic 3D', href: '/periodic-table', icon: AtomIcon },
    { label: 'AI Studio', href: '/experiments/create', icon: SparklesIcon, highlight: true, badge: 'AI' },
    { label: 'Apparatus', href: '/equipment', icon: BeakerIcon },
  ];

  const corePracticals = [
    {
      id: 'exp-heat-water',
      label: '1. Heating Water & Boiling Curve',
      href: '/experiments/exp-heat-water',
      icon: FlameIcon,
      tag: 'NCERT Class 9',
      desc: 'Thermometer reading, convective currents, and boiling plateau at 100°C.',
    },
    {
      id: 'exp-filtration',
      label: '2. Sand-Water Gravity Filtration',
      href: '/experiments/exp-filtration',
      icon: DropletsIcon,
      tag: 'NCERT Class 9',
      desc: 'Fluted filter paper, residue retention, and crystal clear filtrate.',
    },
    {
      id: 'exp-evaporation',
      label: '3. Salt Solution Evaporation',
      href: '/experiments/exp-evaporation',
      icon: SparklesIcon,
      tag: 'NCERT Class 9',
      desc: 'Vaporization to dryness, salt crystallization, and steam evolution.',
    },
    {
      id: 'exp-acid-base-indicator',
      label: '4. Indicator pH Color Shift',
      href: '/experiments/exp-acid-base-indicator',
      icon: DropletsIcon,
      tag: 'NCERT Class 10',
      desc: 'Universal indicator, pH 1.0 to 13.0 spectrum, and neutralization.',
    },
    {
      id: 'exp-titration',
      label: '5. Volumetric Acid-Base Titration',
      href: '/experiments/exp-titration',
      icon: BeakerIcon,
      tag: 'NCERT Class 11/12',
      desc: '50mL burette stopcock dropwise delivery, phenolphthalein pale pink endpoint.',
    },
    {
      id: 'exp-thermochemistry',
      label: '6. Camping Problem I (Thermochemistry)',
      href: '/experiments/exp-thermochemistry',
      icon: FlameIcon,
      tag: 'ChemCollective VLab',
      desc: 'Insulated calorimeter cup, solid CaCl₂ dissolution enthalpy (ΔH = -85.8 kJ/mol).',
    },
  ];

  // Filter practicals by search query
  const filteredPracticals = useMemo(() => {
    if (!searchQuery.trim()) return corePracticals;
    const q = searchQuery.toLowerCase();
    return corePracticals.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleTabClick = () => {
    try {
      playStepChime();
    } catch {
      // Audio fallback safe
    }
  };

  return (
    <>
      {/* Floating Ergonomic Mobile Bottom Navigation Bar (md:hidden) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-cyan-500/25 shadow-[0_-10px_35px_rgba(0,0,0,0.9)] px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom,10px))] flex items-center justify-around select-none transition-all"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleTabClick}
              className={`flex flex-col items-center justify-center min-w-[62px] min-h-[48px] py-1 px-1.5 rounded-2xl transition-all relative active:scale-95 ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : item.highlight
                  ? 'text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {/* Active Top Glow Pill */}
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_10px_#22d3ee]" />
              )}

              {/* Icon Container with subtle glass glow */}
              <div
                className={`relative p-1.5 rounded-xl transition-transform ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 scale-105 shadow-[0_0_14px_rgba(6,182,212,0.4)]'
                    : item.highlight
                    ? 'bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 text-cyan-300 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                    : 'hover:bg-slate-900 text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-violet-600 text-white text-[8px] font-black uppercase tracking-wider shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-[64px]">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More / Menu Drawer Button */}
        <button
          onClick={() => {
            handleTabClick();
            setIsDrawerOpen(true);
          }}
          className={`flex flex-col items-center justify-center min-w-[62px] min-h-[48px] py-1 px-1.5 rounded-2xl transition-all active:scale-95 ${
            isDrawerOpen ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Open Mobile Menu Drawer"
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              isDrawerOpen
                ? 'bg-cyan-500/20 text-cyan-300 scale-105 shadow-[0_0_14px_rgba(6,182,212,0.4)]'
                : 'hover:bg-slate-900 text-slate-400'
            }`}
          >
            <MenuIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Menu</span>
        </button>
      </nav>

      {/* Slide-Up Mobile Menu Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop with touch dismiss */}
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Sheet Container */}
          <div className="relative bg-slate-900 border-t border-cyan-500/35 rounded-t-[2rem] shadow-[0_-25px_60px_rgba(0,0,0,0.95)] max-h-[88vh] overflow-y-auto p-5 pb-[max(1.5rem,env(safe-area-inset-bottom,20px))] space-y-4 animate-in slide-in-from-bottom duration-300 text-slate-100">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto -mt-1 mb-2" />

            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-black">
                    Virtual Chemistry Lab
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                    Mobile Studio
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Touch-ready interactive NCERT practicals & Gemini AI co-pilot
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
                aria-label="Close Drawer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search Filter Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search practicals, chemicals, equipment..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs p-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Custom Experiment AI Studio Shortcut Banner */}
            <Link
              href="/experiments/create"
              onClick={() => setIsDrawerOpen(false)}
              className="block p-3 rounded-2xl bg-gradient-to-r from-violet-950/80 via-slate-900 to-cyan-950/80 border border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:border-violet-400 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      Create Your Own Experiment
                      <span className="text-[9px] px-1 rounded bg-violet-500/30 text-violet-300">
                        AI Studio
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-300">
                      ChemMCP tools + Gemini 3.6/3.8 Flash real-time guidance
                    </p>
                  </div>
                </div>
                <span className="text-cyan-400 font-bold text-xs">→</span>
              </div>
            </Link>

            {/* Core NCERT Practicals Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Core Interactive Practicals ({filteredPracticals.length})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">NCERT Syllabus</span>
              </div>

              <div className="space-y-1.5 max-h-[38vh] overflow-y-auto pr-1">
                {filteredPracticals.map((p) => {
                  const Icon = p.icon;
                  const isActive = pathname === p.href;

                  return (
                    <Link
                      key={p.id}
                      href={p.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all active:scale-[0.99] ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-950/70 text-slate-200 hover:bg-slate-800/80 border border-white/5'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-900 border border-white/10 shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-bold text-white truncate">{p.label}</h5>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                            {p.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Safety & Progress Quick Access */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
              <Link
                href="/safety"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/70 text-slate-300 hover:text-white border border-white/5 transition-all"
              >
                <ShieldAlertIcon className="w-4 h-4 text-rose-400" />
                <span>Lab Safety Rules</span>
              </Link>
              <Link
                href="/progress"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/70 text-slate-300 hover:text-white border border-white/5 transition-all"
              >
                <AwardIcon className="w-4 h-4 text-amber-400" />
                <span>Student Progress</span>
              </Link>
            </div>

            {/* Google Gemini API Key Settings Bar */}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-violet-950/60 via-slate-950 to-cyan-950/60 border border-violet-500/30 text-xs font-bold text-violet-200 hover:text-white transition-all shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-violet-600/30 border border-violet-400/30 text-violet-300">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span>Google Gemini API Key</span>
                      {hasApiKey ? (
                        <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          <CheckIcon className="w-2.5 h-2.5" /> Configured
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
                          Local Fallback
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Gemini 3.6 Flash / 3.8 Flash model options
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-lg bg-white/10 text-slate-300">
                  Configure ⚙️
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
