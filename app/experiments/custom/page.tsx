'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NobookWorkbench } from '@/components/laboratory/NobookWorkbench';
import { CustomExperimentSetup } from '@/app/api/ai/analyze-experiment/route';
import type { Experiment } from '@/types/experiment';
import { SparklesIcon } from '@/components/ui/Icons';

export default function CustomExperimentWorkbenchPage() {
  const [customSetup, setCustomSetup] = useState<CustomExperimentSetup | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('chemlab_active_custom_exp');
      if (raw) {
        const parsed = JSON.parse(raw);
        setCustomSetup(parsed);
      }
    } catch (e) {
      console.warn('Could not load custom experiment from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex items-center justify-center text-cyan-400">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider">Preparing AI Workbench...</span>
        </div>
      </div>
    );
  }

  // Construct Experiment object conforming to Experiment type
  const experiment: Experiment = {
    id: customSetup?.id || 'exp-custom-default',
    title: customSetup?.title || 'Custom AI Virtual Chemistry Experiment',
    classId: 11,
    category: customSetup?.reactionType || 'Synthesis',
    difficulty: 'intermediate',
    estimatedMinutes: 30,
    learningObjectives: [customSetup?.description || 'Custom interactive chemistry experiment simulation.'],
    requiredEquipment: (customSetup?.initialApparatus || []).map((a) => a.type),
    chemicals: (customSetup?.initialApparatus || []).flatMap((a) => a.activeChemicals || []),
    principle: customSetup?.equation || 'Chemical transformation and stoichiometric reaction.',
    steps: (customSetup?.milestones || []).length > 0
      ? customSetup!.milestones.map((m) => ({
          index: m.step - 1,
          title: m.title,
          instruction: m.instruction,
          action: { type: 'observe' as const },
          validation: { requiredAction: 'observe' as const, errorMessage: 'Follow the step instructions.' },
          hint: m.hintMessage || 'Review the procedure guide for guidance.',
        }))
      : [
          {
            index: 0,
            title: 'Initial Inspection',
            instruction: 'Inspect the apparatus and solutions on the workbench.',
            action: { type: 'observe' as const },
            validation: { requiredAction: 'observe' as const, errorMessage: '' },
            hint: 'Check the solution info panel for volumes and pH.',
          },
        ],
    expectedObservations: [
      {
        parameter: 'Observation',
        value: customSetup?.expectedOutcomes?.visualSummary || 'Visual reaction completed',
      },
    ],
    result: customSetup?.expectedOutcomes?.visualSummary || 'Verify reaction outcomes.',
    conclusion: `Verified reaction: ${customSetup?.equation || 'A + B -> C'}`,
    safetyNotes: [
      'Standard laboratory safety rules apply.',
      'Wear safety spectacles and protective gloves.',
      'Handle corrosive or toxic reagents carefully.',
    ],
    quiz: [],
    tags: ['Custom', 'AI Generated', customSetup?.reactionType || 'Synthesis'],
    isImplemented: true,
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950">
      <NobookWorkbench experiment={experiment} customSetup={customSetup || undefined} />
    </div>
  );
}
