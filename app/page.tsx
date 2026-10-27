'use client';

import React from 'react';
import Link from 'next/link';
import {
  BeakerIcon,
  FlameIcon,
  DropletsIcon,
  AtomIcon,
  SparklesIcon,
  PlayIcon,
  ChevronRightIcon,
  BookOpenIcon,
  AwardIcon,
} from '@/components/ui/Icons';
import { CyanButton } from '@/components/ui/CyanButton';
import { CORE_EXPERIMENTS } from '@/lib/experiments/fiveExperiments';
import { GlasswareSvg } from '@/components/laboratory/apparatus/GlasswareSvg';

export default function HomePage() {
  return (
    <div className="space-y-12 pb-20 select-none">
      {/* Hero Showcase Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-950 to-cyan-950/40 border border-cyan-500/25 p-8 md:p-12 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
            <SparklesIcon className="w-4 h-4 text-cyan-400" />
            <span>NOBOOK Visual Excellence × ChemCollective VLab Simulator</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Unified Virtual <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Chemistry Laboratory</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
            Conduct realistic hands-on chemistry experiments with procedural 2D/pseudo-3D glassware, dynamic meniscuses, glowing burner flames, live species molarities ([H⁺], [OH⁻]), precise drag-to-transfer pouring, and thermochemical calorimetry.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/experiments/create">
              <CyanButton variant="primary" size="lg" icon={<SparklesIcon className="w-4 h-4" />}>
                ✨ AI Custom Experiment Studio
              </CyanButton>
            </Link>

            <Link href="/experiments/exp-titration">
              <CyanButton variant="secondary" size="lg" icon={<PlayIcon className="w-4 h-4" />}>
                Acid-Base Titration Lab
              </CyanButton>
            </Link>

            <Link href="/experiments/exp-thermochemistry">
              <CyanButton variant="outline" size="lg" icon={<FlameIcon className="w-4 h-4" />}>
                Camping Problem I (Calorimetry)
              </CyanButton>
            </Link>

            <Link href="/periodic-table">
              <CyanButton variant="outline" size="lg" icon={<AtomIcon className="w-4 h-4" />}>
                Periodic Table 3D
              </CyanButton>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Studio Callout Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-violet-950/60 border border-cyan-500/40 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
            <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>ChemMCP Toolkit + Google Gemini AI</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            Make Your Own Virtual Experiment
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Write or paste your custom laboratory guide. Google Gemini AI will interpret your chemical intent, automatically position initial reagents and glassware on the workbench, and guide your steps with real-time audio-visual notifications!
          </p>
        </div>
        <Link href="/experiments/create" className="shrink-0">
          <CyanButton variant="primary" size="lg" icon={<SparklesIcon className="w-4 h-4" />}>
            Create Custom Experiment →
          </CyanButton>
        </Link>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <DropletsIcon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Dynamic Meniscus & Steam</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Procedural vector graphics with specular highlights, fluid levels, meniscus curves, boiling bubbles, and steam plumes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BeakerIcon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">ChemCollective Stockroom</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Full drawer of Solutions, Glassware, and Tools with drag-to-transfer pouring in precise mL or realistic hold-to-pour modes.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Live Species Molarities</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect real-time [H⁺], [OH⁻], [Na⁺], [Cl⁻] concentrations, dynamic pH spectrum gauges, and temperature tracking.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FlameIcon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Adiabatic Calorimetry</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Thermal insulation toggles for coffee-cup calorimeters to measure exothermic heats of solution (q = m · Cp · ΔT, ΔH_soln).
          </p>
        </div>
      </section>

      {/* Core Practicals Laboratory Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <BookOpenIcon className="w-6 h-6 text-cyan-400" />
              <span>Experiment Library</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any practical to launch the interactive virtual laboratory workbench.
            </p>
          </div>

          <div className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-3 py-1.5 rounded-full border border-cyan-500/30 w-fit">
            6 Practicals Available
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_EXPERIMENTS.map((exp, idx) => {
            // Representative glassware preview type based on experiment
            const previewType =
              exp.id === 'exp-heat-water'
                ? 'test-tube'
                : exp.id === 'exp-filtration'
                ? 'filter-funnel'
                : exp.id === 'exp-evaporation'
                ? 'evaporating-dish'
                : exp.id === 'exp-acid-base-indicator'
                ? 'beaker-100'
                : exp.id === 'exp-titration'
                ? 'conical-flask-250'
                : 'foam-cup';

            const previewLiquidColor =
              exp.id === 'exp-filtration'
                ? '#d97706'
                : exp.id === 'exp-acid-base-indicator'
                ? '#e11d48'
                : exp.id === 'exp-titration'
                ? '#f472b6'
                : '#38bdf8';

            return (
              <div
                key={exp.id}
                className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-white/10 hover:border-cyan-500/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:-translate-y-1"
              >
                {/* Card Top: Preview Apparatus & Category */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                      {exp.category}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400">
                      ⏱️ {exp.estimatedMinutes} mins
                    </span>
                  </div>

                  {/* Visual Vector Icon Center */}
                  <div className="w-full h-36 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-center p-2 group-hover:border-cyan-500/30 transition-colors relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />
                    <GlasswareSvg
                      type={previewType}
                      volume={50}
                      maxVolume={100}
                      liquidColor={previewLiquidColor}
                      temperature={exp.id === 'exp-heat-water' ? 100 : exp.id === 'exp-thermochemistry' ? 41.8 : 25}
                      hasFilterPaper={exp.id === 'exp-filtration'}
                      hasResidue={exp.id === 'exp-filtration'}
                      hasSaltCrust={exp.id === 'exp-evaporation'}
                      width={90}
                      height={120}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {exp.principle}
                    </p>
                  </div>

                  {/* Required Equipment Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {exp.requiredEquipment.slice(0, 3).map((eq) => (
                      <span
                        key={eq}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-white/5 font-mono"
                      >
                        {eq.replace('-', ' ')}
                      </span>
                    ))}
                    {exp.requiredEquipment.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-500 font-mono">
                        +{exp.requiredEquipment.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Action Link */}
                <div className="pt-6 border-t border-white/5 mt-4">
                  <Link href={`/experiments/${exp.id}`} className="block">
                    <button className="w-full py-2.5 rounded-xl bg-cyan-500/10 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-600 text-cyan-300 group-hover:text-slate-950 font-bold text-xs border border-cyan-500/30 group-hover:border-cyan-400 transition-all flex items-center justify-center gap-2 shadow-sm">
                      <PlayIcon className="w-3.5 h-3.5" />
                      <span>Start Experiment</span>
                      <ChevronRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
