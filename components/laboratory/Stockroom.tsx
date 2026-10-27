'use client';

import React, { useState } from 'react';
import {
  BeakerIcon,
  FlameIcon,
  DropletsIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
} from '@/components/ui/Icons';
import { GlasswareSvg } from './apparatus/GlasswareSvg';
import { playGlassClink, playSnapSound, playStepChime } from '@/lib/audio/sounds';
import {
  loadCustomStockItems,
  saveCustomStockItem,
  removeCustomStockItem,
  CustomStockItem,
} from '@/lib/stockroom/customStockroomStore';
import { loadSettings } from '@/lib/settings/settingsStore';

export interface StockItemDefinition {
  id: string;
  name: string;
  category: 'solutions' | 'glassware' | 'tools';
  type: string;
  subtitle: string;
  volume?: number;
  maxVolume?: number;
  liquidColor?: string;
  pH?: number;
  temperature?: number;
  isInsulated?: boolean;
  species?: Record<string, number>;
  contentsName?: string;
  solidAmount?: number;
  isAiGenerated?: boolean;
}

export const STOCKROOM_CATALOG: StockItemDefinition[] = [
  // --- SOLUTIONS ---
  {
    id: 'sol-water',
    name: 'Distilled Water',
    category: 'solutions',
    type: 'beaker-250',
    subtitle: 'Pure H₂O (100.0 mL, pH 7.00)',
    volume: 100,
    maxVolume: 250,
    liquidColor: '#38bdf8',
    pH: 7.0,
    temperature: 25.0,
    species: { 'H+': 1e-7, 'OH-': 1e-7 },
    contentsName: 'Distilled Water',
  },
  {
    id: 'sol-hcl',
    name: 'Dilute Hydrochloric Acid',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: '0.100 M HCl (50.0 mL, pH 1.00)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#93c5fd',
    pH: 1.0,
    temperature: 25.0,
    species: { 'H+': 0.1, 'Cl-': 0.1, 'OH-': 1e-13 },
    contentsName: '0.100 M HCl',
  },
  {
    id: 'sol-naoh',
    name: 'Dilute Sodium Hydroxide',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: '0.100 M NaOH (50.0 mL, pH 13.00)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#a5f3fc',
    pH: 13.0,
    temperature: 25.0,
    species: { 'Na+': 0.1, 'OH-': 0.1, 'H+': 1e-13 },
    contentsName: '0.100 M NaOH',
  },
  {
    id: 'sol-phenolphthalein',
    name: 'Phenolphthalein Indicator',
    category: 'solutions',
    type: 'dropper-pipette',
    subtitle: 'pH 8.2 - 10.0 Transition Dropper',
    volume: 15,
    maxVolume: 20,
    liquidColor: '#cbd5e1',
    pH: 7.0,
    temperature: 25.0,
    species: { 'HIn': 0.05 },
    contentsName: 'Phenolphthalein Indicator',
  },
  {
    id: 'sol-nacl-aq',
    name: 'Prepared Salt Solution',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: '10% Aqueous NaCl (40.0 mL)',
    volume: 40,
    maxVolume: 100,
    liquidColor: '#e0f2fe',
    pH: 7.0,
    temperature: 25.0,
    species: { 'Na+': 1.71, 'Cl-': 1.71, 'H+': 1e-7, 'OH-': 1e-7 },
    contentsName: 'Aqueous NaCl (10%)',
  },
  {
    id: 'sol-sand-water',
    name: 'Sand-Water Suspension',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: 'Turbid H₂O + SiO₂ Insoluble Sand (50.0 mL)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#d97706',
    pH: 7.0,
    temperature: 25.0,
    species: { 'SiO2(s)': 0.5 },
    contentsName: 'Sand-Water Mixture',
  },
  {
    id: 'sol-cacl2-solid',
    name: 'Solid Calcium Chloride (CaCl₂)',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: 'Anhydrous Pellets (10.0 g, ΔH = -82.8 kJ/mol)',
    volume: 0,
    maxVolume: 100,
    liquidColor: '#ffffff',
    solidAmount: 10.0,
    pH: 7.0,
    temperature: 25.0,
    species: { 'CaCl2(s)': 0.09 },
    contentsName: '10.0 g Solid CaCl₂',
  },
  {
    id: 'sol-nacl-solid',
    name: 'Solid Sodium Chloride (NaCl)',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: 'Cubic Crystals (10.0 g, ΔH = +3.9 kJ/mol)',
    volume: 0,
    maxVolume: 100,
    liquidColor: '#ffffff',
    solidAmount: 10.0,
    pH: 7.0,
    temperature: 25.0,
    species: { 'NaCl(s)': 0.17 },
    contentsName: '10.0 g Solid NaCl',
  },
  {
    id: 'sol-agno3',
    name: 'Silver Nitrate Solution (AgNO₃)',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: '0.100 M AgNO₃ (50.0 mL, Clear)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#e0f2fe',
    pH: 6.8,
    temperature: 25.0,
    species: { 'Ag+': 0.1, 'NO3-': 0.1 },
    contentsName: '0.100 M AgNO₃',
  },
  {
    id: 'sol-bacl2',
    name: 'Barium Chloride Solution (BaCl₂)',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: '0.100 M BaCl₂ (50.0 mL, Clear)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#f0f9ff',
    pH: 7.0,
    temperature: 25.0,
    species: { 'Ba2+': 0.1, 'Cl-': 0.2 },
    contentsName: '0.100 M BaCl₂',
  },
  {
    id: 'sol-na2so4',
    name: 'Sodium Sulfate Solution (Na₂SO₄)',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: '0.100 M Na₂SO₄ (50.0 mL, Clear)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#f8fafc',
    pH: 7.0,
    temperature: 25.0,
    species: { 'Na+': 0.2, 'SO4(2-)': 0.1 },
    contentsName: '0.100 M Na₂SO₄',
  },
  {
    id: 'sol-ki',
    name: 'Potassium Iodide Solution (KI)',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: '0.100 M KI (50.0 mL, Clear)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#fef08a',
    pH: 7.0,
    temperature: 25.0,
    species: { 'K+': 0.1, 'I-': 0.1 },
    contentsName: '0.100 M KI',
  },
  {
    id: 'sol-pb-no3',
    name: 'Lead(II) Nitrate Solution (Pb(NO₃)₂)',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: '0.100 M Pb(NO₃)₂ (50.0 mL, Toxic GHS)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#f1f5f9',
    pH: 4.8,
    temperature: 25.0,
    species: { 'Pb2+': 0.1, 'NO3-': 0.2 },
    contentsName: '0.100 M Pb(NO₃)₂',
  },
  {
    id: 'sol-cuso4',
    name: 'Copper(II) Sulfate (CuSO₄)',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: '0.100 M CuSO₄ (50.0 mL, Deep Cyan Blue)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#0284c7',
    pH: 4.2,
    temperature: 25.0,
    species: { 'Cu2+': 0.1, 'SO4(2-)': 0.1 },
    contentsName: '0.100 M CuSO₄',
  },
  {
    id: 'sol-fecl3',
    name: 'Iron(III) Chloride (FeCl₃)',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: '0.050 M FeCl₃ (50.0 mL, Amber Yellow)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#d97706',
    pH: 2.1,
    temperature: 25.0,
    species: { 'Fe3+': 0.05, 'Cl-': 0.15 },
    contentsName: '0.050 M FeCl₃',
  },
  {
    id: 'sol-kscn',
    name: 'Potassium Thiocyanate (KSCN)',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: '0.050 M KSCN (50.0 mL, Clear)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#f8fafc',
    pH: 6.9,
    temperature: 25.0,
    species: { 'K+': 0.05, 'SCN-': 0.05 },
    contentsName: '0.050 M KSCN',
  },
  {
    id: 'sol-ethanol',
    name: 'Ethanol Reagent (C₂H₅OH 99%)',
    category: 'solutions',
    type: 'beaker-100',
    subtitle: 'Flammable Organic Solvent (50.0 mL)',
    volume: 50,
    maxVolume: 100,
    liquidColor: '#bae6fd',
    pH: 7.0,
    temperature: 25.0,
    species: { 'C2H5OH': 17.1 },
    contentsName: 'Ethanol (99%)',
  },

  // --- GLASSWARE ---
  {
    id: 'gw-beaker-250',
    name: 'Beaker (250 mL)',
    category: 'glassware',
    type: 'beaker-250',
    subtitle: 'Borosilicate Glass with Spout',
    volume: 0,
    maxVolume: 250,
    liquidColor: '#38bdf8',
    pH: 7.0,
    temperature: 25.0,
    species: {},
    contentsName: 'Empty',
  },
  {
    id: 'gw-beaker-100',
    name: 'Beaker (100 mL)',
    category: 'glassware',
    type: 'beaker-100',
    subtitle: 'Graduated Reaction Vessel',
    volume: 0,
    maxVolume: 100,
    liquidColor: '#38bdf8',
    pH: 7.0,
    temperature: 25.0,
    species: {},
    contentsName: 'Empty',
  },
  {
    id: 'gw-conical-flask-250',
    name: 'Conical Flask (250 mL)',
    category: 'glassware',
    type: 'conical-flask-250',
    subtitle: 'Erlenmeyer Titration Flask',
    volume: 0,
    maxVolume: 250,
    liquidColor: '#38bdf8',
    pH: 7.0,
    temperature: 25.0,
    species: {},
    contentsName: 'Empty',
  },
  {
    id: 'gw-test-tube',
    name: 'Test Tube (25 mL)',
    category: 'glassware',
    type: 'test-tube',
    subtitle: 'Rimmed Round-Bottom Tube',
    volume: 0,
    maxVolume: 25,
    liquidColor: '#38bdf8',
    pH: 7.0,
    temperature: 25.0,
    species: {},
    contentsName: 'Empty',
  },
  {
    id: 'gw-cylinder-100',
    name: 'Graduated Cylinder (100 mL)',
    category: 'glassware',
    type: 'cylinder-100',
    subtitle: 'Class A Volumetric Measuring',
    volume: 0,
    maxVolume: 100,
    liquidColor: '#38bdf8',
    pH: 7.0,
    temperature: 25.0,
    species: {},
    contentsName: 'Empty',
  },
  {
    id: 'gw-separatory-funnel',
    name: 'Separatory Funnel (250 mL)',
    category: 'glassware',
    type: 'separatory-funnel',
    subtitle: 'Liquid-Liquid Extraction Valve',
    volume: 0,
    maxVolume: 250,
    liquidColor: '#38bdf8',
    pH: 7.0,
    temperature: 25.0,
    species: {},
    contentsName: 'Empty',
  },
  {
    id: 'gw-gas-syringe',
    name: 'Gas Syringe (100 mL)',
    category: 'glassware',
    type: 'gas-syringe',
    subtitle: 'Frictionless Plunger for Gas Volumes',
    volume: 0,
    maxVolume: 100,
    liquidColor: 'transparent',
    pH: 7.0,
    temperature: 25.0,
    species: {},
    contentsName: 'Airtight Barrel',
  },
  {
    id: 'gw-filter-funnel',
    name: 'Filter Funnel',
    category: 'glassware',
    type: 'filter-funnel',
    subtitle: 'Conical 60° Long Stem Funnel',
    volume: 0,
    maxVolume: 60,
    liquidColor: '#38bdf8',
    pH: 7.0,
    temperature: 25.0,
    species: {},
    contentsName: 'Empty',
  },
  {
    id: 'gw-evaporating-dish',
    name: 'Evaporating Dish',
    category: 'glassware',
    type: 'evaporating-dish',
    subtitle: 'Thermal Glazed Porcelain Basin',
    volume: 0,
    maxVolume: 50,
    liquidColor: '#38bdf8',
    pH: 7.0,
    temperature: 25.0,
    species: {},
    contentsName: 'Empty',
  },
  {
    id: 'gw-burette-50',
    name: 'Graduated Burette (50 mL)',
    category: 'glassware',
    type: 'burette-50',
    subtitle: 'With Precision PTFE Stopcock',
    volume: 50,
    maxVolume: 50,
    liquidColor: '#a5f3fc',
    pH: 13.0,
    temperature: 25.0,
    species: { 'Na+': 0.1, 'OH-': 0.1 },
    contentsName: '0.100 M NaOH Titrant',
  },
  {
    id: 'gw-foam-cup',
    name: 'Insulated Foam Cup',
    category: 'glassware',
    type: 'foam-cup',
    subtitle: 'Polystyrene Adiabatic Calorimeter',
    volume: 0,
    maxVolume: 200,
    liquidColor: '#38bdf8',
    isInsulated: true,
    pH: 7.0,
    temperature: 25.0,
    species: {},
    contentsName: 'Empty',
  },

  // --- TOOLS ---
  {
    id: 'tl-analytical-balance',
    name: 'Digital Analytical Balance',
    category: 'tools',
    type: 'analytical-balance',
    subtitle: '0.001 g Precision Scale with Tare',
  },
  {
    id: 'tl-ph-meter',
    name: 'Digital pH Meter Probe',
    category: 'tools',
    type: 'ph-meter',
    subtitle: 'ATC Glass Electrode Sensor (±0.01 pH)',
  },
  {
    id: 'tl-conductivity-meter',
    name: 'Electrical Conductivity Meter',
    category: 'tools',
    type: 'conductivity-meter',
    subtitle: 'Platinum Dip Cell Sensor (µS/cm)',
  },
  {
    id: 'tl-burner',
    name: 'Bunsen Burner',
    category: 'tools',
    type: 'burner',
    subtitle: 'Adjustable Gas Air Collar & Base',
  },
  {
    id: 'tl-tripod',
    name: 'Tripod & Wire Gauze',
    category: 'tools',
    type: 'tripod',
    subtitle: 'Cast-Iron Stand with Ceramic Mesh',
  },
  {
    id: 'tl-retort-stand',
    name: 'Retort Stand & Clamp',
    category: 'tools',
    type: 'retort-stand',
    subtitle: 'Heavy Base with Adjustable Bosshead',
  },
  {
    id: 'tl-dropper-pipette',
    name: 'Dropper Pipette',
    category: 'tools',
    type: 'dropper-pipette',
    subtitle: 'Precision Calibrated 0.05 mL Dropper',
  },
  {
    id: 'tl-thermometer',
    name: 'Lab Thermometer',
    category: 'tools',
    type: 'thermometer',
    subtitle: '-10°C to 110°C Red Spirit Scale',
  },
  {
    id: 'tl-glass-rod',
    name: 'Glass Stirring Rod',
    category: 'tools',
    type: 'glass-rod',
    subtitle: 'Pyrex Polished Rounded Tip Rod',
  },
  {
    id: 'tl-filter-paper',
    name: 'Qualitative Filter Paper',
    category: 'tools',
    type: 'filter-paper',
    subtitle: 'Circular Medium Porosity Cellulose',
  },
];

export interface StockroomProps {
  isOpen: boolean;
  onToggle: () => void;
  onSpawnItem: (item: StockItemDefinition) => void;
  deployedCount?: number;
  requiredReagents?: string[];
  activeExperimentTitle?: string;
}

export const Stockroom: React.FC<StockroomProps> = ({
  isOpen,
  onToggle,
  onSpawnItem,
  deployedCount = 0,
  requiredReagents = [],
  activeExperimentTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'solutions' | 'glassware' | 'tools' | 'ai-generator'>('solutions');
  const [search, setSearch] = useState('');
  const [customItems, setCustomItems] = useState<CustomStockItem[]>([]);

  // AI Generator local state
  const [generatorCategory, setGeneratorCategory] = useState<'solutions' | 'glassware' | 'tools'>('solutions');
  const [generatorPrompt, setGeneratorPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorStatus, setGeneratorStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Sync custom items on mount and on storage events
  React.useEffect(() => {
    setCustomItems(loadCustomStockItems());

    const handleUpdate = (e: any) => {
      setCustomItems(e.detail || loadCustomStockItems());
    };

    window.addEventListener('chemlab-stockroom-changed', handleUpdate);
    return () => window.removeEventListener('chemlab-stockroom-changed', handleUpdate);
  }, []);

  // Compute all items (standard + custom)
  const allItems = [...customItems, ...STOCKROOM_CATALOG];

  // Detect missing reagents for active experiment
  const missingReagents = requiredReagents.filter((req) => {
    const rLower = req.toLowerCase();
    return !allItems.some((item) =>
      item.name.toLowerCase().includes(rLower) ||
      (item.contentsName && item.contentsName.toLowerCase().includes(rLower)) ||
      item.subtitle.toLowerCase().includes(rLower)
    );
  });

  const filteredItems = allItems.filter((item) => {
    const matchesTab = item.category === activeTab;
    const matchesSearch =
      search.trim() === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleItemClick = (item: StockItemDefinition) => {
    playGlassClink();
    playSnapSound();
    onSpawnItem(item);
  };

  const handleDeleteCustomItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeCustomStockItem(id);
    playSnapSound();
  };

  const handleGenerateCustomItem = async (promptOverride?: string, catOverride?: 'solutions' | 'glassware' | 'tools') => {
    const prompt = (promptOverride || generatorPrompt).trim();
    const category = catOverride || generatorCategory;

    if (!prompt) {
      setGeneratorStatus({
        success: false,
        message: 'Please enter a name or formula for the chemical or equipment.',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratorStatus(null);

    const settings = loadSettings();

    try {
      const res = await fetch('/api/ai/generate-stockroom-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': settings.geminiApiKey || '',
        },
        body: JSON.stringify({
          prompt,
          category,
          model: settings.preferredModel || 'gemini-3.6-flash',
        }),
      });

      const data = await res.json();
      if (res.ok && data.item) {
        saveCustomStockItem(data.item);
        playStepChime();
        setGeneratorStatus({
          success: true,
          message: `Generated "${data.item.name}" successfully! Added to ${category}.`,
        });
        if (!promptOverride) setGeneratorPrompt('');
      } else {
        setGeneratorStatus({
          success: false,
          message: data.error || 'Failed to generate laboratory item.',
        });
      }
    } catch (err: any) {
      setGeneratorStatus({
        success: false,
        message: err?.message || 'Network error while contacting AI generator.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoGenerateMissing = async () => {
    if (missingReagents.length === 0) return;
    setIsGenerating(true);
    setGeneratorStatus(null);

    for (const req of missingReagents) {
      await handleGenerateCustomItem(req, 'solutions');
    }
    setIsGenerating(false);
  };

  return (
    <aside
      className={`fixed lg:absolute top-0 bottom-0 left-0 z-30 transition-all duration-300 ease-in-out flex ${
        isOpen ? 'w-80 sm:w-96' : 'w-12'
      }`}
    >
      {/* Expanded Stockroom Body */}
      {isOpen ? (
        <div className="w-full h-full bg-slate-950/95 backdrop-blur-2xl border-r border-cyan-500/20 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <BeakerIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <span>Stockroom</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    VLab + AI
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Click any item to place on bench</p>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Collapse Stockroom"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar (Only for Solutions / Glassware / Tools) */}
          {activeTab !== 'ai-generator' && (
            <div className="p-3 border-b border-white/5">
              <div className="relative flex items-center">
                <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search solutions, glassware, tools..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>
          )}

          {/* 4 Stockroom Tabs (Solutions | Glassware | Tools | AI Studio) */}
          <div className="flex border-b border-white/10 bg-slate-900/50 p-1 gap-1">
            <button
              onClick={() => setActiveTab('solutions')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === 'solutions'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <DropletsIcon className="w-3 h-3" />
              <span>Sol</span>
            </button>

            <button
              onClick={() => setActiveTab('glassware')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === 'glassware'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BeakerIcon className="w-3 h-3" />
              <span>Glass</span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === 'tools'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FlameIcon className="w-3 h-3" />
              <span>Tools</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-generator')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === 'ai-generator'
                  ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                  : 'text-cyan-400/80 hover:text-cyan-300 hover:bg-slate-800/50'
              }`}
            >
              <SparklesIcon className="w-3 h-3 text-cyan-300" />
              <span>AI Create</span>
            </button>
          </div>

          {/* Missing Reagents Alert Banner (if experiment has unfulfilled reagents) */}
          {missingReagents.length > 0 && activeTab !== 'ai-generator' && (
            <div className="mx-3 mt-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1 text-[11px]">
                  <span>⚡ Missing Experiment Reagents:</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/60 font-mono">
                  {missingReagents.length} missing
                </span>
              </div>
              <p className="text-[10px] text-amber-300/80 line-clamp-1">
                {missingReagents.join(', ')}
              </p>
              <button
                onClick={() => {
                  setActiveTab('ai-generator');
                  setGeneratorPrompt(missingReagents[0] || '');
                }}
                className="w-full mt-1 py-1 text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg border border-amber-500/40 transition flex items-center justify-center gap-1"
              >
                <SparklesIcon className="w-3 h-3" />
                <span>Generate with AI Now</span>
              </button>
            </div>
          )}

          {/* AI Generator Tab View */}
          {activeTab === 'ai-generator' ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/40 to-purple-950/40 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Generate Laboratory Reagent & Apparatus</span>
                  </h4>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-300 font-mono">
                    Gemini 3.6 Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Type any chemical solution, custom glassware, or lab tool. AI will formulate authentic physics, pH, color, and molarities.
                </p>

                {/* Category selector */}
                <div className="flex bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
                  {(['solutions', 'glassware', 'tools'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGeneratorCategory(cat)}
                      className={`flex-1 py-1 text-[11px] font-semibold rounded-md capitalize transition ${
                        generatorCategory === cat
                          ? 'bg-cyan-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat === 'solutions' ? '🧪 Solution' : cat === 'glassware' ? '🥛 Glassware' : '⚙️ Tool'}
                    </button>
                  ))}
                </div>

                {/* Text input */}
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={generatorPrompt}
                    onChange={(e) => setGeneratorPrompt(e.target.value)}
                    placeholder={
                      generatorCategory === 'solutions'
                        ? 'e.g. 0.5 M Potassium Permanganate (KMnO₄)'
                        : generatorCategory === 'glassware'
                        ? 'e.g. 250 mL Round Bottom Boiling Flask'
                        : 'e.g. Magnetic Stirrer with Hotplate'
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGenerateCustomItem();
                    }}
                  />

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(generatorCategory === 'solutions'
                      ? [
                          '0.1 M KMnO₄ (Purple)',
                          '0.1 M K₂Cr₂O₇ (Orange)',
                          '0.5 M FeSO₄ (Green)',
                          '1.0 M H₂SO₄ (Acid)',
                          '0.1 M CoCl₂ (Pink)',
                          '1.0 M NH₃ (Ammonia)',
                        ]
                      : generatorCategory === 'glassware'
                      ? [
                          'Round Bottom Flask 250mL',
                          'Volumetric Flask 100mL',
                          'Separatory Funnel 125mL',
                          'Gas Syringe 100mL',
                        ]
                      : [
                          'Magnetic Stirrer Hotplate',
                          'Digital Colorimeter',
                          'Laboratory Stopwatch',
                          'Spectrophotometer',
                        ]
                    ).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setGeneratorPrompt(chip)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40 transition"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => handleGenerateCustomItem()}
                  disabled={isGenerating || !generatorPrompt.trim()}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 disabled:opacity-40 transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/40"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                      <span>Synthesizing with AI...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-3.5 h-3.5" />
                      <span>Synthesize & Add to Stockroom</span>
                    </>
                  )}
                </button>

                {/* Feedback status */}
                {generatorStatus && (
                  <div
                    className={`p-2.5 rounded-lg text-[11px] border flex items-center justify-between ${
                      generatorStatus.success
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <span>{generatorStatus.message}</span>
                  </div>
                )}
              </div>

              {/* Missing Reagents Auto-Generate Batch Box */}
              {missingReagents.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                      <span>⚡ Auto-Generate for Active Experiment</span>
                    </h5>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-900/50 px-1.5 py-0.5 rounded">
                      {missingReagents.length} missing
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/80">
                    The active experiment requires: <strong>{missingReagents.join(', ')}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleAutoGenerateMissing}
                    disabled={isGenerating}
                    className="w-full py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-1.5"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Generate All Missing Reagents</span>
                  </button>
                </div>
              )}

              {/* Your AI-Generated Items Gallery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <span>Your Custom Generated Items</span>
                    <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950">
                      {customItems.length}
                    </span>
                  </h5>
                </div>

                {customItems.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    No custom items generated yet. Use the prompt above to create any reagent or glassware!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="group relative flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/70 border border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-800/80 transition-all cursor-pointer shadow-sm"
                      >
                        <div className="w-10 h-12 shrink-0 bg-slate-950/80 rounded-lg flex items-center justify-center border border-white/5 p-1">
                          <GlasswareSvg
                            type={item.type}
                            volume={item.volume ?? 0}
                            maxVolume={item.maxVolume ?? 100}
                            liquidColor={item.liquidColor ?? '#38bdf8'}
                            showGraduations={false}
                            width={32}
                            height={40}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {item.name}
                            </h4>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shrink-0">
                              AI
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomItem(e, item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                            title="Delete custom item"
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                            <PlusIcon className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Standard Items List (Solutions | Glassware | Tools) */
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
              {/* Quick AI Trigger Banner */}
              <button
                type="button"
                onClick={() => {
                  setGeneratorCategory(activeTab);
                  setActiveTab('ai-generator');
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                  <span className="text-xs font-semibold text-slate-200">
                    Need a custom {activeTab.slice(0, -1)}?
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400 font-medium group-hover:underline">
                  Generate with AI →
                </span>
              </button>

              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No items match &quot;{search}&quot;
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`group relative flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] ${
                      item.isAiGenerated
                        ? 'bg-slate-900/80 border border-cyan-500/40 hover:border-cyan-400 hover:bg-slate-800'
                        : 'bg-slate-900/60 border border-white/5 hover:border-cyan-500/40 hover:bg-slate-800/80'
                    }`}
                  >
                    {/* Miniature Vector Preview */}
                    <div className="w-12 h-14 shrink-0 bg-slate-950/80 rounded-lg flex items-center justify-center border border-white/5 p-1 group-hover:border-cyan-400/30 transition-colors">
                      <GlasswareSvg
                        type={item.type}
                        volume={item.volume ?? 0}
                        maxVolume={item.maxVolume ?? 100}
                        liquidColor={item.liquidColor ?? '#38bdf8'}
                        showGraduations={false}
                        width={38}
                        height={48}
                      />
                    </div>

                    {/* Item Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {item.name}
                        </h4>
                        {item.isAiGenerated && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shrink-0">
                            ✨ AI
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.subtitle}
                      </p>
                      {item.volume !== undefined && item.volume > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                            {item.volume} mL
                          </span>
                          {item.pH !== undefined && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              pH {item.pH.toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {item.isAiGenerated && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomItem(e, item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                          title="Delete custom item"
                        >
                          <Trash2Icon className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                        <PlusIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer Status */}
          <div className="p-3 border-t border-white/10 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-400">
            <span>Deployed on bench:</span>
            <span className="font-semibold text-cyan-300">{deployedCount} items</span>
          </div>
        </div>
      ) : (
        /* Collapsed Tab Strip */
        <button
          onClick={onToggle}
          className="h-full w-12 bg-slate-950/80 hover:bg-slate-900 border-r border-cyan-500/20 backdrop-blur-xl flex flex-col items-center py-6 justify-between transition-colors group cursor-pointer"
          title="Open Stockroom (Solutions, Glassware, Tools, AI Studio)"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
              <BeakerIcon className="w-4 h-4" />
            </div>
            <div className="writing-vertical-rl text-xs font-bold tracking-widest text-slate-300 group-hover:text-cyan-300 uppercase rotate-180">
              Stockroom
            </div>
          </div>

          <ChevronRightIcon className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </aside>
  );
};

