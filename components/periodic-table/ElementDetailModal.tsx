'use client';

import React from 'react';
import type { PeriodicElement } from '@/types/chemistry';
import { XIcon, SparklesIcon, AtomIcon } from '@/components/ui/Icons';
import { CyanButton } from '@/components/ui/CyanButton';

interface ElementDetailModalProps {
  element: PeriodicElement | null;
  onClose: () => void;
}

// Procedural Bohr Atomic Model SVG
const BohrModel: React.FC<{ atomicNumber: number; symbol: string; color: string }> = ({
  atomicNumber,
  symbol,
  color,
}) => {
  // Approximate 2n^2 shell electron counts for visual representation
  const maxShells = [2, 8, 18, 32, 32, 18, 8];
  const shells: number[] = [];
  let remaining = atomicNumber;

  for (const cap of maxShells) {
    if (remaining <= 0) break;
    const count = Math.min(remaining, cap);
    shells.push(count);
    remaining -= count;
  }

  const baseRadius = 24;
  const shellGap = 16;

  return (
    <div className="relative flex items-center justify-center w-56 h-56 mx-auto">
      <svg viewBox="0 0 240 240" className="w-full h-full">
        {/* Concentric Electron Orbital Rings */}
        {shells.map((count, idx) => {
          const r = baseRadius + idx * shellGap;
          return (
            <g key={idx}>
              <circle
                cx="120"
                cy="120"
                r={r}
                fill="none"
                stroke="rgba(6, 182, 212, 0.25)"
                strokeDasharray="3 3"
                strokeWidth="1.2"
              />
              {/* Electron Dots */}
              {Array.from({ length: Math.min(count, 12) }).map((_, eIdx) => {
                const angle = (eIdx / Math.min(count, 12)) * 2 * Math.PI;
                const ex = 120 + r * Math.cos(angle);
                const ey = 120 + r * Math.sin(angle);
                return (
                  <circle
                    key={eIdx}
                    cx={ex}
                    cy={ey}
                    r="3"
                    fill="#38bdf8"
                    className="shadow-[0_0_8px_#38bdf8]"
                  />
                );
              })}
            </g>
          );
        })}

        {/* Central Nucleus */}
        <circle cx="120" cy="120" r="18" fill={color} opacity="0.9" />
        <text
          x="120"
          y="125"
          fill="#ffffff"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          {symbol}
        </text>
      </svg>
    </div>
  );
};

export const ElementDetailModal: React.FC<ElementDetailModalProps> = ({
  element,
  onClose,
}) => {
  if (!element) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-white/10 pb-6 mb-6">
          <div
            className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-white/20 shadow-lg"
            style={{ backgroundColor: element.color }}
          >
            <span className="text-xs font-mono font-bold opacity-80">{element.atomicNumber}</span>
            <span className="text-3xl font-black tracking-tight">{element.symbol}</span>
            <span className="text-[10px] font-medium opacity-90">{element.atomicMass.toFixed(2)}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 capitalize">
                {element.category.replace(/-/g, ' ')}
              </span>
              <span className="text-xs text-slate-400">
                Period {element.period} · Group {element.group ?? 'N/A'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">{element.name}</h2>
            <p className="text-xs text-cyan-400 font-mono mt-1">
              Electron Config: {element.electronConfig}
            </p>
          </div>
        </div>

        {/* 2-Column Body: Bohr Model + Physical Properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
          {/* Procedural Bohr Diagram */}
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-center gap-1.5">
              <AtomIcon className="w-4 h-4 text-cyan-400" />
              <span>Bohr Electron Shell Representation</span>
            </div>
            <BohrModel
              atomicNumber={element.atomicNumber}
              symbol={element.symbol}
              color={element.color}
            />
          </div>

          {/* Physical Constants Table */}
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between">
              <span className="text-slate-400">Electronegativity:</span>
              <span className="font-semibold text-slate-200">{element.electronegativity ?? 'N/A'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between">
              <span className="text-slate-400">Melting Point:</span>
              <span className="font-semibold text-slate-200">
                {element.meltingPoint ? `${element.meltingPoint} K (${(element.meltingPoint - 273.15).toFixed(1)} °C)` : 'Unknown'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between">
              <span className="text-slate-400">Boiling Point:</span>
              <span className="font-semibold text-slate-200">
                {element.boilingPoint ? `${element.boilingPoint} K (${(element.boilingPoint - 273.15).toFixed(1)} °C)` : 'Unknown'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between">
              <span className="text-slate-400">Density:</span>
              <span className="font-semibold text-slate-200">
                {element.density ? `${element.density} g/cm³` : 'Unknown'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between">
              <span className="text-slate-400">Discovery:</span>
              <span className="font-semibold text-slate-200">
                {element.discoveredBy} ({element.yearDiscovered ?? 'Ancient'})
              </span>
            </div>
          </div>
        </div>

        {/* School Chemistry Relevance */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 space-y-1.5 mb-6">
          <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4" />
            <span>CBSE School Chemistry Relevance</span>
          </div>
          <p className="leading-relaxed">{element.schoolRelevance}</p>
          {element.commonUses.length > 0 && (
            <div className="pt-1 text-[11px] text-slate-400">
              <span className="text-slate-300 font-medium">Common Uses: </span>
              {element.commonUses.join(', ')}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <CyanButton variant="secondary" size="md" onClick={onClose}>
            Close Inspector
          </CyanButton>
        </div>
      </div>
    </div>
  );
};
