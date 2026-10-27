'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { Experiment, ObservationRow } from '@/types/experiment';
import { GlasswareSvg } from './apparatus/GlasswareSvg';
import { Stockroom, type StockItemDefinition } from './Stockroom';
import { SolutionInfoPanel, type SelectedVesselData } from './SolutionInfoPanel';
import { TransferModal } from './TransferModal';
import { ProcedurePanel } from './ProcedurePanel';
import { AiWorkbenchAssistant } from './AiWorkbenchAssistant';
import {
  SparklesIcon,
  RotateCcwIcon,
  FlameIcon,
  DropletsIcon,
  Volume2Icon,
  VolumeXIcon,
  BookOpenIcon,
  BeakerIcon,
  CheckIcon,
  MoreVerticalIcon,
  MaximizeIcon,
  MinimizeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldAlertIcon,
  XIcon,
  SettingsIcon,
} from '@/components/ui/Icons';
import { SettingsModal } from '@/components/settings/SettingsModal';
import type { CustomExperimentSetup } from '@/app/api/ai/analyze-experiment/route';
import { predictReaction } from '@/lib/chemistry/chemmcpEngine';
import {
  playGlassClink,
  playBurnerSound,
  playPouringSound,
  playDropSound,
  playStopcockClick,
  playFizzSound,
  playSnapSound,
  playStepChime,
  playCompletionFanfare,
} from '@/lib/audio/sounds';

export interface WorkbenchItem {
  id: string;
  name: string;
  type: string;
  x: number; // Pixels from left of bench
  y: number; // Pixels from top of bench
  volume: number; // mL
  maxVolume: number; // mL
  temperature: number; // °C
  isInsulated?: boolean;
  liquidColor: string;
  pH: number;
  species: Record<string, number>;
  contentsName: string;
  solidAmount?: number;
  isHeating?: boolean;
  stopcockOpen?: boolean;
  hasFilterPaper?: boolean;
  hasResidue?: boolean;
  hasSaltCrust?: boolean;
  thermalRate?: number; // °C/s (+ when heating, - when cooling)
}

interface NobookWorkbenchProps {
  experiment: Experiment;
  onExit?: () => void;
  customSetup?: CustomExperimentSetup;
}

// Extract chemical formula from vessel name, contentsName, or species
export function extractChemicalFormula(item: WorkbenchItem): string {
  const text = `${item.name} ${item.contentsName} ${Object.keys(item.species).join(' ')}`.toLowerCase();
  if (text.includes('agno3') || text.includes('silver')) return 'AgNO3';
  if (text.includes('nacl') || text.includes('sodium chloride') || text.includes('salt solution')) return 'NaCl';
  if (text.includes('bacl2') || text.includes('barium')) return 'BaCl2';
  if (text.includes('na2so4') || text.includes('sodium sulfate')) return 'Na2SO4';
  if (text.includes('pb(no3)2') || text.includes('lead')) return 'Pb(NO3)2';
  if (text.includes('ki') || text.includes('potassium iodide')) return 'KI';
  if (text.includes('fecl3') || text.includes('iron(iii)')) return 'FeCl3';
  if (text.includes('kscn') || text.includes('thiocyanate')) return 'KSCN';
  if (text.includes('hcl') || text.includes('hydrochloric')) return 'HCl';
  if (text.includes('naoh') || text.includes('sodium hydroxide')) return 'NaOH';
  if (text.includes('cuso4') || text.includes('copper')) return 'CuSO4';
  if (text.includes('feso4') || text.includes('iron(ii)')) return 'FeSO4';
  if (text.includes('kmno4') || text.includes('permanganate')) return 'KMnO4';
  if (text.includes('zn') || text.includes('zinc')) return 'Zn';
  if (text.includes('h2so4') || text.includes('sulfuric')) return 'H2SO4';
  if (text.includes('cacl2') || text.includes('calcium chloride')) return 'CaCl2';
  if (text.includes('fe ') || text.includes('iron nail') || text.includes('iron metal')) return 'Fe';
  if (text.includes('nh4cl') || text.includes('ammonium chloride')) return 'NH4Cl';
  if (text.includes('ch3cooh') || text.includes('acetic') || text.includes('vinegar')) return 'CH3COOH';
  if (text.includes('na2co3') || text.includes('sodium carbonate')) return 'Na2CO3';
  if (text.includes('nahco3') || text.includes('bicarbonate') || text.includes('baking soda')) return 'NaHCO3';
  return '';
}

// Clean vessel display name: strips placeholder words like "Reagent Beaker" / "Reaction Beaker"
// and ensures the actual chemical compound name is displayed prominently!
export function getCleanCompoundName(item: WorkbenchItem): string {
  // Empty vessels
  if (
    item.volume === 0 &&
    (!item.contentsName || item.contentsName === 'Empty' || item.contentsName === 'Empty Receiver' || item.contentsName === 'Empty Container')
  ) {
    if (item.type === 'beaker-250') return 'Empty Beaker (250 mL)';
    if (item.type === 'beaker-100') return 'Empty Beaker (100 mL)';
    if (item.type === 'conical-flask-250') return 'Empty Flask (250 mL)';
    if (item.type === 'test-tube') return 'Empty Test Tube';
    if (item.type === 'evaporating-dish') return 'Evaporating Dish';
    if (item.type === 'filter-funnel') return 'Filter Funnel';
    if (item.type === 'burette-50') return 'Empty Burette (50 mL)';
    if (item.type === 'foam-cup') return 'Insulated Cup';
    if (item.type === 'burner') return 'Bunsen Burner';
    if (item.type === 'tripod') return 'Tripod & Wire Gauze';
    if (item.type === 'filter-paper') return 'Filter Paper';
    if (item.type === 'thermometer') return 'Lab Thermometer';
    if (item.type === 'dropper-pipette') return 'Dropper Pipette';
    return item.name;
  }

  let raw = item.name || item.contentsName || '';

  // If raw name is generic placeholder ("Reagent Beaker", etc.) and contentsName contains the compound, prefer contentsName!
  const isGeneric = /^(reagent|reaction|supply|receiving)?\s*(beaker|flask|container|vessel)?(\s*\([^\)]*\))?$/i.test(raw.trim());
  if (isGeneric && item.contentsName && !/^(empty|container|receiver)$/i.test(item.contentsName.trim())) {
    raw = item.contentsName;
  }

  // Extract from "contains 50 mL 0.1M AgNO3"
  if (raw.includes('contains')) {
    const match = raw.match(/contains\s+([^)]+)/i);
    if (match && match[1]) {
      raw = match[1].replace(/^\d+(\.\d+)?\s*mL\s*/i, '').trim();
    }
  }

  // Strip placeholder words like "Reagent Beaker", "Reaction Beaker", "Supply Beaker", "Reagent 1 Container"
  let cleaned = raw
    .replace(/^Reaction\s*Beaker\s*:?\s*/i, '')
    .replace(/^Reagent\s*Beaker\s*:?\s*/i, '')
    .replace(/^Supply\s*Beaker\s*:?\s*/i, '')
    .replace(/^Reagent\s*\d*\s*Container\s*:?\s*/i, '')
    .replace(/^Receiving\s*Beaker\s*\(([^)]+)\)/i, 'Empty Beaker ($1)')
    .replace(/^Beaker\s*[A-Z]?\s*\(([^)]+)\)/i, '$1')
    .trim();

  if (!cleaned || cleaned.toLowerCase() === 'beaker' || cleaned.toLowerCase() === 'reagent' || cleaned.toLowerCase() === 'reagent beaker') {
    if (item.contentsName && item.contentsName !== 'Empty' && item.contentsName !== 'Empty Container') {
      return item.contentsName;
    }
    const speciesKeys = Object.keys(item.species || {}).filter((k) => k !== 'H+' && k !== 'OH-');
    if (speciesKeys.length > 0) {
      return speciesKeys.join(' / ') + ' Solution';
    }
    return item.name;
  }

  return cleaned;
}

// Centered, well-spaced initial setups tailored to each experiment
function getInitialSetupForExperiment(
  experiment: Experiment,
  customSetup?: CustomExperimentSetup
): WorkbenchItem[] {
  if (customSetup && customSetup.initialApparatus && customSetup.initialApparatus.length > 0) {
    return customSetup.initialApparatus.map((a) => {
      let cleanName = a.name;
      if (cleanName.includes('contains')) {
        const m = cleanName.match(/contains\s+([^)]+)/i);
        if (m && m[1]) cleanName = m[1].replace(/^\d+(\.\d+)?\s*mL\s*/i, '').trim();
      }
      cleanName = cleanName
        .replace(/^Reaction\s*Beaker\s*:?\s*/i, '')
        .replace(/^Reagent\s*Beaker\s*:?\s*/i, '')
        .replace(/^Supply\s*Beaker\s*:?\s*/i, '')
        .replace(/^Reagent\s*\d*\s*Container\s*:?\s*/i, '')
        .trim();

      if (
        !cleanName ||
        cleanName.toLowerCase() === 'beaker' ||
        cleanName.toLowerCase() === 'reagent' ||
        cleanName.toLowerCase() === 'reagent beaker' ||
        cleanName.toLowerCase() === 'reaction beaker' ||
        cleanName.toLowerCase() === 'supply beaker'
      ) {
        if (a.volume > 0 && a.activeChemicals && a.activeChemicals.length > 0) {
          cleanName = a.activeChemicals.join(' + ') + ' Solution';
        } else if (a.volume === 0) {
          cleanName = `Empty Beaker (${a.maxVolume || 250} mL)`;
        }
      }

      return {
        id: a.id,
        name: cleanName || a.name,
        type: a.type,
        x: a.x,
        y: a.y,
        volume: a.volume,
        maxVolume: a.maxVolume,
        temperature: a.temperature || 25.0,
        liquidColor: a.liquidColor || '#38bdf8',
        pH: a.ph || 7.0,
        species: (a.activeChemicals || []).reduce((acc, curr) => ({ ...acc, [curr]: 0.1 }), {}),
        contentsName: cleanName || a.name,
        isHeating: a.isHeating,
        hasFilterPaper: a.hasFilterPaper,
        hasResidue: a.hasResidue,
      };
    });
  }

  const id = experiment.id;

  if (id === 'exp-heat-water') {
    return [
      {
        id: 'tt-1',
        name: 'Test Tube with Water',
        type: 'test-tube',
        x: 480,
        y: 150,
        volume: 15,
        maxVolume: 25,
        temperature: 25.0,
        liquidColor: '#38bdf8',
        pH: 7.0,
        species: { 'H+': 1e-7, 'OH-': 1e-7 },
        contentsName: 'Distilled Water (15 mL)',
      },
      {
        id: 'burner-1',
        name: 'Bunsen Burner',
        type: 'burner',
        x: 320,
        y: 300,
        volume: 0,
        maxVolume: 0,
        temperature: 25.0,
        liquidColor: '#38bdf8',
        pH: 7.0,
        species: {},
        contentsName: 'Methane Gas Burner',
        isHeating: false,
      },
      {
        id: 'therm-1',
        name: 'Lab Thermometer',
        type: 'thermometer',
        x: 660,
        y: 160,
        volume: 0,
        maxVolume: 0,
        temperature: 25.0,
        liquidColor: '#ef4444',
        pH: 7.0,
        species: {},
        contentsName: 'Spirit Thermometer',
      },
    ];
  }

  if (id === 'exp-filtration') {
    return [
      {
        id: 'beaker-rec',
        name: 'Receiving Beaker (250 mL)',
        type: 'beaker-250',
        x: 480,
        y: 280,
        volume: 0,
        maxVolume: 250,
        temperature: 25.0,
        liquidColor: '#38bdf8',
        pH: 7.0,
        species: {},
        contentsName: 'Empty Receiver',
      },
      {
        id: 'funnel-1',
        name: 'Glass Filter Funnel',
        type: 'filter-funnel',
        x: 480,
        y: 160,
        volume: 0,
        maxVolume: 60,
        temperature: 25.0,
        liquidColor: '#38bdf8',
        pH: 7.0,
        species: {},
        contentsName: 'Conical Funnel',
        hasFilterPaper: false,
      },
      {
        id: 'paper-1',
        name: 'Filter Paper',
        type: 'filter-paper',
        x: 280,
        y: 220,
        volume: 0,
        maxVolume: 0,
        temperature: 25.0,
        liquidColor: '#ffffff',
        pH: 7.0,
        species: {},
        contentsName: 'Folded Paper Cone',
      },
      {
        id: 'sand-mix',
        name: 'Sand-Water Suspension',
        type: 'beaker-100',
        x: 680,
        y: 220,
        volume: 50,
        maxVolume: 100,
        temperature: 25.0,
        liquidColor: '#d97706',
        pH: 7.0,
        species: { 'SiO2(s)': 0.5 },
        contentsName: 'Turbid Sand-Water',
      },
    ];
  }

  if (id === 'exp-evaporation') {
    return [
      {
        id: 'tripod-1',
        name: 'Tripod & Wire Gauze',
        type: 'tripod',
        x: 480,
        y: 240,
        volume: 0,
        maxVolume: 0,
        temperature: 25.0,
        liquidColor: '#38bdf8',
        pH: 7.0,
        species: {},
        contentsName: 'Iron Stand with Mesh',
      },
      {
        id: 'dish-1',
        name: 'Evaporating Dish',
        type: 'evaporating-dish',
        x: 480,
        y: 160,
        volume: 30,
        maxVolume: 50,
        temperature: 25.0,
        liquidColor: '#e0f2fe',
        pH: 7.0,
        species: { 'Na+': 1.71, 'Cl-': 1.71 },
        contentsName: '10% Salt Solution',
        hasSaltCrust: false,
      },
      {
        id: 'burner-1',
        name: 'Bunsen Burner',
        type: 'burner',
        x: 300,
        y: 310,
        volume: 0,
        maxVolume: 0,
        temperature: 25.0,
        liquidColor: '#38bdf8',
        pH: 7.0,
        species: {},
        contentsName: 'Methane Gas Burner',
        isHeating: false,
      },
    ];
  }

  if (id === 'exp-acid-base-indicator') {
    return [
      {
        id: 'beaker-acid',
        name: 'Beaker A (0.1M HCl)',
        type: 'beaker-100',
        x: 360,
        y: 220,
        volume: 25,
        maxVolume: 100,
        temperature: 25.0,
        liquidColor: '#93c5fd',
        pH: 1.0,
        species: { 'H+': 0.1, 'Cl-': 0.1, 'OH-': 1e-13 },
        contentsName: '0.100 M HCl',
      },
      {
        id: 'beaker-base',
        name: 'Beaker B (0.1M NaOH)',
        type: 'beaker-100',
        x: 560,
        y: 220,
        volume: 25,
        maxVolume: 100,
        temperature: 25.0,
        liquidColor: '#a5f3fc',
        pH: 13.0,
        species: { 'Na+': 0.1, 'OH-': 0.1, 'H+': 1e-13 },
        contentsName: '0.100 M NaOH',
      },
      {
        id: 'drop-ph',
        name: 'Phenolphthalein Dropper',
        type: 'dropper-pipette',
        x: 760,
        y: 180,
        volume: 15,
        maxVolume: 20,
        temperature: 25.0,
        liquidColor: '#cbd5e1',
        pH: 7.0,
        species: { 'HIn': 0.05 },
        contentsName: 'Indicator Dropper',
      },
    ];
  }

  if (id === 'exp-titration') {
    return [
      {
        id: 'stand-1',
        name: 'Retort Stand & Clamp',
        type: 'retort-stand',
        x: 460,
        y: 90,
        volume: 0,
        maxVolume: 0,
        temperature: 25.0,
        liquidColor: '#38bdf8',
        pH: 7.0,
        species: {},
        contentsName: 'Apparatus Stand',
      },
      {
        id: 'burette-1',
        name: '50 mL Burette (0.1M NaOH)',
        type: 'burette-50',
        x: 490,
        y: 60,
        volume: 50,
        maxVolume: 50,
        temperature: 25.0,
        liquidColor: '#a5f3fc',
        pH: 13.0,
        species: { 'Na+': 0.1, 'OH-': 0.1 },
        contentsName: '0.100 M NaOH Titrant',
        stopcockOpen: false,
      },
      {
        id: 'flask-analyte',
        name: 'Conical Flask (Analyte)',
        type: 'conical-flask-250',
        x: 490,
        y: 290,
        volume: 25,
        maxVolume: 250,
        temperature: 25.0,
        liquidColor: '#93c5fd',
        pH: 1.0,
        species: { 'H+': 0.1, 'Cl-': 0.1, 'OH-': 1e-13, 'HIn': 0.001 },
        contentsName: '25 mL 0.1M HCl + Phenolphthalein',
      },
    ];
  }

  // Default: Camping Problem I (Thermochemistry)
  return [
    {
      id: 'cup-calorimeter',
      name: 'Insulated Foam Cup',
      type: 'foam-cup',
      x: 440,
      y: 200,
      volume: 100,
      maxVolume: 200,
      temperature: 25.0,
      isInsulated: true,
      liquidColor: '#38bdf8',
      pH: 7.0,
      species: { 'H+': 1e-7, 'OH-': 1e-7 },
      contentsName: '100.0 mL Distilled Water',
    },
    {
      id: 'salt-cacl2',
      name: 'Solid CaCl₂ (10.0 g)',
      type: 'beaker-100',
      x: 660,
      y: 220,
      volume: 0,
      maxVolume: 100,
      temperature: 25.0,
      liquidColor: '#ffffff',
      solidAmount: 10.0,
      pH: 7.0,
      species: { 'CaCl2(s)': 0.09 },
      contentsName: '10.0 g Anhydrous CaCl₂',
    },
    {
      id: 'therm-1',
      name: 'Lab Thermometer',
      type: 'thermometer',
      x: 240,
      y: 200,
      volume: 0,
      maxVolume: 0,
      temperature: 25.0,
      liquidColor: '#ef4444',
      pH: 7.0,
      species: {},
      contentsName: 'Spirit Thermometer',
    },
  ];
}

export const NobookWorkbench: React.FC<NobookWorkbenchProps> = ({
  experiment,
  onExit,
  customSetup,
}) => {
  const benchRef = useRef<HTMLDivElement | null>(null);

  // Bench Apparatus Items
  const [items, setItems] = useState<WorkbenchItem[]>(() =>
    getInitialSetupForExperiment(experiment, customSetup)
  );

  // Selected Vessel for Info Panel
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const setup = getInitialSetupForExperiment(experiment, customSetup);
    const firstLiquid = setup.find((i) => i.volume > 0) || setup[0];
    return firstLiquid ? firstLiquid.id : null;
  });

  // Drawers and Menus: Default CLOSED so the background reaction sheet has 100% full space!
  const [isStockroomOpen, setIsStockroomOpen] = useState<boolean>(false);
  const [isProcedureOpen, setIsProcedureOpen] = useState<boolean>(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState<boolean>(false);
  const [isThreeDotMenuOpen, setIsThreeDotMenuOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // User's custom experiment flag: AI Co-Pilot is ONLY active when user makes their own experiment!
  const isCustomExperiment = Boolean(customSetup || experiment.id === 'exp-custom');
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  // Live AI Step Validation Notification Banner
  const [aiNotification, setAiNotification] = useState<{
    title: string;
    message: string;
    type?: 'success' | 'warning' | 'hint';
  } | null>(null);

  useEffect(() => {
    if (aiNotification) {
      const timer = setTimeout(() => setAiNotification(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [aiNotification]);

  // Transfer Modal states
  const [transferState, setTransferState] = useState<{
    isOpen: boolean;
    sourceId: string | null;
    destId: string | null;
  }>({
    isOpen: false,
    sourceId: null,
    destId: null,
  });

  // Procedure Progress & Steps
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [observations, setObservations] = useState<ObservationRow[]>([]);
  const [validationAlert, setValidationAlert] = useState<string | null>(null);

  // Dragging apparatus state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Get active selected vessel data
  const selectedVessel: SelectedVesselData | null = React.useMemo(() => {
    const it = items.find((i) => i.id === selectedId);
    if (!it) return null;
    return {
      id: it.id,
      name: getCleanCompoundName(it),
      type: it.type,
      volume: it.volume,
      maxVolume: it.maxVolume,
      temperature: it.temperature,
      pH: it.pH,
      species: it.species,
      isInsulated: it.isInsulated,
      liquidColor: it.liquidColor,
      solidAmount: it.solidAmount,
      contentsName: it.contentsName,
    };
  }, [items, selectedId]);

  // Record an observation row if not duplicate
  const recordObservation = useCallback((param: string, val: string, unit?: string) => {
    setObservations((prev) => {
      const exists = prev.some((o) => o.parameter === param);
      if (exists) {
        return prev.map((o) => (o.parameter === param ? { ...o, value: val, unit } : o));
      }
      return [...prev, { parameter: param, value: val, unit }];
    });
  }, []);

  // Proximity Detection & Snapping logic
  const checkProximityAndSnap = useCallback((draggedItem: WorkbenchItem, currentItems: WorkbenchItem[]): WorkbenchItem[] => {
    let updated = [...currentItems];
    const snapDistance = 75;

    // 1. Burner dragged near Tripod -> Snaps under tripod!
    if (draggedItem.type === 'burner') {
      const tripod = updated.find((i) => i.type === 'tripod');
      if (tripod) {
        const dx = Math.abs(draggedItem.x - tripod.x);
        const dy = Math.abs(draggedItem.y - (tripod.y + 40));
        if (dx < snapDistance && dy < snapDistance) {
          playSnapSound();
          draggedItem.x = tripod.x;
          draggedItem.y = tripod.y + 45;
          draggedItem.isHeating = true;
          playBurnerSound();
        }
      }
    }

    // 2. Evaporating Dish or Beaker dragged near Tripod -> Snaps on top of wire gauze
    if (draggedItem.type === 'evaporating-dish' || draggedItem.type.startsWith('beaker')) {
      const tripod = updated.find((i) => i.type === 'tripod');
      if (tripod) {
        const dx = Math.abs(draggedItem.x - tripod.x);
        const dy = Math.abs(draggedItem.y - (tripod.y - 70));
        if (dx < snapDistance && dy < snapDistance) {
          playSnapSound();
          draggedItem.x = tripod.x;
          draggedItem.y = tripod.y - 70;
        }
      }
    }

    // 3. Funnel dragged near Beaker -> Snaps into beaker rim
    if (draggedItem.type === 'filter-funnel') {
      const beaker = updated.find((i) => i.type.startsWith('beaker'));
      if (beaker) {
        const dx = Math.abs(draggedItem.x - beaker.x);
        const dy = Math.abs(draggedItem.y - (beaker.y - 80));
        if (dx < snapDistance && dy < snapDistance) {
          playSnapSound();
          draggedItem.x = beaker.x;
          draggedItem.y = beaker.y - 80;
        }
      }
    }

    // 4. Filter Paper dragged near Funnel -> Seats in funnel cone
    if (draggedItem.type === 'filter-paper') {
      const funnel = updated.find((i) => i.type === 'filter-funnel');
      if (funnel) {
        const dx = Math.abs(draggedItem.x - funnel.x);
        const dy = Math.abs(draggedItem.y - funnel.y);
        if (dx < snapDistance && dy < snapDistance) {
          playSnapSound();
          funnel.hasFilterPaper = true;
          updated = updated.filter((i) => i.id !== draggedItem.id);
          recordObservation('Filter Paper Status', 'Quarter-folded cone snugly fitted inside funnel');
          return updated;
        }
      }
    }

    // 5. Conical Flask dragged near Burette -> Snaps beneath tip
    if (draggedItem.type.includes('conical-flask') || draggedItem.type.includes('flask')) {
      const burette = updated.find((i) => i.type.startsWith('burette'));
      if (burette) {
        const dx = Math.abs(draggedItem.x - burette.x);
        const dy = Math.abs(draggedItem.y - (burette.y + 180));
        if (dx < snapDistance && dy < snapDistance) {
          playSnapSound();
          draggedItem.x = burette.x;
          draggedItem.y = burette.y + 180;
        }
      }
    }

    // 6. Dragging Vessel A onto Vessel B -> Trigger Transfer Dialog!
    const targetVessel = updated.find(
      (other) =>
        other.id !== draggedItem.id &&
        other.maxVolume > 0 &&
        draggedItem.maxVolume > 0 &&
        Math.hypot(other.x - draggedItem.x, other.y - draggedItem.y) < 65
    );

    if (targetVessel) {
      playGlassClink();
      setTransferState({
        isOpen: true,
        sourceId: draggedItem.id,
        destId: targetVessel.id,
      });
    }

    return updated;
  }, [recordObservation]);

  // Mouse / Pointer Drag Handlers
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedId(id);
    setDraggingId(id);
    setIsThreeDotMenuOpen(false);

    const item = items.find((i) => i.id === id);
    if (item && benchRef.current) {
      const rect = benchRef.current.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left - item.x,
        y: e.clientY - rect.top - item.y,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !benchRef.current) return;
    const rect = benchRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(rect.width - 130, e.clientX - rect.left - dragOffsetRef.current.x));
    const newY = Math.max(10, Math.min(rect.height - 150, e.clientY - rect.top - dragOffsetRef.current.y));

    setItems((prev) =>
      prev.map((i) => (i.id === draggingId ? { ...i, x: newX, y: newY } : i))
    );
  };

  const handlePointerUp = () => {
    if (draggingId) {
      const dragged = items.find((i) => i.id === draggingId);
      if (dragged) {
        setItems((prev) => checkProximityAndSnap(dragged, prev));
      }
      setDraggingId(null);
    }
  };

  // Toggle Burner Flame
  const handleToggleBurner = (burnerId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === burnerId) {
          const nextHeating = !item.isHeating;
          if (nextHeating && soundEnabled) {
            playBurnerSound();
          }
          return { ...item, isHeating: nextHeating };
        }
        return item;
      })
    );
  };

  // Toggle Burette Stopcock
  const handleToggleStopcock = (buretteId: string) => {
    if (soundEnabled) playStopcockClick();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === buretteId) {
          return { ...item, stopcockOpen: !item.stopcockOpen };
        }
        return item;
      })
    );
  };

  // Execute Fluid / Chemical Transfer between vessels
  const handleExecuteTransfer = (amountML: number) => {
    const { sourceId, destId } = transferState;
    if (!sourceId || !destId) return;

    setItems((prev) => {
      const src = prev.find((i) => i.id === sourceId);
      const dest = prev.find((i) => i.id === destId);
      if (!src || !dest) return prev;

      const transferredVol = Math.min(amountML, src.volume);
      const nextSrcVol = Math.max(0, src.volume - transferredVol);
      const nextDestVol = dest.volume + transferredVol;

      let nextDestPH = dest.pH;
      let nextDestColor = dest.liquidColor;
      const nextDestSpecies = { ...dest.species };
      let nextDestName = dest.name;
      let nextDestContents = dest.contentsName;
      let nextDestTemp = dest.temperature;
      let nextDestHasResidue = dest.hasResidue;

      // If destination was completely empty, transfer contents and chemical name into it!
      if (dest.volume === 0) {
        nextDestName = getCleanCompoundName(src);
        nextDestContents = src.contentsName || src.name;
        nextDestColor = src.liquidColor;
        nextDestPH = src.pH;
        nextDestTemp = src.temperature;
        Object.assign(nextDestSpecies, src.species);
        if (src.hasResidue) nextDestHasResidue = true;
      } else {
        // Real-time Chemical Reaction Engine: Detect mixing between compounds
        const chem1 = extractChemicalFormula(src);
        const chem2 = extractChemicalFormula(dest);

        if (chem1 && chem2 && chem1 !== chem2) {
          const outcome = predictReaction([chem1, chem2]);
          if (outcome.reactionType !== 'no-reaction' && outcome.products.length > 0) {
            const primaryProduct = outcome.products[0];
            // Update the name of the vessel to the actual chemical compound formed!
            nextDestName = `${primaryProduct.name} (${primaryProduct.formula}${outcome.isPrecipitateForming ? '↓' : ''})`;
            nextDestContents = outcome.products.map((p) => `${p.formula}${p.state === 's' ? '↓' : ''}`).join(' + ');
            nextDestColor = outcome.precipitateColor || primaryProduct.color || nextDestColor;

            if (outcome.isPrecipitateForming) {
              nextDestHasResidue = true;
            }
            if (outcome.targetPH !== undefined) {
              nextDestPH = outcome.targetPH;
            }
            if (outcome.deltaH < 0) {
              nextDestTemp = Number((dest.temperature + (outcome.tempChangeExpected || 2.0)).toFixed(1));
            }

            // Audio feedback
            if (outcome.isGasEvolving) {
              if (soundEnabled) playFizzSound();
            } else {
              if (soundEnabled) playStepChime();
            }

            // Show what will happen mixing two chemicals with a live notification banner!
            setAiNotification({
              title: `⚗️ Reaction: ${outcome.equation}`,
              message: `${outcome.visualObservation} | Product Formed: ${outcome.products.map((p) => `${p.name} (${p.formula})`).join(' + ')}${outcome.deltaH !== 0 ? ` (ΔH = ${outcome.deltaH} kJ/mol)` : ''}`,
              type: 'success',
            });

            // Record in Student Observation Table
            recordObservation('Reaction Equation', outcome.equation);
            recordObservation('Reaction Outcome', outcome.visualObservation);
            recordObservation('Products Formed', outcome.products.map((p) => `${p.name} (${p.formula})`).join(' + '));
            if (outcome.deltaH !== 0) {
              recordObservation('Reaction Enthalpy (ΔH)', `${outcome.deltaH} kJ/mol (${outcome.deltaH < 0 ? 'Exothermic' : 'Endothermic'})`);
            }
          }
        }
      }

      // Acid-Base Mixing
      if (src.species['H+'] && dest.species['OH-']) {
        const hMoles = (transferredVol * src.species['H+']) / 1000;
        const ohMoles = (dest.volume * dest.species['OH-']) / 1000;
        const totalV = (nextDestVol / 1000) || 1;

        if (Math.abs(hMoles - ohMoles) < 1e-6) {
          nextDestPH = 7.0;
          nextDestColor = '#38bdf8';
          nextDestName = 'Sodium Chloride Solution (NaCl) + Water';
          nextDestContents = 'Neutralized NaCl(aq) + H₂O';
        } else if (ohMoles > hMoles) {
          const remOH = (ohMoles - hMoles) / totalV;
          nextDestPH = Number((14 + Math.log10(remOH)).toFixed(2));
          nextDestColor = dest.species['HIn'] ? '#e11d48' : '#a5f3fc';
        } else {
          const remH = (hMoles - ohMoles) / totalV;
          nextDestPH = Number((-Math.log10(remH)).toFixed(2));
          nextDestColor = '#93c5fd';
        }
      } else if (src.species['OH-'] && dest.species['H+']) {
        const ohMoles = (transferredVol * src.species['OH-']) / 1000;
        const hMoles = (dest.volume * dest.species['H+']) / 1000;
        const totalV = (nextDestVol / 1000) || 1;

        if (Math.abs(ohMoles - hMoles) < 1e-6) {
          nextDestPH = 7.0;
          nextDestColor = dest.species['HIn'] ? '#f472b6' : '#38bdf8';
          nextDestName = 'Sodium Chloride Solution (NaCl) + Water';
          nextDestContents = 'Neutralized NaCl(aq) + H₂O';
        } else if (ohMoles > hMoles) {
          const remOH = (ohMoles - hMoles) / totalV;
          nextDestPH = Number((14 + Math.log10(remOH)).toFixed(2));
          nextDestColor = dest.species['HIn'] ? '#e11d48' : '#a5f3fc';
        } else {
          const remH = (hMoles - ohMoles) / totalV;
          nextDestPH = Number((-Math.log10(remH)).toFixed(2));
          nextDestColor = '#93c5fd';
        }
      }

      // Indicator addition (Phenolphthalein)
      if (src.species['HIn']) {
        nextDestSpecies['HIn'] = 0.005;
        if (dest.pH >= 8.2) {
          nextDestColor = '#e11d48'; // Vibrant magenta pink
          if (soundEnabled) playStepChime();
        } else {
          nextDestColor = '#cbd5e1'; // Colorless in acid
        }
      }

      // Solid CaCl2 exothermic dissolution in water
      if (src.solidAmount && src.solidAmount > 0 && dest.type === 'foam-cup') {
        if (soundEnabled) playFizzSound();
        const deltaT = 16.8;
        const newTemp = 25.0 + deltaT;
        recordObservation('Initial Calorimeter Temp (Ti)', '25.0', '°C');
        recordObservation('Mass of CaCl2 Added', '10.0', 'g');
        recordObservation('Peak Solution Temp (Tf)', '41.8', '°C');
        recordObservation('Temperature Rise (ΔT)', '+16.8', '°C');
        recordObservation('Heat of Solution (q)', '+7.73', 'kJ');
        recordObservation('Enthalpy of Solution (ΔH_soln)', '-85.8', 'kJ/mol');

        return prev.map((item) => {
          if (item.id === src.id) {
            return { ...item, solidAmount: 0, contentsName: 'Empty Container', name: 'Empty Container' };
          }
          if (item.id === dest.id) {
            return {
              ...item,
              temperature: newTemp,
              name: 'Calcium Chloride Solution (CaCl₂)',
              contentsName: '10% CaCl₂ Aqueous Solution',
              species: { 'Ca2+': 0.90, 'Cl-': 1.80, 'H+': 1e-7, 'OH-': 1e-7 },
            };
          }
          return item;
        });
      }

      // Sand-water filtration transfer into funnel with paper
      if (src.type.includes('sand') || src.contentsName.includes('Sand')) {
        if (dest.type === 'filter-funnel') {
          if (!dest.hasFilterPaper) {
            setValidationAlert('Warning: Fold and seat filter paper into the funnel before pouring the suspension!');
            return prev;
          }
          dest.hasResidue = true;
          dest.name = 'Funnel (Sand Residue Trapped)';
          dest.contentsName = 'Funnel (Sand Residue Trapped)';
          recordObservation('Funnel Residue', 'Brown insoluble sand grains trapped on paper');
          recordObservation('Filtrate Permeate', 'Pure clear water drips through stem into receiving beaker');
        }
      }

      return prev.map((item) => {
        if (item.id === src.id) {
          return {
            ...item,
            volume: nextSrcVol,
            name: nextSrcVol === 0 ? `Empty Beaker (${item.maxVolume || 250} mL)` : item.name,
            contentsName: nextSrcVol === 0 ? 'Empty' : item.contentsName,
            species: nextSrcVol === 0 ? {} : item.species,
          };
        }
        if (item.id === dest.id) {
          return {
            ...item,
            name: nextDestName,
            contentsName: nextDestContents,
            volume: nextDestVol,
            pH: nextDestPH,
            liquidColor: nextDestColor,
            species: nextDestSpecies,
            temperature: nextDestTemp,
            hasResidue: nextDestHasResidue,
          };
        }
        return item;
      });
    });

    // Custom Experiment AI Live Step Validation
    if (customSetup && customSetup.milestones && customSetup.milestones.length > 0) {
      const milestone = customSetup.milestones[currentStepIndex];
      if (milestone) {
        if (soundEnabled) playStepChime();
        setAiNotification({
          title: `✓ Right Step! Step ${currentStepIndex + 1} Completed`,
          message: milestone.successMessage || 'Reagent transfer validated by AI.',
          type: 'success',
        });
        if (!completedSteps.includes(currentStepIndex)) {
          setCompletedSteps((prev) => [...prev, currentStepIndex]);
        }
        if (currentStepIndex < customSetup.milestones.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        }
      }
    }
  };

  // Real-time Physics & Chemical Simulation Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const burner = prev.find((i) => i.type === 'burner' && i.isHeating);
        const burette = prev.find((i) => i.type.startsWith('burette') && i.stopcockOpen);

        let hasChange = false;
        let nextItems = [...prev];

        // 1. Heating simulation: If burner is lit and near an apparatus
        if (burner) {
          nextItems = nextItems.map((item) => {
            if (item.id !== burner.id && Math.hypot(item.x - burner.x, item.y - (burner.y - 45)) < 80) {
              if (item.temperature < 100) {
                hasChange = true;
                const newTemp = Math.min(100, item.temperature + 2.2);
                if (newTemp >= 100) {
                  recordObservation('Boiling Temperature', '100.0', '°C');
                }
                return {
                  ...item,
                  temperature: Number(newTemp.toFixed(1)),
                  thermalRate: 2.2,
                };
              } else if (item.volume > 0 && (item.type === 'evaporating-dish' || item.type.includes('beaker'))) {
                // Solvent evaporation
                hasChange = true;
                const newVol = Math.max(0, item.volume - 0.4);
                const hasCrust = newVol === 0 && (item.species['Na+'] !== undefined || item.type === 'evaporating-dish');
                if (hasCrust) {
                  recordObservation('Evaporation Residue', 'Dry white cubic crystalline NaCl crust');
                }
                return {
                  ...item,
                  volume: Number(newVol.toFixed(1)),
                  hasSaltCrust: hasCrust,
                  thermalRate: 0,
                };
              }
            }
            return item;
          });
        }

        // 2. Cooling simulation for conductive vessels
        nextItems = nextItems.map((item) => {
          if (!item.isInsulated && item.temperature > 25.0) {
            const isNearLitBurner = burner && Math.hypot(item.x - burner.x, item.y - (burner.y - 45)) < 80;
            if (!isNearLitBurner) {
              hasChange = true;
              const newTemp = Math.max(25.0, Number((item.temperature - 0.6).toFixed(1)));
              return {
                ...item,
                temperature: newTemp,
                thermalRate: newTemp > 25.0 ? -0.6 : 0,
              };
            }
          } else if (item.thermalRate !== undefined && item.thermalRate !== 0) {
            const isNearLitBurner = burner && Math.hypot(item.x - burner.x, item.y - (burner.y - 45)) < 80;
            if (!isNearLitBurner) {
              hasChange = true;
              return { ...item, thermalRate: 0 };
            }
          }
          return item;
        });

        // 3. Burette Titration Stream / Dropwise delivery into flask below
        if (burette && burette.volume > 0) {
          const receivingFlask = nextItems.find(
            (it) =>
              it.id !== burette.id &&
              (it.type.includes('conical-flask') || it.type.includes('flask')) &&
              Math.hypot(it.x - burette.x, it.y - (burette.y + 180)) < 80
          );

          if (receivingFlask) {
            hasChange = true;
            const dripAmount = 0.1; // 0.1 mL per tick
            const newBuretteVol = Math.max(0, burette.volume - dripAmount);
            const newFlaskVol = receivingFlask.volume + dripAmount;
            const titreDelivered = 50.0 - newBuretteVol;

            // Titration Endpoint check at 25.0 mL delivered:
            let newColor = receivingFlask.liquidColor;
            let newPH = receivingFlask.pH;
            if (titreDelivered >= 25.0) {
              newColor = '#f472b6'; // Pale pink endpoint!
              newPH = 8.35;
              recordObservation('Endpoint Titre Volume', '25.00', 'mL');
              recordObservation('Indicator Endpoint Color', 'Persistent faint pale pink');
              recordObservation('Calculated HCl Concentration', '0.100', 'M');
            } else if (titreDelivered > 24.0) {
              newPH = 4.2;
            }

            nextItems = nextItems.map((it) => {
              if (it.id === burette.id) {
                return { ...it, volume: Number(newBuretteVol.toFixed(2)) };
              }
              if (it.id === receivingFlask.id) {
                return {
                  ...it,
                  volume: Number(newFlaskVol.toFixed(2)),
                  liquidColor: newColor,
                  pH: newPH,
                };
              }
              return it;
            });
          }
        }

        return hasChange ? nextItems : prev;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [recordObservation]);

  // Spawn apparatus or solution from Stockroom
  const handleSpawnFromStockroom = (itemDef: StockItemDefinition) => {
    const newItem: WorkbenchItem = {
      id: `${itemDef.type}-${Date.now().toString().slice(-4)}`,
      name: itemDef.name,
      type: itemDef.type,
      x: 350 + Math.random() * 200,
      y: 200 + Math.random() * 80,
      volume: itemDef.volume ?? 0,
      maxVolume: itemDef.maxVolume ?? 100,
      temperature: itemDef.temperature ?? 25.0,
      isInsulated: itemDef.isInsulated ?? false,
      liquidColor: itemDef.liquidColor ?? '#38bdf8',
      pH: itemDef.pH ?? 7.0,
      species: itemDef.species ? { ...itemDef.species } : {},
      contentsName: itemDef.contentsName ?? itemDef.name,
      solidAmount: itemDef.solidAmount,
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
    // Auto-close stockroom drawer after placing so reaction sheet remains spacious!
    setIsStockroomOpen(false);
  };

  // Reset Workbench to initial experiment state
  const handleResetWorkbench = () => {
    if (soundEnabled) playGlassClink();
    setItems(getInitialSetupForExperiment(experiment));
    setCompletedSteps([]);
    setObservations([]);
    setValidationAlert(null);
    setCurrentStepIndex(0);
    setIsThreeDotMenuOpen(false);
  };

  // Clear all items on bench
  const handleClearBench = () => {
    if (soundEnabled) playGlassClink();
    setItems([]);
    setSelectedId(null);
    setIsThreeDotMenuOpen(false);
  };

  // Complete Step Validation
  const handleCompleteCurrentStep = () => {
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps((prev) => [...prev, currentStepIndex]);
    }
    setValidationAlert(null);
    if (currentStepIndex < experiment.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      if (soundEnabled) playCompletionFanfare();
    }
  };

  const currentStep = experiment.steps[currentStepIndex] || experiment.steps[0];

  return (
    <div
      className={`relative w-full h-full min-h-[calc(100vh-3rem)] bg-slate-950 overflow-hidden flex flex-col select-none font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen' : ''
      }`}
    >
      {/* Top Laboratory Toolbar: Sleek, compact, unobtrusive */}
      <header className="h-12 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-xl px-4 flex items-center justify-between z-30 shrink-0">
        {/* Left: Home Return + Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/10 transition-colors"
            title="Return to Experiment Library"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Library</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <h2 className="text-xs font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-md">
              {experiment.title}
            </h2>
          </div>
        </div>

        {/* Center: Floating Step Action Chip */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs shadow-md">
          <span className="text-[10px] font-black uppercase text-cyan-400">
            Step {currentStepIndex + 1}/{experiment.steps.length}
          </span>
          <span className="text-slate-300 font-medium truncate max-w-xs">
            {currentStep.title}
          </span>
          <button
            onClick={() => {
              if (soundEnabled) playStepChime();
              handleCompleteCurrentStep();
            }}
            className="p-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 transition-colors ml-1"
            title="Verify Step Action"
          >
            <CheckIcon className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Quick Action Pills + THREE-DOT MENU (baki ko three dot bnake unke andar dalo) */}
        <div className="flex items-center gap-2 relative">
          {/* Stockroom Toggle Pill */}
          <button
            onClick={() => {
              setIsStockroomOpen(!isStockroomOpen);
              setIsProcedureOpen(false);
              setIsThreeDotMenuOpen(false);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isStockroomOpen
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/10'
            }`}
          >
            <BeakerIcon className="w-3.5 h-3.5" />
            <span>Stockroom</span>
          </button>

          {/* Procedure Guide Pill */}
          <button
            onClick={() => {
              setIsProcedureOpen(!isProcedureOpen);
              setIsStockroomOpen(false);
              setIsThreeDotMenuOpen(false);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isProcedureOpen
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/10'
            }`}
          >
            <BookOpenIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Solution Info Toggle Pill */}
          <button
            onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isInfoPanelOpen
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/10'
            }`}
            title="Toggle Solution Info Panel"
          >
            <DropletsIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Info</span>
          </button>

          {/* AI Co-Pilot Header Button (Only in Custom User Experiments) */}
          {isCustomExperiment && (
            <button
              onClick={() => {
                setIsAiAssistantOpen(!isAiAssistantOpen);
                setIsStockroomOpen(false);
                setIsProcedureOpen(false);
                setIsThreeDotMenuOpen(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isAiAssistantOpen
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                  : 'text-violet-300 hover:text-white bg-violet-950/40 hover:bg-violet-900/60 border border-violet-500/30'
              }`}
              title="Open AI Lab Co-Pilot (Predict mixing, burner thermal effects, ask questions)"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI Co-Pilot</span>
            </button>
          )}

          {/* THREE-DOT MENU BUTTON (⋮) */}
          <button
            onClick={() => setIsThreeDotMenuOpen(!isThreeDotMenuOpen)}
            className={`p-1.5 rounded-lg border transition-all ${
              isThreeDotMenuOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-white/10'
            }`}
            title="More Options & Laboratory Controls"
          >
            <MoreVerticalIcon className="w-4 h-4" />
          </button>

          {/* THREE-DOT DROPDOWN MENU */}
          {isThreeDotMenuOpen && (
            <div
              className="absolute right-0 top-11 w-64 bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1"
              onMouseLeave={() => setIsThreeDotMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">
                Workbench Actions
              </div>

              {/* AI Lab Co-Pilot for Custom Experiment */}
              {isCustomExperiment && (
                <button
                  onClick={() => {
                    setIsAiAssistantOpen(true);
                    setIsThreeDotMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-violet-200 hover:bg-violet-950/60 transition-colors flex items-center gap-2.5 font-bold"
                >
                  <SparklesIcon className="w-3.5 h-3.5 text-violet-400" />
                  <span>AI Experiment Co-Pilot</span>
                </button>
              )}

              {/* Reset Setup */}
              <button
                onClick={handleResetWorkbench}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors flex items-center gap-2.5 font-medium"
              >
                <RotateCcwIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reset Apparatus Setup</span>
              </button>

              {/* Clear Bench */}
              <button
                onClick={handleClearBench}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/60 transition-colors flex items-center gap-2.5 font-medium"
              >
                <XIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear All from Bench</span>
              </button>

              <div className="border-t border-white/5 my-1" />

              {/* Sound Toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  setIsThreeDotMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-between font-medium"
              >
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2Icon className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <VolumeXIcon className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>Tactile Audio Effects</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {soundEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => {
                  setIsFullscreen(!isFullscreen);
                  setIsThreeDotMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-between font-medium"
              >
                <div className="flex items-center gap-2.5">
                  {isFullscreen ? (
                    <MinimizeIcon className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <MaximizeIcon className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span>Immersive Fullscreen</span>
                </div>
              </button>

              <div className="border-t border-white/5 my-1" />

              {/* Procedure Guide Quick Jump */}
              <button
                onClick={() => {
                  setIsProcedureOpen(true);
                  setIsStockroomOpen(false);
                  setIsThreeDotMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2.5 font-medium"
              >
                <BookOpenIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Theory & Observation Table</span>
              </button>

              <div className="border-t border-white/5 my-1" />

              {/* Lab Settings (Gemini API Key) */}
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsThreeDotMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-cyan-300 hover:bg-cyan-950/60 transition-colors flex items-center gap-2.5 font-medium"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Gemini API Key & Settings</span>
              </button>

              {/* Design Custom Experiment Link */}
              <Link
                href="/experiments/create"
                onClick={() => setIsThreeDotMenuOpen(false)}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-amber-300 hover:bg-amber-950/40 transition-colors flex items-center gap-2.5 font-medium"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Design New AI Experiment</span>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Floating Live AI Step Notification Banner */}
      {aiNotification && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/95 border border-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.35)] text-slate-100 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-300 tracking-wide">{aiNotification.title}</p>
            <p className="text-[11px] text-slate-200 mt-0.5">{aiNotification.message}</p>
          </div>
          <button
            onClick={() => setAiNotification(null)}
            className="ml-3 text-slate-400 hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN INTERACTIVE WORKBENCH: FULL 100% SPACIOUS REACTION SHEET ("back reaction sheet ko full space do") */}
      <div
        ref={benchRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex-1 w-full h-full relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 cursor-crosshair select-none"
      >
        {/* Spacious Laboratory Table Surface Grid & Specular Lighting */}
        <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {/* Educational Warning / Guidance Floating Toast */}
        {validationAlert && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-2">
            <div className="p-3 rounded-2xl bg-amber-950/90 border border-amber-500/50 text-amber-200 text-xs shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlertIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{validationAlert}</span>
              </div>
              <button
                onClick={() => setValidationAlert(null)}
                className="p-1 rounded text-amber-400 hover:text-white"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ChemCollective Stockroom: Clean FLOATING OVERLAY DRAWER (Never squashes workbench!) */}
        {isStockroomOpen && (
          <div className="absolute top-0 bottom-0 left-0 z-40 shadow-2xl animate-in slide-in-from-left duration-200">
            <Stockroom
              isOpen={isStockroomOpen}
              onToggle={() => setIsStockroomOpen(!isStockroomOpen)}
              onSpawnItem={handleSpawnFromStockroom}
              deployedCount={items.length}
              requiredReagents={experiment?.chemicals || []}
              activeExperimentTitle={customSetup?.title || experiment?.title}
            />
          </div>
        )}

        {/* NOBOOK Live Procedure Guide: Clean FLOATING OVERLAY DRAWER on Right */}
        {isProcedureOpen && (
          <div className="absolute top-0 bottom-0 right-0 z-40 shadow-2xl animate-in slide-in-from-right duration-200">
            <ProcedurePanel
              experiment={experiment}
              currentStepIndex={currentStepIndex}
              completedSteps={completedSteps}
              observations={observations}
              validationAlert={validationAlert}
              onStepSelect={(idx) => setCurrentStepIndex(idx)}
              onCompleteStep={handleCompleteCurrentStep}
              isCollapsed={false}
              onToggleCollapse={() => setIsProcedureOpen(false)}
            />
          </div>
        )}

        {/* Interactive Apparatus Items on the Workbench - Center Spaced & Free to Move */}
        {items.map((item) => {
          const isSelected = item.id === selectedId;

          return (
            <div
              key={item.id}
              onPointerDown={(e) => handlePointerDown(item.id, e)}
              style={{
                transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
              }}
              className={`absolute cursor-grab active:cursor-grabbing transition-shadow rounded-2xl p-2 group ${
                isSelected
                  ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.45)]'
                  : 'hover:ring-1 hover:ring-cyan-500/40'
              }`}
            >
              {/* Dynamic Glassware / Apparatus SVG Graphic */}
              <GlasswareSvg
                type={item.type}
                volume={item.volume}
                maxVolume={item.maxVolume}
                liquidColor={item.liquidColor}
                temperature={item.temperature}
                isHeating={item.isHeating}
                stopcockOpen={item.stopcockOpen}
                hasFilterPaper={item.hasFilterPaper}
                hasResidue={item.hasResidue}
                hasSaltCrust={item.hasSaltCrust}
                onStopcockToggle={() => handleToggleStopcock(item.id)}
                width={130}
                height={160}
              />

              {/* Floating Apparatus Badge */}
              <div className="mt-1 text-center">
                {(() => {
                  const displayName = getCleanCompoundName(item);
                  const isProduct =
                    item.hasResidue ||
                    displayName.includes('↓') ||
                    displayName.includes('Precipitate') ||
                    displayName.includes('Complex') ||
                    displayName.includes('Product');

                  return (
                    <span
                      title={displayName}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm truncate inline-block max-w-[155px] transition-all ${
                        isProduct
                          ? 'bg-emerald-950/95 text-emerald-200 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/50'
                          : 'bg-slate-950/90 text-white border-white/10'
                      }`}
                    >
                      {isProduct && <span className="mr-1 text-emerald-400">✨</span>}
                      {displayName}
                    </span>
                  );
                })()}
                {/* Volume & Dynamic Thermal readout */}
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  {item.volume > 0 && (
                    <span className="text-[9px] font-mono text-cyan-300 font-semibold">
                      {item.volume.toFixed(1)} mL
                    </span>
                  )}
                  {item.maxVolume > 0 && item.temperature !== undefined && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1 rounded transition-colors ${
                        item.thermalRate && item.thermalRate > 0
                          ? 'bg-rose-950/90 text-rose-300 border border-rose-500/50 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                          : item.thermalRate && item.thermalRate < 0
                          ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                          : 'text-amber-300/80'
                      }`}
                      title={
                        item.thermalRate && item.thermalRate > 0
                          ? `Heating up (+${item.thermalRate}°C/s)`
                          : item.thermalRate && item.thermalRate < 0
                          ? `Cooling down (${item.thermalRate}°C/s)`
                          : 'Thermal equilibrium'
                      }
                    >
                      {item.thermalRate && item.thermalRate > 0 && '🔥 '}
                      {item.thermalRate && item.thermalRate < 0 && '❄️ '}
                      {item.temperature.toFixed(1)}°C
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive Flame toggle button for Burner */}
              {item.type === 'burner' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBurner(item.id);
                  }}
                  className={`absolute -top-3 right-0 p-1.5 rounded-full border text-xs shadow-lg transition-transform active:scale-90 ${
                    item.isHeating
                      ? 'bg-rose-500 text-white border-rose-300 shadow-[0_0_15px_#f43f5e]'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:border-cyan-400'
                  }`}
                  title={item.isHeating ? 'Extinguish Flame' : 'Ignite Flame'}
                >
                  <FlameIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ChemCollective Floating Collapsible Solution Info Panel at Bottom */}
      <SolutionInfoPanel
        vessel={selectedVessel}
        isOpen={isInfoPanelOpen}
        onToggleOpen={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
        onUpdateThermalMode={(id, isInsulated) => {
          setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, isInsulated } : it))
          );
        }}
        onRenameVessel={(id, newName) => {
          setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, name: newName } : it))
          );
        }}
        onEmptyVessel={(id) => {
          if (soundEnabled) playPouringSound();
          setItems((prev) =>
            prev.map((it) =>
              it.id === id ? { ...it, volume: 0, contentsName: 'Empty', species: {} } : it
            )
          );
        }}
        onRemoveVessel={(id) => {
          if (soundEnabled) playGlassClink();
          setItems((prev) => prev.filter((it) => it.id !== id));
          if (selectedId === id) setSelectedId(null);
        }}
      />

      {/* ChemCollective Drag-to-Transfer Dialog */}
      <TransferModal
        isOpen={transferState.isOpen}
        sourceVessel={
          items.find((i) => i.id === transferState.sourceId)
            ? (() => {
                const it = items.find((i) => i.id === transferState.sourceId)!;
                return {
                  id: it.id,
                  name: getCleanCompoundName(it),
                  type: it.type,
                  volume: it.volume,
                  maxVolume: it.maxVolume,
                  temperature: it.temperature,
                  pH: it.pH,
                  species: it.species,
                  liquidColor: it.liquidColor,
                };
              })()
            : null
        }
        destVessel={
          items.find((i) => i.id === transferState.destId)
            ? (() => {
                const it = items.find((i) => i.id === transferState.destId)!;
                return {
                  id: it.id,
                  name: getCleanCompoundName(it),
                  type: it.type,
                  volume: it.volume,
                  maxVolume: it.maxVolume,
                  temperature: it.temperature,
                  pH: it.pH,
                  species: it.species,
                  liquidColor: it.liquidColor,
                };
              })()
            : null
        }
        onClose={() => setTransferState({ isOpen: false, sourceId: null, destId: null })}
        onTransfer={handleExecuteTransfer}
      />

      {/* AI Lab Co-Pilot: ONLY enabled in custom user experiments where user makes their own experiment */}
      {isCustomExperiment && (
        <AiWorkbenchAssistant
          items={items}
          isOpen={isAiAssistantOpen}
          onToggle={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
        />
      )}
    </div>
  );
};
