'use client';

import React from 'react';
import type { ObservationRow } from '@/types/experiment';

interface ObservationTableProps {
  expectedObservations: ObservationRow[];
  liveObservations: ObservationRow[];
  result?: string;
  conclusion?: string;
}

export const ObservationTable: React.FC<ObservationTableProps> = ({
  expectedObservations,
  liveObservations,
  result,
  conclusion,
}) => {
  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <span>Laboratory Observation Record</span>
        </h3>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300">
          CBSE NCERT Format
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/50 text-slate-300">
              <th className="p-3 font-semibold">S.No.</th>
              <th className="p-3 font-semibold">Experimental Parameter</th>
              <th className="p-3 font-semibold">Standard Reference Value</th>
              <th className="p-3 font-semibold text-cyan-400">Recorded Live Observation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {expectedObservations.map((obs, idx) => {
              const live = liveObservations[idx];
              return (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="p-3 text-slate-200 font-medium">{obs.parameter}</td>
                  <td className="p-3 text-slate-400">{obs.value}</td>
                  <td className="p-3 text-cyan-300 font-medium">
                    {live ? live.value : 'Pending test...'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Result & Conclusion Notes */}
      {(result || conclusion) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
          {result && (
            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
              <div className="font-semibold text-cyan-400 mb-1">Result:</div>
              <p className="text-slate-300 leading-relaxed">{result}</p>
            </div>
          )}
          {conclusion && (
            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5">
              <div className="font-semibold text-emerald-400 mb-1">Conclusion:</div>
              <p className="text-slate-300 leading-relaxed">{conclusion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
