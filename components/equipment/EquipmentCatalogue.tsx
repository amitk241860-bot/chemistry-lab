'use client';

import React, { useState } from 'react';
import { EQUIPMENT_CATALOGUE } from '@/data/equipment';
import type { Equipment } from '@/types/equipment';
import { BeakerIcon, SearchIcon, XIcon, SparklesIcon, ShieldAlertIcon } from '@/components/ui/Icons';
import { CyanButton } from '@/components/ui/CyanButton';

export const EquipmentCatalogue: React.FC = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Apparatus' },
    { id: 'glassware', label: 'Glassware' },
    { id: 'heating', label: 'Heating Equipment' },
    { id: 'measurement', label: 'Volumetric & Measuring' },
    { id: 'support', label: 'Stands & Support' },
    { id: 'safety', label: 'Safety & Handling' },
    { id: 'other', label: 'Lab Tools & Accessories' },
  ];

  const filtered = EQUIPMENT_CATALOGUE.filter((item: Equipment) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.uses.some((u: string) => u.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Detail Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setSelectedEquipment(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-white/10 pb-5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <BeakerIcon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 capitalize">
                  {selectedEquipment.category}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {selectedEquipment.name}
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {selectedEquipment.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              {selectedEquipment.capacity && (
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
                  <span className="text-slate-400">Capacity: </span>
                  <span className="font-semibold text-slate-200">{selectedEquipment.capacity}</span>
                </div>
              )}
              {selectedEquipment.unit && (
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5">
                  <span className="text-slate-400">Unit: </span>
                  <span className="font-semibold text-slate-200">{selectedEquipment.unit}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs">
                <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Primary CBSE Curriculum Uses</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {selectedEquipment.uses.map((use: string, i: number) => (
                    <li key={i}>{use}</li>
                  ))}
                </ul>
              </div>

              {selectedEquipment.handlingInstructions && selectedEquipment.handlingInstructions.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs">
                  <div className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                    <ShieldAlertIcon className="w-4 h-4" />
                    <span>Handling & Safety Instructions</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {selectedEquipment.handlingInstructions.map((p: string, i: number) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <CyanButton variant="secondary" size="md" onClick={() => setSelectedEquipment(null)}>
                Close
              </CyanButton>
            </div>
          </div>
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <BeakerIcon className="w-6 h-6 text-cyan-400" />
            <span>Laboratory Equipment Encyclopedia</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore 20+ laboratory apparatus used across NCERT Classes 9 through 12 practical examinations.
          </p>
        </div>

        <div className="relative w-72">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search apparatus..."
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
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Apparatus Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item: Equipment) => (
          <div
            key={item.id}
            onClick={() => setSelectedEquipment(item)}
            className="bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.18)] hover:-translate-y-1 rounded-2xl p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 capitalize">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {item.capacity || 'Apparatus'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                {item.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-cyan-400 font-medium">
              <span>View Specifications</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
