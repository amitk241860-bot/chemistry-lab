'use client';

import React from 'react';

interface LabFallbackProps {
  liquidColor?: string;
  liquidLevel?: number; // 0 to 1
  isHeating?: boolean;
}

export const LabFallback: React.FC<LabFallbackProps> = ({
  liquidColor = '#3b82f6',
  liquidLevel = 0.5,
  isHeating = false,
}) => {
  const fillPercentage = Math.round(liquidLevel * 100);

  return (
    <div className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden relative border border-cyan-500/20 bg-gradient-to-b from-slate-950 to-slate-900 p-8 flex flex-col items-center justify-center">
      {/* 2D Fallback Mode Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-slate-300 font-medium">Interactive 2D Lab Mode</span>
      </div>

      {/* SVG Laboratory Apparatus Rendering */}
      <div className="relative w-80 h-72 flex items-end justify-center gap-12">
        {/* Beaker Apparatus */}
        <div className="relative w-36 h-48 border-2 border-cyan-400/40 border-t-0 rounded-b-3xl bg-slate-800/20 backdrop-blur-sm overflow-hidden flex flex-col justify-end p-1 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          {/* Glass Rim */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400/60" />

          {/* Graduations */}
          <div className="absolute left-2 top-8 bottom-6 flex flex-col justify-between pointer-events-none opacity-50">
            <span className="w-4 h-[1.5px] bg-cyan-300 text-[8px] pl-5 -mt-1 text-slate-400">200mL</span>
            <span className="w-3 h-[1.5px] bg-cyan-300 text-[8px] pl-4 -mt-1 text-slate-400">150mL</span>
            <span className="w-4 h-[1.5px] bg-cyan-300 text-[8px] pl-5 -mt-1 text-slate-400">100mL</span>
            <span className="w-3 h-[1.5px] bg-cyan-300 text-[8px] pl-4 -mt-1 text-slate-400">50mL</span>
          </div>

          {/* Chemical Liquid */}
          <div
            className="w-full rounded-b-2xl transition-all duration-700 relative overflow-hidden"
            style={{
              height: `${fillPercentage}%`,
              backgroundColor: liquidColor,
              opacity: 0.85,
            }}
          >
            {/* Liquid Surface Meniscus */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 rounded-full blur-[1px]" />

            {/* Rising Bubbles when heating */}
            {isHeating && (
              <div className="absolute inset-0 flex justify-around items-end">
                <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/70 animate-pulse" />
              </div>
            )}
          </div>
          <div className="text-[11px] font-semibold text-cyan-300 text-center mt-2">
            Beaker (250 mL)
          </div>
        </div>

        {/* Bunsen Burner */}
        <div className="relative flex flex-col items-center">
          {/* Flame */}
          {isHeating && (
            <div className="w-6 h-14 bg-gradient-to-t from-cyan-400 via-blue-500 to-transparent rounded-full blur-[1px] animate-pulse -mb-1 shadow-[0_0_20px_#22d3ee]" />
          )}
          {/* Burner Barrel */}
          <div className="w-4 h-24 bg-gradient-to-r from-slate-400 to-slate-600 rounded-t-sm" />
          {/* Air Collar */}
          <div className="w-6 h-4 bg-slate-700 rounded-sm" />
          {/* Burner Base */}
          <div className="w-20 h-4 bg-slate-800 border border-slate-600 rounded-md shadow-md" />
          <div className="text-[11px] font-semibold text-slate-400 text-center mt-2">
            Bunsen Burner
          </div>
        </div>
      </div>

      {/* Workbench Floor line */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mt-4" />
    </div>
  );
};
