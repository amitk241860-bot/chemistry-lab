'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  SparklesIcon,
  BeakerIcon,
  SettingsIcon,
  FlameIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  AtomIcon,
} from '@/components/ui/Icons';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { loadSettings } from '@/lib/settings/settingsStore';
import { CustomExperimentSetup } from '@/app/api/ai/analyze-experiment/route';

interface PrebuiltTemplate {
  name: string;
  category: string;
  equation: string;
  guide: string;
}

const TEMPLATES: PrebuiltTemplate[] = [
  {
    name: 'Precipitation of Silver Chloride',
    category: 'Double Displacement',
    equation: 'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)',
    guide: `Aim: To observe the double displacement precipitation reaction between aqueous Silver Nitrate and Sodium Chloride.
Apparatus: Two 250 mL beakers, glass stirring rod.
Reagents: 50 mL 0.1M AgNO3, 50 mL 0.1M NaCl.
Procedure:
Step 1: Position 50 mL 0.1M Silver Nitrate in the reaction beaker.
Step 2: Add 25 mL of 0.1M Sodium Chloride solution to the Silver Nitrate beaker.
Step 3: Stir the mixture and observe the dense white curdy precipitate of Silver Chloride AgCl(s).`,
  },
  {
    name: 'Barium Sulfate Insoluble Salt',
    category: 'Precipitation',
    equation: 'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s)↓ + 2NaCl(aq)',
    guide: `Aim: To synthesize insoluble Barium Sulfate and determine precipitation efficiency.
Apparatus: 250 mL beaker, 100 mL supply beaker, glass rod.
Reagents: 50 mL 0.1M BaCl2, 50 mL 0.1M Na2SO4.
Procedure:
Step 1: Place 50 mL 0.1M Barium Chloride solution into the main reaction beaker.
Step 2: Pour 25 mL 0.1M Sodium Sulfate solution into the Barium Chloride beaker.
Step 3: Observe the immediate formation of a heavy, opaque chalky white precipitate of BaSO4.`,
  },
  {
    name: 'Exothermic Acid-Base Neutralization',
    category: 'Thermochemistry',
    equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) + ΔH',
    guide: `Aim: To measure the temperature increase during the neutralization of strong acid (HCl) by strong base (NaOH).
Apparatus: Insulated beaker, precision thermometer.
Reagents: 50 mL 1.0M HCl, 50 mL 1.0M NaOH.
Procedure:
Step 1: Place 50 mL of 1.0M Hydrochloric acid in the beaker and record initial ambient temperature (25°C).
Step 2: Carefully add 50 mL of 1.0M Sodium Hydroxide into the acid solution.
Step 3: Observe the temperature rise (~+6.8°C) as neutralization releases heat.`,
  },
  {
    name: 'Golden Rain (Lead Iodide)',
    category: 'Precipitation',
    equation: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)',
    guide: `Aim: To observe the classic Golden Rain crystallization of bright yellow Lead(II) Iodide.
Apparatus: 250 mL reaction beaker, 100 mL supply beaker.
Reagents: 50 mL 0.1M Lead(II) Nitrate, 50 mL 0.1M Potassium Iodide.
Procedure:
Step 1: Place 50 mL 0.1M Pb(NO3)2 solution in the reaction beaker.
Step 2: Add 30 mL 0.1M Potassium Iodide (KI) solution into the beaker.
Step 3: Observe the instant crystallization of brilliant golden-yellow PbI2 precipitate.`,
  },
  {
    name: 'Blood-Red Thiocyanate Complex Ion',
    category: 'Equilibrium',
    equation: 'Fe³⁺(aq) + SCN⁻(aq) ⇌ [Fe(SCN)]²⁺(aq)',
    guide: `Aim: To investigate the chemical equilibrium and color transition of the Iron(III) Thiocyanate complex.
Apparatus: 250 mL beaker, supply beaker, glass rod.
Reagents: 50 mL 0.05M FeCl3 (pale yellow), 50 mL 0.05M KSCN (colorless).
Procedure:
Step 1: Place 50 mL of pale yellow Iron(III) Chloride solution into the reaction beaker.
Step 2: Add 20 mL of Potassium Thiocyanate solution.
Step 3: Observe the dramatic, instantaneous shift to a deep blood-red [Fe(SCN)]2+ complex.`,
  },
];

export default function CustomExperimentStudioPage() {
  const router = useRouter();
  const [guideText, setGuideText] = useState(TEMPLATES[0].guide);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].name);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [activeModel, setActiveModel] = useState('gemini-3.6-flash');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [analysisResult, setAnalysisResult] = useState<CustomExperimentSetup | null>(null);

  useEffect(() => {
    const s = loadSettings();
    setHasApiKey(Boolean(s.geminiApiKey));
    setActiveModel(s.preferredModel || 'gemini-3.6-flash');

    const handleSettingsUpdate = (e: any) => {
      const updated = e.detail;
      setHasApiKey(Boolean(updated.geminiApiKey));
      setActiveModel(updated.preferredModel || 'gemini-3.6-flash');
    };

    window.addEventListener('chemlab-settings-changed', handleSettingsUpdate);
    return () => window.removeEventListener('chemlab-settings-changed', handleSettingsUpdate);
  }, []);

  const handleSelectTemplate = (t: PrebuiltTemplate) => {
    setSelectedTemplate(t.name);
    setGuideText(t.guide);
    setAnalysisResult(null);
    setErrorMsg('');
  };

  const handleAnalyzeWithAI = async () => {
    if (!guideText.trim()) {
      setErrorMsg('Please enter an experiment guide or procedure.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');
    setAnalysisResult(null);

    const s = loadSettings();

    try {
      const res = await fetch('/api/ai/analyze-experiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': s.geminiApiKey || '',
        },
        body: JSON.stringify({
          guide: guideText,
          model: s.preferredModel,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze experiment guide.');
      }

      setAnalysisResult(data.setup);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error occurred during AI experiment analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLaunchExperiment = () => {
    if (!analysisResult) return;
    // Save to sessionStorage so custom lab route can load it
    sessionStorage.setItem('chemlab_active_custom_exp', JSON.stringify(analysisResult));
    router.push('/experiments/custom');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 select-none">
      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Top Header */}
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
                ChemMCP + Gemini AI Studio
              </span>
              <span className="text-xs text-slate-400">Open-Ended Lab Builder</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Create Your Own Virtual Experiment
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Input your lab guide, reagents, and instructions. Google Gemini AI will understand your intent,
              prepare the initial apparatus on the workbench, and guide your steps in real time.
            </p>
          </div>

          {/* Settings & Key Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-xs font-medium text-slate-300 hover:text-white transition shadow-sm"
            >
              <SettingsIcon className="w-4 h-4 text-cyan-400" />
              <span>Lab Settings</span>
              {hasApiKey ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Template Selector Carousel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Quick-Start Experiment Templates
            </h2>
            <span className="text-xs text-slate-400">Click any preset or enter custom procedure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => handleSelectTemplate(t)}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedTemplate === t.name
                    ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div>
                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                    {t.category}
                  </span>
                  <h3 className="text-xs font-bold text-slate-100 leading-snug mb-1">{t.name}</h3>
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate mt-2">{t.equation}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input & AI Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Textarea */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <BeakerIcon className="w-4 h-4 text-cyan-400" />
                  Laboratory Guide / Procedure Input
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {hasApiKey ? `Engine: ${activeModel}` : 'Engine: ChemMCP Local Rules'}
                </span>
              </div>

              <textarea
                rows={11}
                value={guideText}
                onChange={(e) => {
                  setGuideText(e.target.value);
                  setSelectedTemplate('');
                }}
                placeholder="Enter your experiment aim, apparatus, reagents, and procedure steps..."
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-xs md:text-sm text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 leading-relaxed custom-scrollbar transition"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-400">
                  Tip: Include chemical names/formulas (e.g. AgNO3, NaCl, HCl) and step actions.
                </p>

                <button
                  type="button"
                  onClick={handleAnalyzeWithAI}
                  disabled={isAnalyzing || !guideText.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-40 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      <span>AI Analyzing Experiment...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4 text-slate-950" />
                      <span>Analyze & Setup Laboratory</span>
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: AI Setup & Prediction Preview */}
          <div className="lg:col-span-5 space-y-4">
            {analysisResult ? (
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 shadow-xl space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                    <h3 className="text-sm font-bold text-white">AI Experiment Plan Ready</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold uppercase">
                    {analysisResult.reactionType}
                  </span>
                </div>

                {/* Equation & Title */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1">{analysisResult.title}</h4>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                    {analysisResult.equation}
                  </div>
                </div>

                {/* Planned Apparatus */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Planned Workbench Apparatus ({analysisResult.initialApparatus.length})
                  </span>
                  <div className="space-y-1">
                    {analysisResult.initialApparatus.map((item) => (
                      <div
                        key={item.id}
                        className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.volume > 0 && (
                          <span className="text-[10px] font-mono text-cyan-400 shrink-0 ml-2">
                            {item.volume} mL ({item.temperature}°C)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predicted Outcomes */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Predicted Reaction Outcomes
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                    {analysisResult.expectedOutcomes.visualSummary}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysisResult.expectedOutcomes.precipitate && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-500/30">
                        Precipitate Formed
                      </span>
                    )}
                    {analysisResult.expectedOutcomes.gasEvolution && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-950/60 text-sky-300 border border-sky-500/30">
                        Gas Evolution ({analysisResult.expectedOutcomes.gasType})
                      </span>
                    )}
                    {analysisResult.expectedOutcomes.deltaH !== 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-950/60 text-rose-300 border border-rose-500/30">
                        ΔH: {analysisResult.expectedOutcomes.deltaH} kJ/mol
                      </span>
                    )}
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  type="button"
                  onClick={handleLaunchExperiment}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BeakerIcon className="w-4 h-4 text-slate-950" />
                  <span>Launch Interactive Workbench</span>
                </button>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-3 min-h-[360px]">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Awaiting Experiment Guide</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Click &ldquo;Analyze &amp; Setup Laboratory&rdquo; to have AI configure your apparatus, chemicals,
                    and procedure steps automatically.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
