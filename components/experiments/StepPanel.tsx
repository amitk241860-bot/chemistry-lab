'use client';

import React, { useState } from 'react';
import type { ExperimentStep } from '@/types/experiment';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LightbulbIcon,
  CheckIcon,
  RotateCcwIcon,
  SparklesIcon,
} from '@/components/ui/Icons';
import { CyanButton } from '@/components/ui/CyanButton';

interface StepPanelProps {
  currentStep: ExperimentStep;
  stepIndex: number;
  totalSteps: number;
  isCompleted: boolean;
  onPerformAction: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onReset: () => void;
  onUseHint: () => string;
}

export const StepPanel: React.FC<StepPanelProps> = ({
  currentStep,
  stepIndex,
  totalSteps,
  isCompleted,
  onPerformAction,
  onPrevStep,
  onNextStep,
  onReset,
  onUseHint,
}) => {
  const [hintText, setHintText] = useState<string | null>(null);

  const handleHintClick = () => {
    const hint = onUseHint();
    setHintText(hint);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-xl">
      {/* Top Header: Step Counter & Progress Bar */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <h3 className="font-bold text-white text-base truncate">
            {currentStep.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleHintClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
          >
            <LightbulbIcon className="w-3.5 h-3.5" />
            <span>Hint</span>
          </button>
          <button
            onClick={onReset}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Experiment"
          >
            <RotateCcwIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
          style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Instruction */}
      <p className="text-sm text-slate-200 leading-relaxed mb-4 bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
        {currentStep.instruction}
      </p>

      {/* Progressive Hint Drawer */}
      {hintText && (
        <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5 animate-in fade-in duration-200">
          <LightbulbIcon className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-amber-300">Teacher’s Hint: </span>
            {hintText}
          </div>
        </div>
      )}

      {/* Observation Popup if Step Completed */}
      {currentStep.observation && isCompleted && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5 animate-in fade-in duration-200">
          <SparklesIcon className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-emerald-300">Observation Recorded: </span>
            {currentStep.observation}
          </div>
        </div>
      )}

      {/* Step Controls Bar */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
        <button
          disabled={stepIndex === 0}
          onClick={onPrevStep}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-3">
          <CyanButton
            variant={isCompleted ? 'secondary' : 'primary'}
            size="md"
            icon={isCompleted ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : undefined}
            onClick={onPerformAction}
          >
            {isCompleted ? 'Re-execute Action' : 'Perform Action on Apparatus'}
          </CyanButton>

          <CyanButton
            variant="outline"
            size="md"
            disabled={!isCompleted || stepIndex === totalSteps - 1}
            onClick={onNextStep}
            icon={<ChevronRightIcon className="w-4 h-4" />}
          >
            Next Step
          </CyanButton>
        </div>
      </div>
    </div>
  );
};
