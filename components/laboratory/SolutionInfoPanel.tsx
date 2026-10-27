'use client';

import React, { useState } from 'react';
import {
  ThermometerIcon,
  DropletsIcon,
  SparklesIcon,
  RotateCcwIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XIcon,
} from '@/components/ui/Icons';
import { GlasswareSvg } from './apparatus/GlasswareSvg';
import { playSnapSound } from '@/lib/audio/sounds';

export interface SelectedVesselData {
  id: string;
  name: string;
  type: string;
  volume: number;
  maxVolume: number;
  temperature: number;
  pH: number;
  species: Record<string, number>;
  isInsulated?: boolean;
  liquidColor?: string;
  solidAmount?: number;
  contentsName?: string;
}

interface SolutionInfoPanelProps {
  vessel: SelectedVesselData | null;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  onUpdateThermalMode?: (vesselId: string, isInsulated: boolean) => void;
  onRenameVessel?: (vesselId: string, newName: string) => void;
  onEmptyVessel?: (vesselId: string) => void;
  onRemoveVessel?: (vesselId: string) => void;
}

export const SolutionInfoPanel: React.FC<SolutionInfoPanelProps> = ({
  vessel,
  isOpen,
  onToggleOpen,
  onUpdateThermalMode,
  onRenameVessel,
  onEmptyVessel,
  onRemoveVessel,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const isExpanded = isOpen !== undefined ? isOpen : internalExpanded;
  const toggleExpanded = () => {
    if (onToggleOpen) {
      onToggleOpen();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  if (!vessel) {
    return (
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto select-none">
        <div className="px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-white/10 text-slate-400 text-[11px] shadow-lg backdrop-blur-md flex items-center gap-2">
          <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click any apparatus on the workbench to inspect live properties</span>
        </div>
      </div>
    );
  }

  const handleNameSave = () => {
    if (nameInput.trim() && onRenameVessel) {
      onRenameVessel(vessel.id, nameInput.trim());
    }
    setIsEditingName(false);
  };

  // Helper for pH color and label
  const getPHColor = (ph: number) => {
    if (ph < 3) return 'text-rose-400 bg-rose-950/80 border-rose-700/50';
    if (ph < 6) return 'text-amber-400 bg-amber-950/80 border-amber-700/50';
    if (ph <= 8) return 'text-emerald-400 bg-emerald-950/80 border-emerald-700/50';
    if (ph < 11) return 'text-cyan-400 bg-cyan-950/80 border-cyan-700/50';
    return 'text-fuchsia-400 bg-fuchsia-950/80 border-fuchsia-700/50';
  };

  const getPHClassification = (ph: number) => {
    if (ph <= 2) return 'Strong Acid';
    if (ph < 6.5) return 'Weak Acid';
    if (ph <= 7.5) return 'Neutral';
    if (ph < 12) return 'Weak Base';
    return 'Strong Base';
  };

  const formatScientific = (molarity: number): string => {
    if (molarity === 0) return '0.00 M';
    if (molarity >= 0.01 && molarity <= 100) return `${molarity.toFixed(3)} M`;
    return molarity.toExponential(2).replace('e', ' × 10^') + ' M';
  };

  // Minimized Floating Pill View (Takes minimal space, full bench visibility!)
  if (!isExpanded) {
    return (
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto select-none">
        <button
          onClick={toggleExpanded}
          className="px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-white text-xs font-semibold shadow-[0_6px_25px_rgba(0,0,0,0.7)] backdrop-blur-xl flex items-center gap-3 transition-all hover:scale-105"
          title="Click to expand detailed solution chemistry and species molarities"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="font-bold text-white truncate max-w-[130px]">{vessel.name}</span>
          </div>

          <span className="text-slate-500">•</span>
          <span className="font-mono text-cyan-300">{vessel.volume.toFixed(1)} mL</span>

          <span className="text-slate-500">•</span>
          <span className="font-mono text-amber-300">{vessel.temperature.toFixed(1)} °C</span>

          <span className="text-slate-500">•</span>
          <span className="font-mono text-emerald-300">pH {vessel.pH.toFixed(2)}</span>

          <div className="ml-1 pl-2 border-l border-white/10 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold">
            <ChevronUpIcon className="w-3.5 h-3.5" />
            <span className="text-[11px]">Inspect</span>
          </div>
        </button>
      </div>
    );
  }

  // Expanded Floating Modal Card View
  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-4xl z-30 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl p-4 shadow-[0_15px_50px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Left: Vessel Identity & Type */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-14 bg-slate-900 rounded-xl border border-cyan-500/30 flex items-center justify-center p-1 shadow-inner">
              <GlasswareSvg
                type={vessel.type}
                volume={vessel.volume}
                maxVolume={vessel.maxVolume}
                liquidColor={vessel.liquidColor || '#38bdf8'}
                temperature={vessel.temperature}
                showGraduations={false}
                width={36}
                height={44}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="bg-slate-900 border border-cyan-500/50 text-white text-xs px-2 py-0.5 rounded font-bold focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleNameSave}
                      className="p-1 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                    >
                      <CheckIcon className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-white tracking-wide">
                      {vessel.name}
                    </h3>
                    <button
                      onClick={() => {
                        setNameInput(vessel.name);
                        setIsEditingName(true);
                      }}
                      className="text-slate-500 hover:text-cyan-400 transition-colors"
                      title="Rename Vessel"
                    >
                      <EditIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Contents: <span className="text-cyan-300 font-medium">{vessel.contentsName || 'Empty'}</span>
              </p>

              {/* Thermal Mode Switch */}
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => {
                    playSnapSound();
                    if (onUpdateThermalMode) {
                      onUpdateThermalMode(vessel.id, !vessel.isInsulated);
                    }
                  }}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                    vessel.isInsulated
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}
                  title="Toggle between adiabatic insulated container and ambient conductive container"
                >
                  {vessel.isInsulated ? '🛡️ Insulated (Adiabatic)' : '🌐 Constant Temp'}
                </button>
              </div>
            </div>
          </div>

          {/* Center: Live Measurement Gauges */}
          <div className="flex flex-wrap items-center gap-2.5 justify-center md:justify-start">
            {/* Volume Metric */}
            <div className="bg-slate-900/80 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-[95px]">
              <div className="text-[9px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <DropletsIcon className="w-2.5 h-2.5 text-cyan-400" />
                <span>Volume</span>
              </div>
              <div className="text-sm font-black text-white font-mono mt-0.5">
                {vessel.volume.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">mL</span>
              </div>
            </div>

            {/* Temperature Metric */}
            <div className="bg-slate-900/80 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-[95px]">
              <div className="text-[9px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <ThermometerIcon
                  className={`w-2.5 h-2.5 ${vessel.temperature > 50 ? 'text-rose-400' : 'text-blue-400'}`}
                />
                <span>Temp</span>
              </div>
              <div
                className={`text-sm font-black font-mono mt-0.5 ${
                  vessel.temperature >= 99.5
                    ? 'text-rose-400 animate-pulse'
                    : vessel.temperature > 40
                    ? 'text-amber-400'
                    : 'text-cyan-300'
                }`}
              >
                {vessel.temperature.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">°C</span>
              </div>
            </div>

            {/* pH Meter Gauge */}
            <div className="bg-slate-900/80 border border-white/10 rounded-xl px-2.5 py-1.5 min-w-[110px]">
              <div className="text-[9px] text-slate-400 uppercase font-semibold flex items-center justify-between gap-1">
                <span>pH Meter</span>
                <span className={`text-[8px] px-1 rounded border font-semibold ${getPHColor(vessel.pH)}`}>
                  {getPHClassification(vessel.pH)}
                </span>
              </div>
              <div className="text-sm font-black text-white font-mono mt-0.5">
                {vessel.pH.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Right: Species & Action Controls */}
          <div className="flex items-center gap-3">
            {/* Chemical Species Table */}
            <div className="bg-slate-900/90 border border-white/10 rounded-xl p-2 min-w-[170px] max-h-20 overflow-y-auto">
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center justify-between">
                <span>Species</span>
                <span className="text-[8px] text-cyan-400 font-normal">Molarity (M)</span>
              </div>

              {Object.keys(vessel.species).length === 0 ? (
                <div className="text-[9px] text-slate-500 italic py-1">No solute active</div>
              ) : (
                <div className="space-y-0.5">
                  {Object.entries(vessel.species).map(([speciesKey, molarity]) => (
                    <div
                      key={speciesKey}
                      className="flex items-center justify-between text-[11px] font-mono py-0.5 border-b border-white/5 last:border-0"
                    >
                      <span className="text-slate-300 font-semibold">[{speciesKey}]</span>
                      <span className="text-cyan-300 text-[10px] font-medium">
                        {formatScientific(molarity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions & Close */}
            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={() => onEmptyVessel && onEmptyVessel(vessel.id)}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-[10px] font-medium flex items-center gap-1 transition-colors"
                title="Empty vessel"
              >
                <RotateCcwIcon className="w-2.5 h-2.5 text-cyan-400" />
                <span>Empty</span>
              </button>

              <button
                onClick={() => onRemoveVessel && onRemoveVessel(vessel.id)}
                className="px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/20 text-[10px] font-medium flex items-center gap-1 transition-colors"
                title="Remove vessel from bench"
              >
                <TrashIcon className="w-2.5 h-2.5" />
                <span>Remove</span>
              </button>

              <button
                onClick={toggleExpanded}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-medium flex items-center gap-1 transition-colors"
                title="Minimize Info Panel"
              >
                <ChevronDownIcon className="w-2.5 h-2.5" />
                <span>Minimize</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
