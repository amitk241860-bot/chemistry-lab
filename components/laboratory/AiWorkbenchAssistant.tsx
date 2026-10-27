'use client';

import React, { useState } from 'react';
import {
  SparklesIcon,
  FlameIcon,
  DropletsIcon,
  XIcon,
  CheckIcon,
  ChevronRightIcon,
  HelpCircleIcon,
  SendIcon,
} from '@/components/ui/Icons';
import { loadSettings } from '@/lib/settings/settingsStore';
import { playStepChime, playGlassClink } from '@/lib/audio/sounds';
import type { WorkbenchItem } from './NobookWorkbench';
import { getCleanCompoundName } from './NobookWorkbench';

interface AiWorkbenchAssistantProps {
  items: WorkbenchItem[];
  isOpen: boolean;
  onToggle: () => void;
}

export const AiWorkbenchAssistant: React.FC<AiWorkbenchAssistantProps> = ({
  items,
  isOpen,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'mix' | 'burner' | 'ask'>('mix');
  const [vesselAId, setVesselAId] = useState<string>('');
  const [vesselBId, setVesselBId] = useState<string>('');
  const [heatedVesselId, setHeatedVesselId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [question, setQuestion] = useState<string>('');
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);

  const liquidVessels = items.filter((i) => i.maxVolume > 0 && i.volume > 0);
  const heatableVessels = items.filter((i) => i.type !== 'burner' && i.maxVolume > 0);

  // Auto-select first two vessels if available
  React.useEffect(() => {
    if (liquidVessels.length >= 2 && !vesselAId && !vesselBId) {
      setVesselAId(liquidVessels[0].id);
      setVesselBId(liquidVessels[1].id);
    } else if (liquidVessels.length === 1 && !vesselAId) {
      setVesselAId(liquidVessels[0].id);
    }
    if (heatableVessels.length > 0 && !heatedVesselId) {
      setHeatedVesselId(heatableVessels[0].id);
    }
  }, [items]);

  const handlePredictMixing = async () => {
    const vA = items.find((i) => i.id === vesselAId);
    const vB = items.find((i) => i.id === vesselBId);
    if (!vA || !vB) return;

    setLoading(true);
    setResult(null);
    playStepChime();

    try {
      const settings = loadSettings();
      const res = await fetch('/api/ai/ask-workbench', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'predict-mixing',
          vesselA: { name: getCleanCompoundName(vA), contentsName: vA.contentsName },
          vesselB: { name: getCleanCompoundName(vB), contentsName: vB.contentsName },
          apiKey: settings.geminiApiKey,
          model: settings.preferredModel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult({ type: 'mixing', ...data.data, source: data.source });
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to analyze mixture' });
      }
    } catch (err: any) {
      setResult({ type: 'error', message: err?.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePredictHeating = async () => {
    const v = items.find((i) => i.id === heatedVesselId);
    if (!v) return;

    setLoading(true);
    setResult(null);
    playGlassClink();

    try {
      const settings = loadSettings();
      const res = await fetch('/api/ai/ask-workbench', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'predict-heating',
          vessel: {
            name: getCleanCompoundName(v),
            contentsName: v.contentsName,
            temperature: v.temperature,
            volume: v.volume,
            type: v.type,
          },
          apiKey: settings.geminiApiKey,
          model: settings.preferredModel,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult({ type: 'heating', ...data.data, source: data.source });
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to analyze heating' });
      }
    } catch (err: any) {
      setResult({ type: 'error', message: err?.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (customPrompt?: string) => {
    const q = customPrompt || question;
    if (!q.trim()) return;

    setLoading(true);
    setQaAnswer(null);

    try {
      const settings = loadSettings();
      const res = await fetch('/api/ai/ask-workbench', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'ask-question',
          question: q,
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
        setQaAnswer(data.answer);
      } else {
        setQaAnswer(`⚠️ ${data.error}`);
      }
    } catch (err: any) {
      setQaAnswer(`Error: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  // If closed: show floating pill trigger button
  if (!isOpen) {
    return (
      <div className="absolute top-16 right-4 z-30 pointer-events-auto">
        <button
          onClick={onToggle}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-violet-600/90 via-purple-600/90 to-cyan-600/90 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-bold shadow-[0_0_25px_rgba(139,92,246,0.45)] border border-violet-300/40 backdrop-blur-xl transition-all hover:scale-105 active:scale-95 group"
          title="Open AI Lab Co-Pilot for Custom Experiments"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping" />
          <SparklesIcon className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
          <span>AI Lab Co-Pilot</span>
          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/20 text-white tracking-wider">
            Gemini
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-16 right-4 w-[380px] max-w-[calc(100vw-24px)] max-h-[calc(100vh-90px)] bg-slate-950/95 border border-violet-500/30 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-40 flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-950/60 via-slate-900 to-cyan-950/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.5)]">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              AI Lab Co-Pilot
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                Custom Experiment
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Predict mixing reactions & burner thermal dynamics
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-slate-900/60 p-1 gap-1 text-xs font-semibold">
        <button
          onClick={() => {
            setActiveTab('mix');
            setResult(null);
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'mix'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DropletsIcon className="w-3.5 h-3.5" />
          <span>Mix Prediction</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('burner');
            setResult(null);
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'burner'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FlameIcon className="w-3.5 h-3.5" />
          <span>Burner Dynamics</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('ask');
            setResult(null);
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ask'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircleIcon className="w-3.5 h-3.5" />
          <span>Ask Gemini</span>
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* TAB 1: MIX PREDICTOR */}
        {activeTab === 'mix' && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Select two vessels from your workbench to predict what chemical reaction will occur,
              what products form, precipitate colors, gas evolution, and enthalpy (ΔH):
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
                  Reagent 1 (Source)
                </label>
                <select
                  value={vesselAId}
                  onChange={(e) => setVesselAId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Select Vessel 1...</option>
                  {liquidVessels.map((v) => (
                    <option key={v.id} value={v.id}>
                      {getCleanCompoundName(v)} ({v.volume.toFixed(0)} mL)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
                  Reagent 2 (Destination)
                </label>
                <select
                  value={vesselBId}
                  onChange={(e) => setVesselBId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Select Vessel 2...</option>
                  {liquidVessels
                    .filter((v) => v.id !== vesselAId)
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {getCleanCompoundName(v)} ({v.volume.toFixed(0)} mL)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <button
              onClick={handlePredictMixing}
              disabled={!vesselAId || !vesselBId || loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Chemical Outcome...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 text-cyan-200" />
                  <span>Predict Mixing Outcome</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: BURNER DYNAMICS */}
        {activeTab === 'burner' && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Select a vessel to analyze how the Bunsen burner flame will affect it: temperature
              increase rate, boiling point, solvent vaporization, and cooling kinetics:
            </p>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">
                Target Vessel to Heat
              </label>
              <select
                value={heatedVesselId}
                onChange={(e) => setHeatedVesselId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-400"
              >
                <option value="">Select vessel on bench...</option>
                {heatableVessels.map((v) => (
                  <option key={v.id} value={v.id}>
                    {getCleanCompoundName(v)} ({v.volume.toFixed(0)} mL, {v.temperature.toFixed(1)}°C)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePredictHeating}
              disabled={!heatedVesselId || loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Calculating Thermal Kinetics...</span>
                </>
              ) : (
                <>
                  <FlameIcon className="w-4 h-4 text-amber-200" />
                  <span>Analyze Heating & Cooling Cycle</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 3: ASK GEMINI */}
        {activeTab === 'ask' && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Ask Gemini AI any question regarding your current workbench apparatus, chemicals, or
              observations:
            </p>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'What precipitate will form?',
                'Why does temperature rise?',
                'Is this reaction exothermic?',
                'What happens if I evaporate all water?',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setQuestion(chip);
                    handleAskQuestion(chip);
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/10 text-[10px] text-violet-300 hover:text-white transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask your AI chemistry tutor..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-400"
              />
              <button
                onClick={() => handleAskQuestion()}
                disabled={loading || !question.trim()}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-40"
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </div>

            {qaAnswer && (
              <div className="p-3 bg-violet-950/40 border border-violet-500/30 rounded-xl space-y-1">
                <div className="text-[10px] font-bold text-violet-300 flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>Gemini Explanation</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {qaAnswer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* RESULTS CARD */}
        {result && result.type === 'mixing' && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Predicted Reaction
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {result.reactionType}
              </span>
            </div>

            {/* Chemical Equation */}
            <div className="p-2 rounded-lg bg-slate-950 border border-cyan-500/20 font-mono text-xs font-bold text-cyan-200 break-words">
              {result.equation}
            </div>

            {/* Observation */}
            <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
              {result.visualObservation}
            </p>

            {/* Key Outcomes */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded-lg bg-slate-950/80 border border-white/5">
                <span className="text-slate-400 block">Precipitate:</span>
                <span className="font-bold text-emerald-300">
                  {result.precipitate ? result.precipitateName || 'Insoluble Solid ↓' : 'None (Soluble)'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-white/5">
                <span className="text-slate-400 block">Temperature Shift:</span>
                <span
                  className={`font-bold ${
                    result.deltaH < 0
                      ? 'text-rose-300'
                      : result.deltaH > 0
                      ? 'text-cyan-300'
                      : 'text-slate-300'
                  }`}
                >
                  {result.temperatureChange || `${result.deltaH} kJ/mol`}
                </span>
              </div>
            </div>

            {result.safetyWarning && (
              <div className="text-[10px] text-amber-300/90 bg-amber-950/30 border border-amber-500/20 p-2 rounded-lg">
                ⚠️ <span className="font-semibold">Safety:</span> {result.safetyWarning}
              </div>
            )}
          </div>
        )}

        {result && result.type === 'heating' && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                Burner Heating & Cooling Kinetics
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30 font-bold">
                Boiling: {result.boilingPoint}°C
              </span>
            </div>

            {/* Heating & Cooling Rate */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/20">
                <span className="text-rose-300 font-bold block">🔥 Heating Phase:</span>
                <span className="text-slate-200">{result.heatingRate}</span>
              </div>
              <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
                <span className="text-cyan-300 font-bold block">❄️ Cooling Phase:</span>
                <span className="text-slate-200">{result.coolingRate}</span>
              </div>
            </div>

            {/* Phase Changes */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Phase Transition Sequence:</span>
              <p className="text-[11px] text-slate-200 leading-relaxed whitespace-pre-wrap">
                {result.phaseChanges}
              </p>
            </div>

            {/* Solid Residue */}
            {result.solidResidue && (
              <div className="p-2 rounded-lg bg-slate-950 border border-white/10 text-[11px]">
                <span className="text-amber-400 font-bold block">Residue upon Boiling to Dryness:</span>
                <span className="text-slate-300">{result.solidResidue}</span>
              </div>
            )}
          </div>
        )}

        {result && result.type === 'error' && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs">
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
};
