'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SparklesIcon,
  BeakerIcon,
  PlayIcon,
  ChevronLeftIcon,
  FlameIcon,
  DropletsIcon,
  CheckIcon,
  ShieldAlertIcon,
  BookOpenIcon,
  RotateCcwIcon,
  XIcon,
  PlusIcon,
} from '@/components/ui/Icons';
import { GlasswareSvg } from '@/components/laboratory/apparatus/GlasswareSvg';
import {
  predictReaction,
  getSolutionColorInfo,
  normalizeChemicalFormula,
  COLORLESS_AQUEOUS_HEX,
} from '@/lib/chemistry/chemmcpEngine';

export interface SelectedReagent {
  id: string;
  formula: string;
  name: string;
  concentration: string;
  volumeML: number;
  colorHex: string;
  isColorless: boolean;
}

const AVAILABLE_REAGENTS: Array<{
  formula: string;
  name: string;
  defaultConc: string;
  colorDesc: string;
}> = [
  { formula: 'ZnSO4', name: 'Zinc Sulfate (aq)', defaultConc: '0.1 M', colorDesc: 'Clear, colorless' },
  { formula: 'NaCl', name: 'Sodium Chloride (aq)', defaultConc: '0.1 M', colorDesc: 'Clear, colorless' },
  { formula: 'CuSO4', name: 'Copper(II) Sulfate (aq)', defaultConc: '0.1 M', colorDesc: 'Clear sky-blue' },
  { formula: 'NaOH', name: 'Sodium Hydroxide (aq)', defaultConc: '0.1 M', colorDesc: 'Clear, colorless' },
  { formula: 'AgNO3', name: 'Silver Nitrate (aq)', defaultConc: '0.1 M', colorDesc: 'Clear, colorless' },
  { formula: 'BaCl2', name: 'Barium Chloride (aq)', defaultConc: '0.1 M', colorDesc: 'Clear, colorless' },
  { formula: 'Na2SO4', name: 'Sodium Sulfate (aq)', defaultConc: '0.1 M', colorDesc: 'Clear, colorless' },
  { formula: 'KMnO4', name: 'Potassium Permanganate (aq)', defaultConc: '0.05 M', colorDesc: 'Deep purple-violet' },
  { formula: 'FeCl3', name: 'Iron(III) Chloride (aq)', defaultConc: '0.1 M', colorDesc: 'Yellow-brown' },
  { formula: 'KSCN', name: 'Potassium Thiocyanate (aq)', defaultConc: '0.1 M', colorDesc: 'Clear, colorless' },
  { formula: 'FeSO4', name: 'Iron(II) Sulfate (aq)', defaultConc: '0.1 M', colorDesc: 'Pale green' },
  { formula: 'Pb(NO3)2', name: 'Lead(II) Nitrate (aq)', defaultConc: '0.1 M', colorDesc: 'Clear, colorless' },
  { formula: 'KI', name: 'Potassium Iodide (aq)', defaultConc: '0.1 M', colorDesc: 'Clear, colorless' },
  { formula: 'HCl', name: 'Hydrochloric Acid (aq)', defaultConc: '0.1 M', colorDesc: 'Clear, colorless' },
  { formula: 'Na2CO3', name: 'Sodium Carbonate (aq)', defaultConc: '0.1 M', colorDesc: 'Clear, colorless' },
  { formula: 'H2O', name: 'Deionized Water (l)', defaultConc: 'Pure', colorDesc: 'Clear, colorless' },
];

const SAMPLE_EXPERIMENTS = [
  {
    title: 'ZnSO₄ + NaCl (Dilute Aqueous — No Reaction)',
    reagents: [
      { formula: 'ZnSO4', concentration: '0.1 M', volumeML: 50 },
      { formula: 'NaCl', concentration: '0.1 M', volumeML: 50 },
    ],
    guide: `Title: Aqueous Mixing of Dilute Zinc Sulfate and Sodium Chloride
Objective: Observe whether any precipitation, gas evolution, or color change occurs when dilute ZnSO4(aq) and NaCl(aq) are mixed.
Reagents: 50 mL of 0.1 M ZnSO4(aq) and 50 mL of 0.1 M NaCl(aq).
Procedure:
1. Pour 50 mL of clear, colorless 0.1 M ZnSO4 solution into a 250 mL reaction beaker.
2. Add 50 mL of clear, colorless 0.1 M NaCl solution and mix thoroughly.
3. Observe that no precipitate forms and the mixed solution remains clear and colorless because ZnCl2 and Na2SO4 are both soluble in water.`,
  },
  {
    title: 'CuSO₄ + NaOH (Blue Cu(OH)₂ Precipitate)',
    reagents: [
      { formula: 'CuSO4', concentration: '0.1 M', volumeML: 50 },
      { formula: 'NaOH', concentration: '0.1 M', volumeML: 50 },
    ],
    guide: `Title: Precipitation of Copper(II) Hydroxide
Objective: Synthesize insoluble Copper(II) Hydroxide precipitate from aqueous Copper(II) Sulfate and Sodium Hydroxide.
Reagents: 50 mL of 0.1 M CuSO4(aq) (blue solution) and 50 mL of 0.1 M NaOH(aq) (colorless solution).
Procedure:
1. Add 50 mL of blue 0.1 M CuSO4 solution into a 250 mL beaker.
2. Add 50 mL of colorless 0.1 M NaOH solution and stir.
3. Observe a gelatinous sky-blue precipitate of Cu(OH)2(s) settling at the bottom.`,
  },
  {
    title: 'AgNO₃ + NaCl (White AgCl Precipitate)',
    reagents: [
      { formula: 'AgNO3', concentration: '0.1 M', volumeML: 50 },
      { formula: 'NaCl', concentration: '0.1 M', volumeML: 50 },
    ],
    guide: `Title: Halide Ion Test — Silver Chloride Precipitation
Objective: Identify chloride ions by reacting Silver Nitrate with Sodium Chloride.
Reagents: 50 mL of 0.1 M AgNO3(aq) and 50 mL of 0.1 M NaCl(aq).
Procedure:
1. Pour 50 mL of clear, colorless 0.1 M NaCl into a clean beaker.
2. Add 50 mL of clear, colorless 0.1 M AgNO3 solution and mix.
3. Observe an immediate curdy white AgCl(s) precipitate settling under a clear, colorless NaNO3 supernatant.`,
  },
  {
    title: 'FeCl₃ + KSCN (Blood-Red Complex)',
    reagents: [
      { formula: 'FeCl3', concentration: '0.1 M', volumeML: 50 },
      { formula: 'KSCN', concentration: '0.1 M', volumeML: 50 },
    ],
    guide: `Title: Iron(III) Thiocyanate Coordination Complex
Objective: Observe the dramatic color transition when yellow-brown Fe3+(aq) coordinates with colorless SCN-(aq).
Reagents: 50 mL of 0.1 M FeCl3(aq) and 50 mL of 0.1 M KSCN(aq).
Procedure:
1. Add 50 mL of yellow-brown 0.1 M FeCl3 solution to the beaker.
2. Pour 50 mL of colorless 0.1 M KSCN solution and mix.
3. Observe an immediate deep blood-red [Fe(SCN)]2+(aq) solution with no solid precipitate.`,
  },
  {
    title: 'Pb(NO₃)₂ + KI (Golden Rain PbI₂)',
    reagents: [
      { formula: 'Pb(NO3)2', concentration: '0.1 M', volumeML: 50 },
      { formula: 'KI', concentration: '0.1 M', volumeML: 50 },
    ],
    guide: `Title: Golden Rain — Lead(II) Iodide Precipitation
Objective: Observe bright yellow PbI2(s) precipitation from two clear, colorless salt solutions.
Reagents: 50 mL of 0.1 M Pb(NO3)2(aq) and 50 mL of 0.1 M KI(aq).
Procedure:
1. Pour 50 mL of colorless 0.1 M Pb(NO3)2 into a 250 mL beaker.
2. Add 50 mL of colorless 0.1 M KI and mix.
3. Observe bright golden-yellow PbI2(s) precipitate forming in a colorless KNO3 supernatant.`,
  },
  {
    title: 'HCl + Na₂CO₃ (CO₂ Gas Effervescence)',
    reagents: [
      { formula: 'HCl', concentration: '0.5 M', volumeML: 50 },
      { formula: 'Na2CO3', concentration: '0.5 M', volumeML: 50 },
    ],
    guide: `Title: Carbonate Acidification & CO2 Effervescence
Objective: Observe vigorous carbon dioxide gas evolution when Hydrochloric Acid reacts with Sodium Carbonate.
Reagents: 50 mL of 0.5 M HCl(aq) and 50 mL of 0.5 M Na2CO3(aq).`,
  },
];

function createReagentEntry(formulaInput: string, concentration = '0.1 M', volumeML = 50): SelectedReagent {
  const formula = normalizeChemicalFormula(formulaInput);
  const info = getSolutionColorInfo(formula);
  return {
    id: `${formula}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    formula,
    name: info.name,
    concentration,
    volumeML,
    colorHex: info.hex,
    isColorless: info.isColorless,
  };
}

export default function CreateCustomExperimentPage() {
  const router = useRouter();

  // Selected reagents state (default: ZnSO4 + NaCl so user can immediately test or change)
  const [selectedReagents, setSelectedReagents] = useState<SelectedReagent[]>(() => [
    createReagentEntry('ZnSO4', '0.1 M', 50),
    createReagentEntry('NaCl', '0.1 M', 50),
  ]);

  // Add chemical form controls
  const [pickerFormula, setPickerFormula] = useState<string>('CuSO4');
  const [customFormulaInput, setCustomFormulaInput] = useState<string>('');
  const [pickerConc, setPickerConc] = useState<string>('0.1 M');
  const [pickerVolume, setPickerVolume] = useState<number>(50);

  // Free-form guide text
  const [guideText, setGuideText] = useState<string>(SAMPLE_EXPERIMENTS[0].guide);

  // Experiment execution & Beaker visual state
  const [isExperimentStarted, setIsExperimentStarted] = useState<boolean>(true);
  const [isMixed, setIsMixed] = useState<boolean>(false);
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [isMixingAnim, setIsMixingAnim] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(
    'Ready: Select chemicals, click "Mix" or "Start Experiment" to run the reaction and AI analysis.'
  );

  // Analyzed experiment result state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analyzedExperiment, setAnalyzedExperiment] = useState<any | null>(null);
  const [aiSource, setAiSource] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Live local stoichiometric preview for the current selected reagents
  const currentFormulas = selectedReagents.map((r) => r.formula);
  const localPrediction = predictReaction(currentFormulas);

  // Clear stale results whenever reagents change
  const clearStaleResults = (nextReagents: SelectedReagent[]) => {
    setAnalyzedExperiment(null);
    setAiSource(null);
    setIsMixed(false);
    setIsPouring(false);
    setIsMixingAnim(false);
    setErrorMsg(null);
    if (nextReagents.length === 0) {
      setStatusBanner('Beaker is empty. Add at least one chemical reagent to begin.');
    } else {
      setStatusBanner(
        `Reagents updated (${nextReagents.map((r) => r.formula).join(' + ')}). Click "Mix" or "Analyze" to evaluate.`
      );
    }
  };

  // Add Chemical handler
  const handleAddChemical = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawFormula = customFormulaInput.trim() || pickerFormula;
    if (!rawFormula) {
      setErrorMsg('Please select or enter a chemical formula.');
      return;
    }
    const vol = Math.min(200, Math.max(5, Number(pickerVolume) || 50));
    const newReagent = createReagentEntry(rawFormula, pickerConc.trim() || '0.1 M', vol);
    const updated = [...selectedReagents, newReagent];
    setSelectedReagents(updated);
    setCustomFormulaInput('');
    clearStaleResults(updated);
    setGuideText(
      `Experiment: Aqueous mixing of ${updated
        .map((r) => `${r.volumeML} mL of ${r.concentration} ${r.formula}`)
        .join(' and ')}.`
    );
  };

  // Remove Chemical handler
  const handleRemoveChemical = (id: string) => {
    const updated = selectedReagents.filter((r) => r.id !== id);
    setSelectedReagents(updated);
    clearStaleResults(updated);
    setGuideText(
      updated.length > 0
        ? `Experiment: Aqueous mixing of ${updated
            .map((r) => `${r.volumeML} mL of ${r.concentration} ${r.formula}`)
            .join(' and ')}.`
        : ''
    );
  };

  // Load Preset Experiment
  const handleLoadPreset = (sample: (typeof SAMPLE_EXPERIMENTS)[number]) => {
    const entries = sample.reagents.map((r) =>
      createReagentEntry(r.formula, r.concentration, r.volumeML)
    );
    setSelectedReagents(entries);
    setGuideText(sample.guide);
    setAnalyzedExperiment(null);
    setAiSource(null);
    setIsMixed(false);
    setIsPouring(false);
    setIsMixingAnim(false);
    setErrorMsg(null);
    setStatusBanner(`Loaded preset: ${sample.title}. Click "Start Experiment" or "Mix" to observe.`);
  };

  // Run API Analysis
  const runAnalysis = async (reagentsToAnalyze: SelectedReagent[], guideToAnalyze: string) => {
    if (isAnalyzing) return;
    if (reagentsToAnalyze.length === 0 && !guideToAnalyze.trim()) {
      setErrorMsg('Please add at least one chemical or enter a laboratory procedure before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const savedKey =
        typeof window !== 'undefined' ? localStorage.getItem('chemlab_gemini_api_key') || '' : '';
      const savedModel =
        typeof window !== 'undefined'
          ? localStorage.getItem('chemlab_gemini_model') || 'gemini-2.5-flash'
          : 'gemini-2.5-flash';

      const res = await fetch('/api/ai/analyze-experiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(savedKey ? { 'x-gemini-api-key': savedKey } : {}),
        },
        body: JSON.stringify({
          guide: guideToAnalyze,
          chemicals: reagentsToAnalyze.map((r) => ({
            formula: r.formula,
            name: r.name,
            concentration: r.concentration,
            volumeML: r.volumeML,
          })),
          model: savedModel,
        }),
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to analyze experiment.');
      }

      setAnalyzedExperiment(data.experiment);
      setAiSource(data.aiSource || 'chemmcp-engine');
      localStorage.setItem('custom_ai_experiment', JSON.stringify(data.experiment));
      sessionStorage.setItem('chemlab_active_custom_exp', JSON.stringify(data.experiment));
      setStatusBanner(
        `Analysis complete: ${data.experiment?.expectedOutcomes?.balancedEquation || 'Reaction evaluated'}`
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatusBanner('Analysis stopped by user.');
        return;
      }
      const message = err instanceof Error ? err.message : 'Unexpected error analyzing experiment.';
      setErrorMsg(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mix Chemicals in Beaker
  const handleMixChemicals = async () => {
    if (selectedReagents.length === 0) {
      setErrorMsg('Add at least one chemical to the beaker before mixing.');
      return;
    }
    setErrorMsg(null);
    setIsExperimentStarted(true);
    setIsPouring(true);
    setIsMixingAnim(true);
    setStatusBanner(
      `Mixing ${selectedReagents.map((r) => `${r.volumeML} mL ${r.formula}`).join(' + ')} in the reaction beaker...`
    );

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsPouring(false);
      setIsMixed(true);
      setTimeout(() => {
        setIsMixingAnim(false);
      }, 600);
    }, 650);

    await runAnalysis(selectedReagents, guideText);
  };

  // Start Experiment button handler
  const handleStartExperiment = async () => {
    if (selectedReagents.length === 0 && !guideText.trim()) {
      setErrorMsg('Please select at least one chemical or enter a laboratory guide to start.');
      return;
    }
    await handleMixChemicals();
  };

  // Stop Experiment / Animation handler
  const handleStopExperiment = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setIsPouring(false);
    setIsMixingAnim(false);
    setIsAnalyzing(false);
    setStatusBanner('Experiment action stopped. You can modify chemicals, Mix again, or Reset.');
  };

  // Reset Experiment handler
  const handleResetExperiment = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setIsPouring(false);
    setIsMixingAnim(false);
    setIsMixed(false);
    setIsAnalyzing(false);
    setAnalyzedExperiment(null);
    setAiSource(null);
    setErrorMsg(null);
    setStatusBanner('Experiment reset to initial unmixed reagent state.');
  };

  // Launch Full Interactive Workbench
  const handleLaunchFullWorkbench = async () => {
    if (!analyzedExperiment) {
      await runAnalysis(selectedReagents, guideText);
    }
    router.push('/experiments/custom');
  };

  // Determine Beaker Visual State
  const totalVolumeML = selectedReagents.reduce((acc, r) => acc + r.volumeML, 0);
  const outcomes = analyzedExperiment?.expectedOutcomes;

  // Before mixing: show the first reagent's color (or blended unmixed color); after mixing: show verified reaction solution color
  const beakerSolutionColor = (() => {
    if (selectedReagents.length === 0) return COLORLESS_AQUEOUS_HEX;
    if (!isMixed) {
      // If any reagent is colored before mixing, show the first colored reagent or colorless
      const firstColored = selectedReagents.find((r) => !r.isColorless);
      return firstColored ? firstColored.colorHex : COLORLESS_AQUEOUS_HEX;
    }
    return outcomes?.solutionColor || outcomes?.finalColor || localPrediction.solutionColor || COLORLESS_AQUEOUS_HEX;
  })();

  const beakerPrecipitateColor = (() => {
    if (!isMixed || selectedReagents.length < 2) return undefined;
    const hasPpt =
      outcomes !== undefined ? Boolean(outcomes.precipitate) : localPrediction.isPrecipitateForming;
    if (!hasPpt) return undefined;
    return outcomes?.precipitateColor || localPrediction.precipitateColor || '#ffffff';
  })();

  const beakerGasEvolving = (() => {
    if (!isMixed || selectedReagents.length < 2) return false;
    return outcomes !== undefined ? Boolean(outcomes.gasEvolution) : localPrediction.isGasEvolving;
  })();

  const activeOutcomes = outcomes || {
    isReactionExpected: localPrediction.isReactionExpected,
    isDetermined: localPrediction.isDetermined,
    reactionType: localPrediction.reactionType,
    balancedEquation: localPrediction.equation,
    netIonicEquation: localPrediction.netIonicEquation || localPrediction.equation,
    reactants: currentFormulas,
    products:
      localPrediction.products.length > 0
        ? localPrediction.products.map((p) => `${p.name} (${p.formula}${p.state === 's' ? '↓' : ''})`)
        : localPrediction.reactionType === 'no-reaction'
        ? currentFormulas.map((f) => `${f}(aq, spectator ions)`)
        : [],
    observations: [localPrediction.visualObservation, localPrediction.explanation].filter(Boolean),
    explanation: localPrediction.explanation,
    summaryObservation: localPrediction.visualObservation,
    safetyNotes: localPrediction.safetyNotes,
    targetPH: localPrediction.targetPH ?? 7.0,
    targetTempC: Number((25 + (localPrediction.tempChangeExpected || 0)).toFixed(1)),
    precipitate: localPrediction.isPrecipitateForming,
    precipitateName: localPrediction.precipitateName,
    precipitateColor: localPrediction.precipitateColor,
    gasEvolution: localPrediction.isGasEvolving,
    gasName: localPrediction.gasType,
    solutionColor: localPrediction.solutionColor,
    isColorless: localPrediction.isColorless,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Navigation & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all"
          >
            <ChevronLeftIcon className="w-4 h-4 text-cyan-400" />
            <span>Back to Lab</span>
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold text-cyan-300">
              <SparklesIcon className="w-3 h-3 text-cyan-400" />
              <span>AI Studio & Interactive Reaction Simulator</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Custom Chemistry Experiment Studio
            </h1>
          </div>
        </div>

        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleStartExperiment}
            disabled={isAnalyzing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <PlayIcon className="w-4 h-4" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Start Experiment'}</span>
          </button>

          <button
            type="button"
            onClick={handleLaunchFullWorkbench}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-purple-600/25 hover:bg-purple-600/35 text-purple-200 border border-purple-400/40 transition-all active:scale-95 cursor-pointer"
          >
            <BeakerIcon className="w-4 h-4 text-purple-300" />
            <span>Open Multi-Vessel Workbench</span>
          </button>
        </div>
      </div>

      {/* Status / Error Feedback Banner */}
      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <ShieldAlertIcon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="p-1 rounded-lg hover:bg-rose-900/50 text-rose-300"
            aria-label="Dismiss error"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {statusBanner && !errorMsg && (
        <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          {isMixed && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              Mixed
            </span>
          )}
        </div>
      )}

      {/* Quick Preset Experiments Row */}
      <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-3 sm:p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
          <BookOpenIcon className="w-4 h-4 text-cyan-400" />
          <span>Verified Reaction Presets (Tap to Load)</span>
        </div>
        <div className="flex overflow-x-auto pb-1 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SAMPLE_EXPERIMENTS.map((sample) => (
            <button
              key={sample.title}
              type="button"
              onClick={() => handleLoadPreset(sample)}
              className="text-left p-2.5 min-h-[44px] shrink-0 w-[250px] sm:w-auto rounded-xl bg-slate-950/70 hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-2 cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-200 truncate">{sample.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                Load
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Responsive Laboratory Grid: Left = Beaker & Controls, Right = Chemical Selection & Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (Beaker Visualization + Experiment Controls) — Always Visible on Mobile & Desktop */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/95 to-slate-950 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BeakerIcon className="w-4 h-4 text-cyan-400" />
                <span>Interactive Reaction Beaker</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                250 mL Borosilicate Glassware • Real-Time Phase & Color Simulation
              </p>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs font-bold text-cyan-300">{totalVolumeML} / 250 mL</div>
              <div className="text-[10px] text-slate-400">
                pH {isMixed ? activeOutcomes.targetPH : 7.0} • {isMixed ? activeOutcomes.targetTempC : 25.0}°C
              </div>
            </div>
          </div>

          {/* Beaker SVG Stage */}
          <div className="relative h-64 sm:h-72 rounded-2xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#070d19] to-[#020617] border border-white/10 flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Subtle Bench Surface Line */}
            <div className="absolute bottom-6 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

            <GlasswareSvg
              type="beaker-250"
              volume={Math.min(250, totalVolumeML)}
              maxVolume={250}
              liquidColor={beakerSolutionColor}
              precipitateColor={beakerPrecipitateColor}
              isGasEvolving={beakerGasEvolving}
              isMixing={isMixingAnim}
              isPouring={isPouring}
              pourColor={
                selectedReagents.length > 1
                  ? selectedReagents[selectedReagents.length - 1].colorHex
                  : beakerSolutionColor
              }
              temperature={isMixed ? activeOutcomes.targetTempC : 25}
              width={175}
              height={215}
            />

            {/* Beaker Visual Legend Overlay */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 border border-white/10 text-[11px] text-slate-200 font-medium flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border border-white/40 inline-block"
                  style={{
                    backgroundColor: beakerSolutionColor,
                    opacity: activeOutcomes.isColorless && isMixed ? 0.35 : 0.9,
                  }}
                />
                <span>
                  {selectedReagents.length === 0
                    ? 'Empty Beaker'
                    : !isMixed
                    ? 'Unmixed Reagents'
                    : activeOutcomes.isColorless
                    ? 'Clear, Colorless Solution'
                    : 'Colored Aqueous Solution'}
                </span>
              </span>

              {isMixed && beakerPrecipitateColor && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-cyan-500/40 text-[11px] text-cyan-200 font-semibold flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-sm border border-white/50 inline-block"
                    style={{ backgroundColor: beakerPrecipitateColor }}
                  />
                  <span>Precipitate: {activeOutcomes.precipitateName || 'Solid'}</span>
                </span>
              )}

              {isMixed && !beakerPrecipitateColor && selectedReagents.length >= 2 && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 border border-white/10 text-[11px] text-slate-300">
                  No Precipitate
                </span>
              )}
            </div>
          </div>

          {/* Primary Experiment Control Bar (Mix, Analyze, Stop, Reset) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={handleMixChemicals}
              disabled={selectedReagents.length === 0 || isAnalyzing}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              <DropletsIcon className="w-4 h-4" />
              <span>Mix</span>
            </button>

            <button
              type="button"
              onClick={() => runAnalysis(selectedReagents, guideText)}
              disabled={isAnalyzing || (selectedReagents.length === 0 && !guideText.trim())}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
            </button>

            <button
              type="button"
              onClick={handleStopExperiment}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl font-bold text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 active:scale-95 transition-all cursor-pointer"
            >
              <XIcon className="w-4 h-4" />
              <span>Stop</span>
            </button>

            <button
              type="button"
              onClick={handleResetExperiment}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcwIcon className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Active Reagents in Beaker List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Selected Chemicals ({selectedReagents.length})</span>
              {selectedReagents.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReagents([]);
                    clearStaleResults([]);
                  }}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {selectedReagents.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                No chemicals in beaker. Use the Stockroom selector to add reagents.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {selectedReagents.map((reagent) => (
                  <div
                    key={reagent.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-white/10"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                        style={{
                          backgroundColor: reagent.colorHex,
                          opacity: reagent.isColorless ? 0.3 : 0.9,
                        }}
                        title={reagent.isColorless ? 'Clear, colorless aqueous solution' : reagent.colorHex}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {reagent.formula}{' '}
                          <span className="font-normal text-slate-400">({reagent.name})</span>
                        </div>
                        <div className="text-[11px] font-mono text-cyan-400">
                          {reagent.concentration} • {reagent.volumeML} mL •{' '}
                          {reagent.isColorless ? 'Colorless (aq)' : 'Colored (aq)'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveChemical(reagent.id)}
                      aria-label={`Remove ${reagent.formula}`}
                      className="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-semibold shrink-0 cursor-pointer"
                    >
                      Remove Chemical
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Chemical Stockroom Picker + Procedure Guide + AI Analysis Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stockroom Chemical Selector Card */}
          <form
            onSubmit={handleAddChemical}
            className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <PlusIcon className="w-4 h-4 text-cyan-400" />
                  <span>Add Chemical from Stockroom</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Choose a verified aqueous reagent or enter any chemical formula, concentration, and volume
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Standard Stockroom Reagent
                </label>
                <select
                  value={pickerFormula}
                  onChange={(e) => {
                    setPickerFormula(e.target.value);
                    const found = AVAILABLE_REAGENTS.find((r) => r.formula === e.target.value);
                    if (found) setPickerConc(found.defaultConc);
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {AVAILABLE_REAGENTS.map((r) => (
                    <option key={r.formula} value={r.formula}>
                      {r.formula} — {r.name} ({r.colorDesc})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Or Custom Formula
                </label>
                <input
                  type="text"
                  value={customFormulaInput}
                  onChange={(e) => setCustomFormulaInput(e.target.value)}
                  placeholder="e.g. ZnSO4, CaCl2"
                  className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Conc.
                </label>
                <input
                  type="text"
                  value={pickerConc}
                  onChange={(e) => setPickerConc(e.target.value)}
                  placeholder="0.1 M"
                  className="w-full h-11 px-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Vol (mL)
                </label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={pickerVolume}
                  onChange={(e) => setPickerVolume(Number(e.target.value))}
                  className="w-full h-11 px-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {['ZnSO4', 'NaCl', 'CuSO4', 'NaOH', 'AgNO3', 'FeCl3', 'KSCN', 'KMnO4'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      const entry = createReagentEntry(f, '0.1 M', 50);
                      const next = [...selectedReagents, entry];
                      setSelectedReagents(next);
                      clearStaleResults(next);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/40 text-[11px] font-mono text-slate-200 hover:text-cyan-300 transition-all cursor-pointer"
                  >
                    + {f}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl font-bold text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 transition-all cursor-pointer"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Chemical</span>
              </button>
            </div>
          </form>

          {/* DEDICATED EXPERIMENT RESULTS & AI ANALYSIS SECTION */}
          <section
            aria-label="Experiment Results and AI Analysis"
            className="bg-gradient-to-b from-slate-900/95 to-slate-950 border border-cyan-500/35 rounded-2xl p-5 shadow-xl space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="text-base font-black text-white">
                    Experiment Results & AI Analysis
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Stoichiometric Equation, Ionic Equilibrium, Visual Observations & Safety
                  </p>
                </div>
              </div>

              {/* Reaction Status Badge */}
              <div className="flex items-center gap-2">
                {aiSource && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-800 text-cyan-300 border border-slate-700">
                    {aiSource === 'gemini-api' ? 'Gemini AI + ChemMCP' : 'ChemMCP Verified'}
                  </span>
                )}
                {!activeOutcomes.isDetermined ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Reaction not determined
                  </span>
                ) : activeOutcomes.isReactionExpected ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckIcon className="w-3.5 h-3.5" />
                    <span>Reaction Expected ({activeOutcomes.reactionType})</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    No Net Chemical Reaction
                  </span>
                )}
              </div>
            </div>

            {selectedReagents.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-white/5 text-center text-xs text-slate-400">
                Select at least one chemical reagent above to view reaction equations and AI analysis.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Balanced & Net Ionic Equations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-white/10">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Balanced Chemical Equation
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-bold text-cyan-300 break-words">
                      {activeOutcomes.balancedEquation}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-white/10">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Net Ionic Equation
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-semibold text-purple-300 break-words">
                      {activeOutcomes.netIonicEquation || activeOutcomes.balancedEquation}
                    </div>
                  </div>
                </div>

                {/* Reactants, Products & Visual Appearance Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Expected Products / Species
                    </div>
                    <div className="text-xs text-slate-200 font-medium">
                      {activeOutcomes.products && activeOutcomes.products.length > 0
                        ? activeOutcomes.products.join(', ')
                        : 'Reaction not determined'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Supernatant Solution Color
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-medium">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                        style={{
                          backgroundColor: activeOutcomes.solutionColor || COLORLESS_AQUEOUS_HEX,
                          opacity: activeOutcomes.isColorless ? 0.3 : 0.9,
                        }}
                      />
                      <span>
                        {activeOutcomes.isColorless
                          ? 'Clear, colorless aqueous solution'
                          : `Colored solution (${activeOutcomes.solutionColor})`}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Precipitate & Gas Phase
                    </div>
                    <div className="text-xs text-slate-200 font-medium">
                      {activeOutcomes.precipitate
                        ? `Solid Precipitate: ${activeOutcomes.precipitateName || 'Formed'}`
                        : activeOutcomes.gasEvolution
                        ? `Gas Evolution: ${activeOutcomes.gasName || 'Bubbles'}`
                        : 'Homogeneous Aqueous Phase (No Precipitate / No Gas)'}
                    </div>
                  </div>
                </div>

                {/* Scientific Explanation & Visual Observations */}
                <div className="p-4 rounded-xl bg-cyan-950/25 border border-cyan-500/25 space-y-2">
                  <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Scientific Explanation & Observations
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeOutcomes.explanation || activeOutcomes.summaryObservation}
                  </p>
                  {Array.isArray(activeOutcomes.observations) && activeOutcomes.observations.length > 0 && (
                    <ul className="space-y-1 pt-1">
                      {activeOutcomes.observations.map((obs: string, idx: number) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Safety Notes */}
                {Array.isArray(activeOutcomes.safetyNotes) && activeOutcomes.safetyNotes.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/30">
                    <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <FlameIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Laboratory Safety Notes</span>
                    </div>
                    <ul className="space-y-1">
                      {activeOutcomes.safetyNotes.map((note: string, idx: number) => (
                        <li key={idx} className="text-xs text-amber-100/90 flex items-start gap-2">
                          <span>•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Optional Custom Laboratory Guide Textarea */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="experiment-guide-input"
                className="text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Laboratory Procedure / Notes (Optional)
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {guideText.length} chars
              </span>
            </div>
            <textarea
              id="experiment-guide-input"
              rows={4}
              value={guideText}
              onChange={(e) => setGuideText(e.target.value)}
              placeholder="Describe additional procedure steps or paste your laboratory protocol..."
              className="w-full p-3.5 rounded-xl bg-slate-950/90 border border-white/15 focus:border-cyan-500/60 focus:outline-none text-xs text-slate-100 placeholder-slate-500 font-mono leading-relaxed resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
