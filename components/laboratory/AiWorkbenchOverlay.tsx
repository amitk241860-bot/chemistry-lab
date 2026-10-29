'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SparklesIcon,
  FlameIcon,
  DropletsIcon,
  XIcon,
  ChevronRightIcon,
  CheckIcon,
  HelpCircleIcon,
  SendIcon,
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
  FastForwardIcon,
} from '@/components/ui/Icons';
import { predictReaction } from '@/lib/chemistry/chemmcpEngine';
import { loadSettings } from '@/lib/settings/settingsStore';
import { playStepChime, playFizzSound, playBurnerSound } from '@/lib/audio/sounds';
import type { WorkbenchItem } from './NobookWorkbench';
import { getCleanCompoundName, extractChemicalFormula } from './NobookWorkbench';

interface AiWorkbenchOverlayProps {
  items: WorkbenchItem[];
  selectedId: string | null;
  onSelectVessel: (id: string) => void;
  onToggleBurner: (burnerId: string) => void;
  onExecuteMix: (sourceId: string, destId: string) => void;
  onOpenFullAssistant: () => void;
  // Auto-Done Experiment Props
  isAutoRunning?: boolean;
  autoRunSpeed?: number;
  currentStepIndex?: number;
  totalSteps?: number;
  currentStepTitle?: string;
  currentStepInstruction?: string;
  onStartAutoRun?: () => void;
  onPauseAutoRun?: () => void;
  onNextAutoRunStep?: () => void;
  onAutoCompleteAll?: () => void;
  onChangeAutoRunSpeed?: (spd: number) => void;
}

export const AiWorkbenchOverlay: React.FC<AiWorkbenchOverlayProps> = ({
  items,
  selectedId,
  onSelectVessel,
  onToggleBurner,
  onExecuteMix,
  onOpenFullAssistant,
  isAutoRunning = false,
  autoRunSpeed = 1,
  currentStepIndex = 0,
  totalSteps = 1,
  currentStepTitle = 'Initial Step',
  currentStepInstruction = 'Follow procedure guidelines.',
  onStartAutoRun,
  onPauseAutoRun,
  onNextAutoRunStep,
  onAutoCompleteAll,
  onChangeAutoRunSpeed,
}) => {
  const [activePanel, setActivePanel] = useState<'mixing' | 'burner' | 'autodone' | 'ask' | 'minimized'>('autodone');
  const [selectedVesselA, setSelectedVesselA] = useState<string>('');
  const [selectedVesselB, setSelectedVesselB] = useState<string>('');
  const [aiMixingPrediction, setAiMixingPrediction] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [quickQuestion, setQuickQuestion] = useState<string>('');
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setActivePanel('minimized');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Temperature history tracking for dynamic SVG curve
  const [tempHistory, setTempHistory] = useState<{ time: number; temp: number }[]>([]);
  const burnerItem = items.find((i) => i.type === 'burner');
  const heatedItem = items.find(
    (i) => i.id !== burnerItem?.id && i.maxVolume > 0 && Math.hypot(i.x - (burnerItem?.x || 0), i.y - ((burnerItem?.y || 0) - 45)) < 90
  ) || items.find((i) => i.maxVolume > 0 && i.temperature > 25.0) || items.find((i) => i.id === selectedId && i.maxVolume > 0);

  const activeVessels = useMemo(() => {
    return items.filter((i) => i.maxVolume > 0 && (i.volume > 0 || i.solidAmount));
  }, [items]);

  // Auto-select initial pair of vessels if available
  useEffect(() => {
    if (activeVessels.length >= 2) {
      if (!selectedVesselA || !activeVessels.some((v) => v.id === selectedVesselA)) {
        setSelectedVesselA(activeVessels[0].id);
      }
      if (!selectedVesselB || !activeVessels.some((v) => v.id === selectedVesselB) || selectedVesselB === activeVessels[0].id) {
        setSelectedVesselB(activeVessels[1].id);
      }
    } else if (activeVessels.length === 1 && !selectedVesselA) {
      setSelectedVesselA(activeVessels[0].id);
    }
  }, [activeVessels]);

  // Real-time Chemical Reaction Prediction between Vessel A and Vessel B
  useEffect(() => {
    const vA = items.find((i) => i.id === selectedVesselA);
    const vB = items.find((i) => i.id === selectedVesselB);

    if (!vA || !vB || vA.id === vB.id) {
      setAiMixingPrediction(null);
      return;
    }

    const chemA = extractChemicalFormula(vA);
    const chemB = extractChemicalFormula(vB);

    if (chemA && chemB) {
      const outcome = predictReaction([chemA, chemB]);
      setAiMixingPrediction({
        chemA: getCleanCompoundName(vA),
        chemB: getCleanCompoundName(vB),
        outcome,
      });
    } else {
      setAiMixingPrediction(null);
    }
  }, [selectedVesselA, selectedVesselB, items]);

  // Track temperature every 600ms for dynamic temperature curve graph
  useEffect(() => {
    if (!heatedItem) return;
    const interval = setInterval(() => {
      setTempHistory((prev) => {
        const next = [...prev, { time: Date.now(), temp: heatedItem.temperature }];
        if (next.length > 30) return next.slice(next.length - 30);
        return next;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [heatedItem]);

  // Ask inline Gemini question
  const handleInlineAsk = async () => {
    if (!quickQuestion.trim()) return;
    setIsAiLoading(true);
    setQuickAnswer(null);

    try {
      const settings = loadSettings();
      const res = await fetch('/api/ai/ask-workbench', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'ask-question',
          question: quickQuestion,
          workbenchItems: items.map((it) => ({
            name: getCleanCompoundName(it),
            type: it.type,
            volume: it.volume,
            temperature: it.temperature,
            pH: it.pH,
            contentsName: it.contentsName,
          })),
          apiKey: settings.geminiApiKey,
          model: settings.preferredModel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setQuickAnswer(data.answer);
      } else {
        setQuickAnswer(`⚠️ ${data.error}`);
      }
    } catch (err: any) {
      setQuickAnswer(`Error: ${err?.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Minimized floating pill
  if (activePanel === 'minimized') {
    return (
      <div className="absolute top-14 left-4 z-30 animate-in fade-in duration-150">
        <button
          onClick={() => setActivePanel('autodone')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-violet-500/40 text-violet-300 hover:text-white text-xs font-bold shadow-[0_0_20px_rgba(139,92,246,0.35)] backdrop-blur-xl transition-all hover:scale-105 active:scale-95"
          title="Expand AI Workbench Radar"
        >
          <span className={`w-2 h-2 rounded-full ${isAutoRunning ? 'bg-rose-400 animate-ping' : 'bg-cyan-400 animate-ping'}`} />
          <SparklesIcon className="w-3.5 h-3.5 text-cyan-300" />
          <span>{isAutoRunning ? 'AI Auto-Pilot Running...' : 'AI Co-Pilot Radar'}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-mono">
            Step {currentStepIndex + 1}/{totalSteps}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-14 left-4 z-30 w-84 sm:w-96 max-w-[calc(100vw-32px)] bg-slate-950/95 border border-cyan-500/35 rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in slide-in-from-left duration-200 select-none">
      {/* Top Header Bar */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-violet-950/80 via-slate-900 to-cyan-950/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-md">
            <SparklesIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span>AI Workbench Co-Pilot</span>
              <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                Custom Lab
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenFullAssistant}
            className="text-[10px] font-semibold text-cyan-300 hover:text-white px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Open Full Gemini Lab Co-Pilot Modal"
          >
            Expand ↗
          </button>
          <button
            onClick={() => setActivePanel('minimized')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize to Floating Button"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 bg-slate-900/60 p-1 gap-1 text-[11px] font-bold">
        {/* Tab 1: Auto-Done */}
        <button
          onClick={() => setActivePanel('autodone')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activePanel === 'autodone'
              ? 'bg-gradient-to-r from-violet-600/30 to-cyan-600/30 text-white border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <SparklesIcon className="w-3 h-3 text-cyan-300" />
          <span>Auto-Done</span>
          {isAutoRunning && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
        </button>

        {/* Tab 2: Mixing */}
        <button
          onClick={() => setActivePanel('mixing')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activePanel === 'mixing'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DropletsIcon className="w-3 h-3" />
          <span>Mixing</span>
        </button>

        {/* Tab 3: Burner Dynamics */}
        <button
          onClick={() => setActivePanel('burner')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activePanel === 'burner'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FlameIcon className="w-3 h-3 text-rose-400" />
          <span>Burner</span>
        </button>

        {/* Tab 4: Ask AI */}
        <button
          onClick={() => setActivePanel('ask')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activePanel === 'ask'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircleIcon className="w-3 h-3 text-violet-400" />
          <span>Ask</span>
        </button>
      </div>

      {/* PANEL 0: AI AUTO-DONE EXPERIMENT ENGINE */}
      {activePanel === 'autodone' && (
        <div className="p-3 space-y-3 max-h-[360px] overflow-y-auto text-xs">
          {/* Active Step Status Card */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-cyan-950/60 border border-cyan-500/40 shadow-inner space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isAutoRunning ? 'bg-cyan-400 animate-ping' : 'bg-slate-400'}`} />
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                {isAutoRunning ? 'Auto-Running...' : 'Ready to Run'}
              </span>
            </div>

            <h4 className="text-xs font-bold text-white truncate">
              {currentStepTitle}
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              {currentStepInstruction}
            </p>
          </div>

          {/* Auto-Done Main Controls */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {/* Play / Pause Toggle */}
              <button
                onClick={() => {
                  if (isAutoRunning) {
                    onPauseAutoRun?.();
                  } else {
                    onStartAutoRun?.();
                  }
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                  isAutoRunning
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                }`}
              >
                {isAutoRunning ? (
                  <>
                    <PauseIcon className="w-3.5 h-3.5" />
                    <span>Pause Auto-Done</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-3.5 h-3.5 text-cyan-200" />
                    <span>Auto-Done Step-by-Step</span>
                  </>
                )}
              </button>

              {/* Next Single Step */}
              <button
                onClick={() => onNextAutoRunStep?.()}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-cyan-300 hover:text-white text-xs font-bold transition-all active:scale-95"
                title="Execute Current Step Immediately"
              >
                <SkipForwardIcon className="w-4 h-4" />
              </button>
            </div>

            {/* 1-Click Instant Complete All Steps */}
            <button
              onClick={() => onAutoCompleteAll?.()}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-violet-500/30 hover:border-violet-400 text-violet-200 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <FastForwardIcon className="w-3.5 h-3.5 text-violet-400" />
              <span>⚡ Auto-Complete Entire Experiment Now</span>
            </button>
          </div>

          {/* Speed Toggle & Education Info */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
            <span>Simulation Pace:</span>
            <div className="flex items-center gap-1 font-mono">
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeAutoRunSpeed?.(spd)}
                  className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                    autoRunSpeed === spd
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* How Experiment Happens Educational Breakdown */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1 text-[10px]">
            <span className="font-bold text-cyan-300 block">🔬 How Experiment Happens:</span>
            <p className="text-slate-300 leading-relaxed">
              The AI Co-Pilot sequentially performs apparatus setup, reagent transfers, chemical reactions,
              and thermal heating under Bunsen burner kinetics. Watch color changes, precipitate crystallization,
              temperature increase/decrease, and data logged to your observation table.
            </p>
          </div>
        </div>
      )}

      {/* PANEL 1: CHEMICAL MIXING PREDICTOR */}
      {activePanel === 'mixing' && (
        <div className="p-3 space-y-2.5 max-h-[350px] overflow-y-auto text-xs">
          <div className="flex items-center justify-between text-[10px] text-slate-300">
            <span className="font-semibold">Reagents on Workbench:</span>
            <span className="font-mono text-cyan-400">{activeVessels.length} Active</span>
          </div>

          {activeVessels.length < 2 ? (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-center space-y-1">
              <p className="text-[11px] text-slate-300">
                Place at least 2 solutions on the workbench from the Stockroom to forecast what compound
                will form when mixed!
              </p>
            </div>
          ) : (
            <>
              {/* Vessel Selectors */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div>
                  <label className="text-slate-400 block mb-0.5 font-bold uppercase">Reagent A</label>
                  <select
                    value={selectedVesselA}
                    onChange={(e) => setSelectedVesselA(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 truncate"
                  >
                    {activeVessels.map((v) => (
                      <option key={v.id} value={v.id}>
                        {getCleanCompoundName(v)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-0.5 font-bold uppercase">Reagent B</label>
                  <select
                    value={selectedVesselB}
                    onChange={(e) => setSelectedVesselB(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 truncate"
                  >
                    {activeVessels
                      .filter((v) => v.id !== selectedVesselA)
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {getCleanCompoundName(v)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Prediction Result Display */}
              {aiMixingPrediction && aiMixingPrediction.outcome ? (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2 shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      Compound Formation Forecast
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                      {aiMixingPrediction.outcome.reactionType}
                    </span>
                  </div>

                  {/* Balanced Equation */}
                  <div className="p-1.5 rounded-lg bg-slate-950 font-mono text-[11px] font-bold text-cyan-200 border border-cyan-500/20 break-words">
                    {aiMixingPrediction.outcome.equation}
                  </div>

                  {/* Product Compound Badge */}
                  <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase block">
                        {aiMixingPrediction.outcome.reactionType === 'no-reaction'
                          ? 'Aqueous Species (No Net Reaction):'
                          : 'Compound Product Formed:'}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {Array.isArray(aiMixingPrediction.outcome.products) &&
                        aiMixingPrediction.outcome.products.length > 0
                          ? aiMixingPrediction.outcome.products
                              .map((p: unknown) =>
                                typeof p === 'string'
                                  ? p
                                  : `${(p as { name?: string }).name || ''} (${
                                      (p as { formula?: string }).formula || ''
                                    })`
                              )
                              .join(' + ')
                          : 'Reaction not determined'}
                      </span>
                    </div>
                    {aiMixingPrediction.outcome.isPrecipitateForming && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shrink-0">
                        Precipitate ↓
                      </span>
                    )}
                  </div>

                  {/* Visual Observation & Enthalpy */}
                  <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                    {aiMixingPrediction.outcome.visualObservation}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                    <div className="p-1.5 rounded-lg bg-slate-950/80 border border-white/5">
                      <span className="text-slate-400 block">Enthalpy (ΔH):</span>
                      <span
                        className={`font-bold ${
                          aiMixingPrediction.outcome.deltaH < 0
                            ? 'text-rose-300'
                            : aiMixingPrediction.outcome.deltaH > 0
                            ? 'text-cyan-300'
                            : 'text-slate-300'
                        }`}
                      >
                        {aiMixingPrediction.outcome.deltaH !== 0
                          ? `${aiMixingPrediction.outcome.deltaH} kJ/mol (${aiMixingPrediction.outcome.deltaH < 0 ? 'Exothermic Rise' : 'Endothermic Drop'})`
                          : 'Thermally neutral'}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-950/80 border border-white/5">
                      <span className="text-slate-400 block">Phase Shift:</span>
                      <span className="font-bold text-white">
                        {aiMixingPrediction.outcome.isGasEvolving
                          ? `Gas evolved (${aiMixingPrediction.outcome.gasType || 'Gas'}↑)`
                          : aiMixingPrediction.outcome.isPrecipitateForming
                          ? 'Solid precipitation'
                          : 'Aqueous solution'}
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Pour / Mix Action */}
                  <button
                    onClick={() => {
                      playStepChime();
                      onExecuteMix(selectedVesselA, selectedVesselB);
                    }}
                    className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <span>⚡ Transfer & Form Product</span>
                  </button>
                </div>
              ) : (
                <div className="p-2 text-center text-[10px] text-slate-400">
                  Select two different reagents to evaluate their chemical reaction.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* PANEL 2: BURNER THERMAL KINETICS & TEMPERATURE INCREASE/DECREASE */}
      {activePanel === 'burner' && (
        <div className="p-3 space-y-2.5 max-h-[350px] overflow-y-auto text-xs">
          {heatedItem ? (
            <div className="space-y-2.5">
              {/* Vessel Info + Temperature Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                    Burner Thermal Monitor
                  </span>
                  <span className="text-xs font-bold text-white truncate block max-w-[170px]">
                    {getCleanCompoundName(heatedItem)}
                  </span>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-mono font-black ${
                      heatedItem.temperature >= 99.5
                        ? 'text-rose-400 animate-pulse'
                        : heatedItem.temperature > 50
                        ? 'text-amber-300'
                        : 'text-cyan-300'
                    }`}
                  >
                    {heatedItem.temperature.toFixed(1)}°C
                  </div>
                  <span className="text-[9px] text-slate-400">
                    {heatedItem.thermalRate && heatedItem.thermalRate > 0
                      ? '🔥 Heating (+2.2°C/s)'
                      : heatedItem.thermalRate && heatedItem.thermalRate < 0
                      ? '❄️ Cooling (-0.6°C/s)'
                      : 'Thermal Equilibrium'}
                  </span>
                </div>
              </div>

              {/* Dynamic Temperature Bar Gauge */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>25°C (Ambient)</span>
                  <span>50°C</span>
                  <span>75°C</span>
                  <span className="text-rose-400 font-bold">100°C (Boiling)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 border border-white/10 overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((heatedItem.temperature - 25) / 75) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Live Temperature vs Time Dynamic Mini Graph */}
              <div className="p-2 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-slate-400 font-bold">Temperature Curve (T vs t):</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {heatedItem.temperature >= 100 ? 'Boiling Plateau (100°C)' : `${heatedItem.temperature.toFixed(1)}°C`}
                  </span>
                </div>
                <div className="h-14 w-full relative">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                    {/* Grid lines */}
                    <line x1="0" y1="10" x2="100" y2="10" stroke="#334155" strokeDasharray="2" strokeWidth="0.5" />
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#334155" strokeDasharray="2" strokeWidth="0.5" />
                    {/* Boiling threshold red line */}
                    <line x1="0" y1="2" x2="100" y2="2" stroke="#f43f5e" strokeWidth="0.8" opacity="0.6" />
                    {/* Live SVG path */}
                    {tempHistory.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={tempHistory
                          .map((pt, idx) => {
                            const x = (idx / (tempHistory.length - 1)) * 100;
                            const y = 40 - Math.min(38, Math.max(2, ((pt.temp - 25) / 75) * 38));
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(' ')}
                      />
                    )}
                  </svg>
                </div>
              </div>

              {/* Phase Progression Explanation */}
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5 space-y-1 text-[10px]">
                <span className="font-bold text-amber-300 block">AI Burner Thermal Kinetics:</span>
                <p className="text-slate-300 leading-relaxed">
                  {heatedItem.temperature < 50
                    ? '1. Warming Phase: Thermal conduction increases molecular kinetic energy at +2.2°C/s.'
                    : heatedItem.temperature < 99.5
                    ? '2. Convective Simmering: Density differentials drive convective currents and microbubbles.'
                    : heatedItem.volume > 0
                    ? '3. Vigorous Boiling Plateau: Water absorbs latent heat of vaporization (40.7 kJ/mol). Temperature remains clamped at 100°C while steam escapes.'
                    : '4. Complete Evaporation: Water has boiled to dryness, depositing crystalline solid residue crust on the vessel walls.'}
                </p>
                {heatedItem.thermalRate && heatedItem.thermalRate < 0 && (
                  <p className="text-cyan-300 font-medium">
                    ❄️ Cooling: Vessel is naturally cooling via convection at -0.6°C/s towards ambient 25.0°C.
                  </p>
                )}
              </div>

              {/* Quick Toggle Flame Button */}
              {burnerItem && (
                <button
                  onClick={() => {
                    playBurnerSound();
                    onToggleBurner(burnerItem.id);
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    burnerItem.isHeating
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
                  }`}
                >
                  <FlameIcon className="w-4 h-4" />
                  <span>{burnerItem.isHeating ? 'Extinguish Burner Flame' : 'Ignite Bunsen Burner Flame'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-[11px] text-slate-400">
              No vessel is currently heated. Place an evaporating dish or beaker above the Bunsen burner
              tripod to observe live temperature increases and cooling dynamics!
            </div>
          )}
        </div>
      )}

      {/* PANEL 4: QUICK GEMINI Q&A */}
      {activePanel === 'ask' && (
        <div className="p-3 space-y-2.5 max-h-[350px] overflow-y-auto text-xs">
          <p className="text-[10px] text-slate-300">
            Ask Gemini AI any question regarding your current custom experiment:
          </p>

          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="e.g. Will this reaction bubble or produce heat?"
              value={quickQuestion}
              onChange={(e) => setQuickQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInlineAsk()}
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleInlineAsk}
              disabled={isAiLoading || !quickQuestion.trim()}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40"
            >
              <SendIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1">
            {[
              'What compound precipitates?',
              'Why does temperature plateau at 100°C?',
              'Is this exothermic or endothermic?',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setQuickQuestion(chip);
                }}
                className="px-2 py-0.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/10 text-[9px] text-violet-300"
              >
                {chip}
              </button>
            ))}
          </div>

          {quickAnswer && (
            <div className="p-2.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-[11px] text-slate-200 leading-relaxed whitespace-pre-wrap">
              <span className="text-[10px] font-bold text-violet-300 block mb-0.5">
                ✨ Gemini Assistant:
              </span>
              {quickAnswer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
