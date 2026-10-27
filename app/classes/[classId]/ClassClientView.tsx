'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ClassCurriculum } from '@/data/curriculum';
import type { Experiment } from '@/types/experiment';
import { PlayIcon, ChevronLeftIcon } from '@/components/ui/Icons';
import { CyanButton } from '@/components/ui/CyanButton';

interface ClassClientViewProps {
  curriculum: ClassCurriculum;
  experiments: Experiment[];
}

export default function ClassClientView({ curriculum, experiments }: ClassClientViewProps) {
  const categories = ['all', ...Array.from(new Set(experiments.map((e) => e.category)))];
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredExperiments = experiments.filter((e) =>
    activeCategory === 'all' ? true : e.category === activeCategory
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="border-b border-white/10 pb-6">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 mb-2 transition-colors"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                CBSE NCERT Practical Syllabus
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {experiments.length} Interactive Practicals
              </span>
            </div>
            <h1 className="text-3xl font-black text-white">
              {curriculum.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {curriculum.description}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all capitalize cursor-pointer ${
              activeCategory === cat
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5'
            }`}
          >
            {cat === 'all' ? 'All Practicals' : cat}
          </button>
        ))}
      </div>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredExperiments.map((exp) => (
          <div
            key={exp.id}
            className="bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                  {exp.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ~{exp.estimatedMinutes} mins
                </span>
              </div>

              <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                {exp.title}
              </h2>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {exp.principle}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {exp.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-950/60 text-slate-400 border border-white/5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400 capitalize">
                Level: <span className="text-slate-200 font-medium">{exp.difficulty}</span>
              </span>
              <Link href={`/classes/${exp.classId}/experiments/${exp.id}`}>
                <CyanButton variant="primary" size="sm" icon={<PlayIcon className="w-3.5 h-3.5 ml-0.5" />}>
                  Enter Experiment
                </CyanButton>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
