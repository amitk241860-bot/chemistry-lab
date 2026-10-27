'use client';

import React from 'react';
import { ShieldAlertIcon, CheckIcon } from '@/components/ui/Icons';
import { CyanButton } from '@/components/ui/CyanButton';

interface SafetyModalProps {
  safetyNotes: string[];
  chemicals: string[];
  onAcknowledge: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({
  safetyNotes,
  chemicals,
  onAcknowledge,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlertIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Laboratory Safety Protocol
            </h2>
            <p className="text-xs text-amber-400/90 font-medium">
              CBSE Safety Guidelines & Chemical Precautions
            </p>
          </div>
        </div>

        {/* Chemical Hazard Warning */}
        {chemicals.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-slate-800/60 border border-white/5">
            <div className="text-xs font-semibold text-slate-300 mb-1.5">
              Reagents Used in this Experiment:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {chemicals.map((chem) => (
                <span
                  key={chem}
                  className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-mono"
                >
                  {chem}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Safety Directives */}
        <div className="space-y-2.5 mb-6">
          <div className="text-xs font-semibold text-slate-200">
            Safety Directives:
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {safetyNotes.map((note, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{note}</span>
              </li>
            ))}
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
              <span className="leading-relaxed">
                Always follow virtual lab step indicators and handle apparatus systematically.
              </span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <CyanButton
            variant="primary"
            size="md"
            icon={<CheckIcon className="w-4 h-4" />}
            onClick={onAcknowledge}
            className="w-full justify-center"
          >
            I Acknowledge & Enter Laboratory
          </CyanButton>
        </div>
      </div>
    </div>
  );
};
