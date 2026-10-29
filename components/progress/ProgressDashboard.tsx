'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAllProgress,
  getEarnedBadges,
  type Badge,
} from '@/lib/storage/progress';
import type { ProgressEntry } from '@/types/experiment';
import { ALL_EXPERIMENTS } from '@/lib/experiments';
import { AwardIcon, SparklesIcon, BookOpenIcon, RotateCcwIcon, CheckIcon } from '@/components/ui/Icons';
import { CyanButton } from '@/components/ui/CyanButton';

export const ProgressDashboard: React.FC = () => {
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({});
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const p = await getAllProgress();
      const b = await getEarnedBadges();
      setProgress(p);
      setBadges(b);
      setLoading(false);
    }
    loadData();
  }, []);

  const completedCount = Object.keys(progress).length;
  const totalExperiments = ALL_EXPERIMENTS.length;
  const scores = Object.values(progress).map((p) => p.bestQuizScore);
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const classProgress = [9, 10, 11, 12].map((cls) => {
    const classTotal = ALL_EXPERIMENTS.filter((e) => e.classId === cls).length;
    const classDone = Object.values(progress).filter((p) => p.classId === cls).length;
    return {
      classId: cls,
      done: classDone,
      total: classTotal,
      percentage: classTotal > 0 ? Math.round((classDone / classTotal) * 100) : 0,
    };
  });

  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleClearProgress = () => {
    localStorage.removeItem('chem_lab_progress_v1');
    localStorage.removeItem('chem_lab_badges_v1');
    setProgress({});
    setConfirmingReset(false);
    getEarnedBadges().then(setBadges);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <AwardIcon className="w-6 h-6 text-cyan-400" />
            <span>Student Performance & Progress</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Offline-first laboratory portfolio with CBSE quiz scores and concept mastery tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          {!confirmingReset ? (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-slate-900 border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs transition-colors cursor-pointer"
            >
              <RotateCcwIcon className="w-3.5 h-3.5" />
              <span>Reset Local Records</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/40 rounded-xl px-3 py-1.5">
              <span className="text-xs text-rose-200 font-semibold">Reset all records?</span>
              <button
                type="button"
                onClick={handleClearProgress}
                className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
          <div className="text-xs text-slate-400 mb-1">Experiments Completed</div>
          <div className="text-3xl font-black text-white flex items-baseline gap-1.5">
            <span className="text-cyan-400">{completedCount}</span>
            <span className="text-xs text-slate-500">/ {totalExperiments}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {Math.round((completedCount / totalExperiments) * 100)}% of practical curriculum
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
          <div className="text-xs text-slate-400 mb-1">Average Quiz Score</div>
          <div className="text-3xl font-black text-emerald-400">
            {avgScore}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Concept comprehension</div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
          <div className="text-xs text-slate-400 mb-1">Achievements Unlocked</div>
          <div className="text-3xl font-black text-amber-400">
            {badges.filter((b) => b.isUnlocked).length} / {badges.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Student Badges</div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
          <div className="text-xs text-slate-400 mb-1">Curriculum Classes</div>
          <div className="text-3xl font-black text-purple-400">
            4 <span className="text-xs text-slate-500">Classes (9–12)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">CBSE Practical Syllabus</div>
        </div>
      </div>

      {/* Class Curriculum Breakdown */}
      <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-cyan-400" />
          <span>Class-wise Practical Coverage</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classProgress.map((cp) => (
            <Link
              key={cp.classId}
              href={`/classes/${cp.classId}`}
              className="p-4 rounded-xl bg-slate-950/60 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-white group-hover:text-cyan-300">
                  Class {cp.classId} Chemistry
                </span>
                <span className="text-xs text-cyan-400 font-semibold">
                  {cp.done} of {cp.total} done
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${cp.percentage}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Achievement Badges Section */}
      <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-amber-400" />
          <span>Curriculum Achievement Badges</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                badge.isUnlocked
                  ? 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-cyan-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'bg-slate-950/40 border-white/5 opacity-50'
              }`}
            >
              <div className="text-3xl shrink-0">{badge.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">{badge.name}</h3>
                  {badge.isUnlocked && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Unlocked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Storage Notice */}
      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-3">
        <SparklesIcon className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-white">Privacy by Design: </span>
          All experiment records, quiz scores, and unlocked awards are saved directly to your local browser storage. No user accounts, credentials, or tracking servers are used.
        </p>
      </div>
    </div>
  );
};
