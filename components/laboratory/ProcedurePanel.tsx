'use client';

import React, { useState } from 'react';
import type { Experiment, ObservationRow } from '@/types/experiment';
import {
  BookOpenIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  ShieldAlertIcon,
  AwardIcon,
} from '@/components/ui/Icons';
import { playStepChime } from '@/lib/audio/sounds';

interface ProcedurePanelProps {
  experiment: Experiment;
  currentStepIndex: number;
  completedSteps: number[];
  observations: ObservationRow[];
  validationAlert: string | null;
  onStepSelect: (index: number) => void;
  onCompleteStep: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ProcedurePanel: React.FC<ProcedurePanelProps> = ({
  experiment,
  currentStepIndex,
  completedSteps,
  observations,
  validationAlert,
  onStepSelect,
  onCompleteStep,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [showHint, setShowHint] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'procedure' | 'observations' | 'principle'>('procedure');

  const currentStep = experiment.steps[currentStepIndex] || experiment.steps[0];
  const totalSteps = experiment.steps.length;
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <aside
      className={`fixed lg:absolute top-0 bottom-0 right-0 z-30 transition-all duration-300 ease-in-out flex ${
        isCollapsed ? 'w-12' : 'w-80 sm:w-96'
      }`}
    >
      {/* Collapsed Toggle Button */}
      {isCollapsed ? (
        <button
          onClick={onToggleCollapse}
          className="h-full w-12 bg-slate-950/80 hover:bg-slate-900 border-l border-cyan-500/20 backdrop-blur-xl flex flex-col items-center py-6 justify-between transition-colors group cursor-pointer"
          title="Open Live Procedure Guide"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
              <BookOpenIcon className="w-4 h-4" />
            </div>
            <div className="writing-vertical-rl text-xs font-bold tracking-widest text-slate-300 group-hover:text-cyan-300 uppercase rotate-180">
              Procedure Guide
            </div>
          </div>

          <ChevronLeftIcon className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      ) : (
        /* Expanded Procedure Drawer */
        <div className="w-full h-full bg-slate-950/95 backdrop-blur-2xl border-l border-cyan-500/20 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                <BookOpenIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white tracking-wide truncate">
                  {experiment.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-cyan-400 font-medium">
                    Step {currentStepIndex + 1} of {totalSteps}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({progressPercent}%)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
              title="Collapse Procedure Panel"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-1.5">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-slate-900/50 p-1 gap-1">
            <button
              onClick={() => setActiveTab('procedure')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'procedure'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Procedure
            </button>
            <button
              onClick={() => setActiveTab('observations')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'observations'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Observations ({observations.length})
            </button>
            <button
              onClick={() => setActiveTab('principle')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'principle'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Theory
            </button>
          </div>

          {/* Tab 1: Live Procedure Flow */}
          {activeTab === 'procedure' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Educational Warning / Guidance Alert */}
              {validationAlert && (
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <ShieldAlertIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{validationAlert}</div>
                </div>
              )}

              {/* Current Active Step Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    Step {currentStep.index + 1} Action
                  </span>
                  {completedSteps.includes(currentStep.index) && (
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">
                  {currentStep.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentStep.instruction}
                </p>

                {/* Expected Action Badge */}
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Required:</span>
                  <span className="font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                    {currentStep.action.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Hint Dropdown */}
                {currentStep.hint && (
                  <div className="pt-2 border-t border-white/5">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <SparklesIcon className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Practical Hint' : 'Show Practical Hint'}</span>
                    </button>
                    {showHint && (
                      <p className="mt-2 text-xs text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                        💡 {currentStep.hint}
                      </p>
                    )}
                  </div>
                )}

                {/* Validation Complete Button */}
                <button
                  onClick={() => {
                    playStepChime();
                    onCompleteStep();
                  }}
                  className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Verify Step Action</span>
                </button>
              </div>

              {/* All Steps Roadmap */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Procedure Steps
                </div>
                {experiment.steps.map((st, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const isDone = completedSteps.includes(idx);

                  return (
                    <div
                      key={st.index}
                      onClick={() => onStepSelect(idx)}
                      className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-3 ${
                        isCurrent
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-sm'
                          : isDone
                          ? 'bg-slate-900/40 border-emerald-500/20 text-slate-300 hover:bg-slate-900/70'
                          : 'bg-slate-900/30 border-white/5 text-slate-500 hover:bg-slate-900/60'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isCurrent
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckIcon className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{st.title}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Live Observations Table */}
          {activeTab === 'observations' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Recorded Parameters</span>
                <span className="text-[10px] text-cyan-400 font-mono">Real-Time Data</span>
              </div>

              {observations.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  Perform experiment steps to log real-time data readings.
                </div>
              ) : (
                <div className="space-y-2">
                  {observations.map((row, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1 text-xs"
                    >
                      <div className="text-slate-400 font-medium">{row.parameter}</div>
                      <div className="font-mono text-cyan-300 font-bold text-sm">
                        {row.value} {row.unit && <span className="text-xs text-slate-400">{row.unit}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Expected Results Card */}
              {experiment.expectedObservations && experiment.expectedObservations.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Standard Reference Values
                  </div>
                  <div className="space-y-1.5">
                    {experiment.expectedObservations.map((expRow, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/40 border border-white/5"
                      >
                        <span className="text-slate-400">{expRow.parameter}</span>
                        <span className="font-mono text-slate-200">
                          {expRow.value} {expRow.unit || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Scientific Principle / Theory */}
          {activeTab === 'principle' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Scientific Principle
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {experiment.principle}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Learning Objectives
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {experiment.learningObjectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              {experiment.safetyNotes && experiment.safetyNotes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/20 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <ShieldAlertIcon className="w-3.5 h-3.5" />
                    <span>Laboratory Safety Protocol</span>
                  </div>
                  <ul className="list-disc list-inside text-rose-200 space-y-1">
                    {experiment.safetyNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
