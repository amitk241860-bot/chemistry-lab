'use client';

import React, { useState, useMemo } from 'react';
import { ELEMENTS } from '@/data/elements';
import type { PeriodicElement } from '@/types/chemistry';
import { ElementDetailModal } from './ElementDetailModal';
import { SearchIcon, AtomIcon } from '@/components/ui/Icons';

export const PeriodicTable: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<PeriodicElement | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Elements' },
    { id: 'alkali-metal', label: 'Alkali Metals' },
    { id: 'alkaline-earth-metal', label: 'Alkaline Earth' },
    { id: 'transition-metal', label: 'Transition Metals' },
    { id: 'post-transition-metal', label: 'Post-Transition' },
    { id: 'metalloid', label: 'Metalloids' },
    { id: 'nonmetal', label: 'Reactive Nonmetals' },
    { id: 'halogen', label: 'Halogens' },
    { id: 'noble-gas', label: 'Noble Gases' },
    { id: 'lanthanide', label: 'Lanthanides' },
    { id: 'actinide', label: 'Actinides' },
  ];

  // Periodic grid cell mapping: 18 columns × 7 rows
  // Lanthanides & Actinides placed below in rows 8 & 9
  const gridMap = useMemo(() => {
    const map = new Map<string, PeriodicElement>();
    ELEMENTS.forEach((el: PeriodicElement) => {
      if (el.category === 'lanthanide') {
        const offset = el.atomicNumber - 57;
        map.set(`8-${offset + 3}`, el);
      } else if (el.category === 'actinide') {
        const offset = el.atomicNumber - 89;
        map.set(`9-${offset + 3}`, el);
      } else if (el.group !== null) {
        map.set(`${el.period}-${el.group}`, el);
      }
    });
    return map;
  }, []);

  const isMatched = (el: PeriodicElement) => {
    const matchesSearch =
      !search ||
      el.name.toLowerCase().includes(search.toLowerCase()) ||
      el.symbol.toLowerCase().includes(search.toLowerCase()) ||
      el.atomicNumber.toString() === search.trim();

    const matchesCategory =
      activeCategory === 'all' || el.category === activeCategory;

    return matchesSearch && matchesCategory;
  };

  return (
    <div className="space-y-6">
      {/* Detail Modal */}
      <ElementDetailModal
        element={selectedElement}
        onClose={() => setSelectedElement(null)}
      />

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <AtomIcon className="w-6 h-6 text-cyan-400" />
            <span>Interactive Periodic Table of the Elements</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete 118 IUPAC elements with electronic configurations, Bohr diagrams, and school syllabus relevance.
          </p>
        </div>

        <div className="relative w-72">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, symbol, or #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Periodic Grid Container */}
      <div className="overflow-x-auto pb-6">
        <div className="min-w-[1020px] space-y-2">
          {/* Main 7 Periods (18 columns) */}
          {[1, 2, 3, 4, 5, 6, 7].map((row) => (
            <div key={row} className="grid grid-cols-18 gap-1.5">
              {Array.from({ length: 18 }, (_, colIdx) => {
                const col = colIdx + 1;
                const el = gridMap.get(`${row}-${col}`);

                // Placeholder for Lanthanides marker in Period 6, Col 3
                if (row === 6 && col === 3) {
                  return (
                    <div
                      key={col}
                      className="h-16 rounded-xl border border-dashed border-purple-500/40 bg-purple-950/20 flex flex-col items-center justify-center text-[10px] text-purple-300 font-semibold p-1 text-center"
                    >
                      <span>57–71</span>
                      <span className="text-[8px] opacity-70">La-Lu</span>
                    </div>
                  );
                }

                // Placeholder for Actinides marker in Period 7, Col 3
                if (row === 7 && col === 3) {
                  return (
                    <div
                      key={col}
                      className="h-16 rounded-xl border border-dashed border-rose-500/40 bg-rose-950/20 flex flex-col items-center justify-center text-[10px] text-rose-300 font-semibold p-1 text-center"
                    >
                      <span>89–103</span>
                      <span className="text-[8px] opacity-70">Ac-Lr</span>
                    </div>
                  );
                }

                if (!el) {
                  return <div key={col} className="h-16" />;
                }

                const matched = isMatched(el);

                return (
                  <button
                    key={el.atomicNumber}
                    onClick={() => setSelectedElement(el)}
                    className={`h-16 rounded-xl border transition-all duration-200 flex flex-col justify-between p-1.5 text-left relative group cursor-pointer ${
                      matched
                        ? 'hover:scale-110 hover:z-20 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] border-white/10'
                        : 'opacity-25 grayscale'
                    }`}
                    style={{
                      backgroundColor: `${el.color}33`,
                      borderColor: `${el.color}88`,
                    }}
                  >
                    <div className="flex justify-between items-start text-[9px] font-mono text-slate-300">
                      <span>{el.atomicNumber}</span>
                      <span className="text-[8px] opacity-60">
                        {el.atomicMass.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-center font-black text-sm text-white group-hover:text-cyan-300">
                      {el.symbol}
                    </div>
                    <div className="text-[8px] text-slate-300 truncate text-center">
                      {el.name}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Spacer */}
          <div className="h-4" />

          {/* Lanthanides Row (Period 8 offset) */}
          <div className="grid grid-cols-18 gap-1.5">
            <div className="col-span-2 flex items-center justify-end pr-2 text-xs font-semibold text-purple-400">
              Lanthanides
            </div>
            {Array.from({ length: 15 }, (_, i) => {
              const el = gridMap.get(`8-${i + 3}`);
              if (!el) return <div key={i} className="h-16" />;
              const matched = isMatched(el);

              return (
                <button
                  key={el.atomicNumber}
                  onClick={() => setSelectedElement(el)}
                  className={`h-16 rounded-xl border transition-all duration-200 flex flex-col justify-between p-1.5 text-left relative cursor-pointer ${
                    matched ? 'hover:scale-110 hover:z-20 border-white/10' : 'opacity-25 grayscale'
                  }`}
                  style={{
                    backgroundColor: `${el.color}33`,
                    borderColor: `${el.color}88`,
                  }}
                >
                  <div className="flex justify-between items-start text-[9px] font-mono text-slate-300">
                    <span>{el.atomicNumber}</span>
                  </div>
                  <div className="text-center font-black text-sm text-white">
                    {el.symbol}
                  </div>
                  <div className="text-[8px] text-slate-300 truncate text-center">
                    {el.name}
                  </div>
                </button>
              );
            })}
            <div className="col-span-1" />
          </div>

          {/* Actinides Row (Period 9 offset) */}
          <div className="grid grid-cols-18 gap-1.5">
            <div className="col-span-2 flex items-center justify-end pr-2 text-xs font-semibold text-rose-400">
              Actinides
            </div>
            {Array.from({ length: 15 }, (_, i) => {
              const el = gridMap.get(`9-${i + 3}`);
              if (!el) return <div key={i} className="h-16" />;
              const matched = isMatched(el);

              return (
                <button
                  key={el.atomicNumber}
                  onClick={() => setSelectedElement(el)}
                  className={`h-16 rounded-xl border transition-all duration-200 flex flex-col justify-between p-1.5 text-left relative cursor-pointer ${
                    matched ? 'hover:scale-110 hover:z-20 border-white/10' : 'opacity-25 grayscale'
                  }`}
                  style={{
                    backgroundColor: `${el.color}33`,
                    borderColor: `${el.color}88`,
                  }}
                >
                  <div className="flex justify-between items-start text-[9px] font-mono text-slate-300">
                    <span>{el.atomicNumber}</span>
                  </div>
                  <div className="text-center font-black text-sm text-white">
                    {el.symbol}
                  </div>
                  <div className="text-[8px] text-slate-300 truncate text-center">
                    {el.name}
                  </div>
                </button>
              );
            })}
            <div className="col-span-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
