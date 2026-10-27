'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DropletsIcon,
  SparklesIcon,
  ChevronRightIcon,
  XIcon,
  PlayIcon,
} from '@/components/ui/Icons';
import { GlasswareSvg } from './apparatus/GlasswareSvg';
import type { SelectedVesselData } from './SolutionInfoPanel';
import { playPouringSound, playDropSound, playGlassClink } from '@/lib/audio/sounds';

interface TransferModalProps {
  isOpen: boolean;
  sourceVessel: SelectedVesselData | null;
  destVessel: SelectedVesselData | null;
  onClose: () => void;
  onTransfer: (amountML: number) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  sourceVessel,
  destVessel,
  onClose,
  onTransfer,
}) => {
  const [activeTab, setActiveTab] = useState<'precise' | 'pour' | 'dropwise'>('precise');
  const [transferAmount, setTransferAmount] = useState<number>(10);
  const [isHoldingPour, setIsHoldingPour] = useState<boolean>(false);
  const [pouredSoFar, setPouredSoFar] = useState<number>(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sourceVessel) {
      const defaultAmount = Math.min(25, Math.max(1, Math.round(sourceVessel.volume / 2)));
      setTransferAmount(defaultAmount > 0 ? defaultAmount : 10);
      setPouredSoFar(0);
    }
  }, [sourceVessel]);

  if (!isOpen || !sourceVessel || !destVessel) return null;

  const sourceAvailable = sourceVessel.volume;
  const destCapacity = Math.max(0, destVessel.maxVolume - destVessel.volume);
  const maxPossible = Math.min(sourceAvailable, destCapacity);

  const handlePreciseTransfer = () => {
    const amount = Math.min(transferAmount, sourceAvailable);
    if (amount <= 0) return;
    playPouringSound();
    onTransfer(amount);
    onClose();
  };

  const handleAddDrop = () => {
    const dropVolume = 0.05;
    if (sourceAvailable < dropVolume) return;
    playDropSound();
    onTransfer(dropVolume);
  };

  // Hold to pour continuous streaming
  const startPouring = () => {
    if (sourceAvailable <= 0 || destCapacity <= 0) return;
    setIsHoldingPour(true);
    playPouringSound();

    const ratePerTick = 0.5; // mL per 100ms = 5 mL/sec
    holdIntervalRef.current = setInterval(() => {
      setPouredSoFar((prev) => {
        const next = prev + ratePerTick;
        onTransfer(ratePerTick);
        return next;
      });
    }, 100);
  };

  const stopPouring = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHoldingPour(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-cyan-400">
            <DropletsIcon className="w-5 h-5" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Transfer Reagents
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              ChemCollective VLab
            </span>
          </div>

          <button
            onClick={() => {
              stopPouring();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Source and Destination Vessel Comparison Cards */}
        <div className="p-4 bg-slate-950/40 border-b border-white/5 flex items-center justify-between gap-3">
          {/* Source Container */}
          <div className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-12 bg-slate-950 rounded-lg flex items-center justify-center p-1 border border-white/5">
              <GlasswareSvg
                type={sourceVessel.type}
                volume={sourceVessel.volume}
                maxVolume={sourceVessel.maxVolume}
                liquidColor={sourceVessel.liquidColor || '#38bdf8'}
                showGraduations={false}
                width={32}
                height={40}
              />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">From (Source)</div>
              <div className="text-xs font-bold text-white truncate">{sourceVessel.name}</div>
              <div className="text-[11px] font-mono text-cyan-300">
                {sourceVessel.volume.toFixed(1)} mL available
              </div>
            </div>
          </div>

          <ChevronRightIcon className="w-5 h-5 text-slate-500 shrink-0" />

          {/* Destination Container */}
          <div className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-12 bg-slate-950 rounded-lg flex items-center justify-center p-1 border border-white/5">
              <GlasswareSvg
                type={destVessel.type}
                volume={destVessel.volume}
                maxVolume={destVessel.maxVolume}
                liquidColor={destVessel.liquidColor || '#38bdf8'}
                showGraduations={false}
                width={32}
                height={40}
              />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">To (Destination)</div>
              <div className="text-xs font-bold text-white truncate">{destVessel.name}</div>
              <div className="text-[11px] font-mono text-emerald-400">
                {destCapacity.toFixed(1)} mL space
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Mode Tabs (Precise Transfer | Hold to Pour | Dropwise) */}
        <div className="flex border-b border-white/10 bg-slate-950/80 p-1 gap-1">
          <button
            onClick={() => setActiveTab('precise')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'precise'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Precise Transfer (mL)
          </button>
          <button
            onClick={() => setActiveTab('pour')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'pour'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Realistic Pouring (Hold)
          </button>
          <button
            onClick={() => setActiveTab('dropwise')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'dropwise'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dropwise (0.05 mL)
          </button>
        </div>

        {/* Tab 1: Precise Transfer Content */}
        {activeTab === 'precise' && (
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span>Transfer Volume:</span>
                <span className="font-mono text-cyan-300 text-sm font-bold">
                  {transferAmount.toFixed(1)} mL
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={Math.max(1, sourceAvailable)}
                step={0.5}
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[5, 10, 25, 50].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTransferAmount(Math.min(amt, sourceAvailable))}
                  disabled={amt > sourceAvailable}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 text-xs font-mono font-medium border border-white/5 transition-colors"
                >
                  +{amt} mL
                </button>
              ))}
              <button
                onClick={() => setTransferAmount(sourceAvailable)}
                className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-mono font-semibold border border-cyan-500/30 transition-colors ml-auto"
              >
                All ({sourceAvailable.toFixed(1)} mL)
              </button>
            </div>

            {transferAmount > destCapacity && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ Warning: Destination vessel only has {destCapacity.toFixed(1)} mL capacity!</span>
              </div>
            )}

            <button
              onClick={handlePreciseTransfer}
              disabled={transferAmount <= 0}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <DropletsIcon className="w-4 h-4" />
              <span>Transfer {transferAmount.toFixed(1)} mL</span>
            </button>
          </div>
        )}

        {/* Tab 2: Realistic Pouring (Press and Hold) */}
        {activeTab === 'pour' && (
          <div className="p-6 space-y-5 text-center">
            <p className="text-xs text-slate-300 leading-relaxed">
              Press and hold the button below to stream liquid continuously from {sourceVessel.name}. Releasing the button stops the flow immediately.
            </p>

            {/* Interactive Hold Button */}
            <div className="flex flex-col items-center justify-center gap-3">
              <button
                onMouseDown={startPouring}
                onMouseUp={stopPouring}
                onMouseLeave={stopPouring}
                onTouchStart={startPouring}
                onTouchEnd={stopPouring}
                disabled={sourceAvailable <= 0 || destCapacity <= 0}
                className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xl ${
                  isHoldingPour
                    ? 'scale-95 bg-cyan-500 text-slate-950 border-white shadow-[0_0_40px_rgba(6,182,212,0.8)] animate-pulse'
                    : 'bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-cyan-300 border-cyan-400/40 hover:border-cyan-400'
                }`}
              >
                <DropletsIcon className={`w-8 h-8 ${isHoldingPour ? 'text-slate-950' : 'text-cyan-400'}`} />
                <span className="text-xs font-black uppercase tracking-wider">
                  {isHoldingPour ? 'POURING...' : 'PRESS & HOLD'}
                </span>
                <span className="text-[10px] font-medium opacity-80">
                  {isHoldingPour ? 'Release to stop' : 'To Stream Liquid'}
                </span>
              </button>

              <div className="text-xs font-mono text-slate-400">
                Poured in this session: <span className="text-cyan-300 font-bold">{pouredSoFar.toFixed(1)} mL</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  stopPouring();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Done Pouring
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Dropwise Mode */}
        {activeTab === 'dropwise' && (
          <div className="p-6 space-y-4 text-center">
            <p className="text-xs text-slate-300 leading-relaxed">
              Add individual calibrated droplets (0.05 mL per drop). Ideal for sensitive acid-base titrations and indicator testing.
            </p>

            <div className="flex justify-center py-4">
              <button
                onClick={handleAddDrop}
                disabled={sourceAvailable < 0.05}
                className="px-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <DropletsIcon className="w-4 h-4" />
                <span>Add 1 Drop (0.05 mL)</span>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
