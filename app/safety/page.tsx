'use client';

import React from 'react';
import { ShieldAlertIcon, SparklesIcon, FlameIcon, DropletsIcon } from '@/components/ui/Icons';

export default function SafetyPage() {
  const safetyRules = [
    {
      title: 'Mandatory Personal Protective Equipment (PPE)',
      desc: 'Always wear a cotton lab coat and safety goggles when handling corrosive acids, bases, or heated glassware. Tie back long hair and wear closed-toe shoes.',
    },
    {
      title: 'Golden Rule of Acid Dilution: "A to W"',
      desc: 'ALWAYS add concentrated acid to water slowly with constant stirring. NEVER add water to concentrated acid. The enormous heat of hydration can cause explosive boiling and violent acid splattering.',
    },
    {
      title: 'Safe Wafting for Odour Detection',
      desc: 'Never inhale chemical fumes directly by placing your nose over a test tube. Use your cupped hand to gently waft the vapour towards your nose from a safe distance.',
    },
    {
      title: 'Direction of Heated Test Tubes',
      desc: 'When heating liquids in a test tube using a test-tube holder, slant the tube at a 45° angle and point the open mouth away from yourself and neighboring classmates.',
    },
    {
      title: 'Handling Hot Glassware',
      desc: 'Hot glass looks identical to cold glass. Always use crucible tongs or heat-resistant pads to transfer hot beakers, evaporating dishes, or crucibles. Never place hot glass on cold wet bench surfaces.',
    },
    {
      title: 'Organic Solvents & Open Flames',
      desc: 'Volatile flammable solvents like ethanol, acetone, ether, and benzene must NEVER be heated directly over a naked burner flame; always use a hot water bath.',
    },
  ];

  const firstAid = [
    {
      incident: 'Acid on Skin',
      action: 'Immediately flush with copious amounts of cold tap water for at least 10 minutes. Neutralize gently with saturated sodium bicarbonate (NaHCO₃) solution.',
    },
    {
      incident: 'Alkali / Base on Skin',
      action: 'Flush immediately under running cold water. Wash with very dilute acetic acid or boric acid solution. Bases feel slippery and cause deep tissue damage if not washed quickly.',
    },
    {
      incident: 'Chemical in Eye',
      action: 'Rush to the emergency eyewash station immediately. Hold eyelids wide open and rinse continuously with lukewarm clean water for 15 minutes. Seek emergency medical attention.',
    },
    {
      incident: 'Minor Thermal Burn',
      action: 'Hold the burned area under cold running water for 10–15 minutes until pain subsides. Do not apply butter or oil; cover loosely with a sterile non-adherent dressing.',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30">
            CBSE / NCERT Laboratory Regulations
          </span>
        </div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <ShieldAlertIcon className="w-7 h-7 text-amber-400" />
          <span>Laboratory Safety Guidelines & Protocols</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Fundamental safety principles, hazard warnings, and emergency first-aid procedures to ensure safe experimentation.
        </p>
      </div>

      {/* 6 Core Golden Rules */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-cyan-400" />
          <span>Core Chemistry Safety Commandments</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/30 transition-all space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 text-xs flex items-center justify-center shrink-0 border border-cyan-500/30">
                  {idx + 1}
                </span>
                <span>{rule.title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-7">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency First Aid Protocols */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <DropletsIcon className="w-5 h-5 text-rose-400" />
          <span>Emergency First Aid Procedures</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {firstAid.map((fa, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/70 border border-rose-500/20 space-y-2"
            >
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>{fa.incident}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {fa.action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
