'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Experiment, SceneChange } from '@/types/experiment';
import { SimulationEngine } from '@/lib/simulation/engine';
import { InteractiveWorkbench } from '@/components/laboratory/InteractiveWorkbench';
import type { ApparatusItem } from '@/components/laboratory/InteractiveApparatus';
import { SafetyModal } from './SafetyModal';
import { StepPanel } from './StepPanel';
import { ObservationTable } from './ObservationTable';
import { QuizModal } from './QuizModal';
import { saveProgress } from '@/lib/storage/progress';
import { SparklesIcon, ChevronLeftIcon, AwardIcon, BookOpenIcon } from '@/components/ui/Icons';
import { CyanButton } from '@/components/ui/CyanButton';
import { playStepChime, playCompletionFanfare } from '@/lib/audio/sounds';

interface ExperimentRunnerProps {
  experiment: Experiment;
}

function getInitialApparatusForExperiment(experiment: Experiment): ApparatusItem[] {
  const items: ApparatusItem[] = [];
  const req = experiment.requiredEquipment.map((e) => e.toLowerCase());

  // Conical Flask or Beaker
  if (req.some((e) => e.includes('flask') || e.includes('titration'))) {
    items.push({
      id: 'flask-1',
      modelType: 'conical-flask',
      name: 'Conical Flask',
      chemicalName: experiment.chemicals[0] || 'Standard Solution',
      position: [-1.2, -1.0, 0],
      liquidColor: '#38bdf8',
      liquidLevel: 0.6,
    });
  } else {
    items.push({
      id: 'beaker-1',
      modelType: 'beaker',
      name: 'Beaker 250mL',
      chemicalName: experiment.chemicals[0] || 'Solution A',
      position: [-1.2, -1.0, 0],
      liquidColor: '#38bdf8',
      liquidLevel: 0.5,
    });
  }

  // Burner & Tripod
  if (req.some((e) => e.includes('burner') || e.includes('heat') || e.includes('lamp'))) {
    items.push({
      id: 'tripod-1',
      modelType: 'tripod',
      name: 'Tripod & Gauze',
      position: [1.5, -1.0, 0],
    });
    items.push({
      id: 'burner-1',
      modelType: 'burner',
      name: 'Bunsen Burner',
      position: [1.5, -1.0, 0],
      isHeating: false,
    });
  }

  // China Dish
  if (req.some((e) => e.includes('china dish') || e.includes('evaporat') || e.includes('dish'))) {
    items.push({
      id: 'china-dish-1',
      modelType: 'china-dish',
      name: 'China Dish',
      chemicalName: 'Mixture',
      position: [0.2, -1.0, 0.9],
      liquidColor: '#e0f2fe',
      liquidLevel: 0.35,
    });
  }

  // Test Tube
  if (req.some((e) => e.includes('test tube'))) {
    items.push({
      id: 'test-tube-1',
      modelType: 'test-tube',
      name: 'Test Tube',
      chemicalName: experiment.chemicals[1] || 'Reagent B',
      position: [-2.2, -1.0, 0.4],
      liquidColor: '#f43f5e',
      liquidLevel: 0.55,
    });
  }

  // Measuring cylinder
  if (req.some((e) => e.includes('cylinder') || e.includes('pipette'))) {
    items.push({
      id: 'cylinder-1',
      modelType: 'measuring-cylinder',
      name: 'Measuring Cylinder',
      position: [0.3, -1.0, -0.2],
      liquidColor: '#38bdf8',
      liquidLevel: 0.7,
    });
  }

  // Lab stand
  if (req.some((e) => e.includes('stand') || e.includes('burette'))) {
    items.push({
      id: 'stand-1',
      modelType: 'lab-stand',
      name: 'Lab Stand & Clamp',
      position: [-0.3, -1.0, -0.8],
    });
  }

  return items;
}

export const ExperimentRunner: React.FC<ExperimentRunnerProps> = ({ experiment }) => {
  const [engine] = useState(() => new SimulationEngine(experiment));
  const [session, setSession] = useState(() => engine.getSession());

  // 3D Visual Scene Reactive States
  const [liquidColor, setLiquidColor] = useState<string>('#38bdf8');
  const [liquidLevel, setLiquidLevel] = useState<number>(0.5);
  const [isHeating, setIsHeating] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);

  const initialItems = useMemo(
    () => getInitialApparatusForExperiment(experiment),
    [experiment]
  );

  const applySceneChanges = (changes?: SceneChange[]) => {
    if (!changes) return;
    changes.forEach((c) => {
      if (c.type === 'color_change' && typeof c.value === 'string') {
        setLiquidColor(c.value);
      }
      if (c.type === 'pour_liquid') {
        setLiquidLevel(0.8);
      }
      if (c.type === 'show_label' && typeof c.value === 'string' && c.value.includes('Flame')) {
        setIsHeating(true);
      }
    });
  };

  const handlePerformAction = () => {
    const currentStep = experiment.steps[session.currentStep];
    if (!currentStep) return;

    // Trigger scene change
    applySceneChanges(currentStep.sceneChanges);
    if (currentStep.action.type === 'heat') {
      setIsHeating(true);
    }

    playStepChime();

    // Submit action to engine
    const res = engine.submitAction(currentStep.action);
    setSession(res.session);

    if (res.session.completedSteps.length === experiment.steps.length) {
      playCompletionFanfare();
    }
  };

  // Called when student performs hand action directly in 3D (e.g. moving burner under dish, pouring)
  const handleStepActionTriggered = (actionType: string) => {
    const currentStep = experiment.steps[session.currentStep];
    if (!currentStep) return;

    const stepType = currentStep.action.type as string;
    const matchesAction =
      stepType === actionType ||
      (actionType === 'pour_liquid' &&
        (stepType === 'pour' || stepType === 'add_chemical' || stepType === 'measure')) ||
      (actionType === 'add_chemical' &&
        (stepType === 'add_chemical' || stepType === 'add_indicator' || stepType === 'stir'));

    if (matchesAction || currentStep.action.type === 'observe') {
      handlePerformAction();
    }
  };

  const handlePrevStep = () => {
    if (session.currentStep > 0) {
      engine.goToStep(session.currentStep - 1);
      setSession(engine.getSession());
    }
  };

  const handleNextStep = () => {
    if (session.currentStep < experiment.steps.length - 1) {
      engine.goToStep(session.currentStep + 1);
      setSession(engine.getSession());
    } else {
      setShowQuiz(true);
    }
  };

  const handleReset = () => {
    engine.resetExperiment();
    setLiquidColor('#38bdf8');
    setLiquidLevel(0.5);
    setIsHeating(false);
    setShowQuiz(false);
    setSession(engine.getSession());
  };

  const handleFinishQuiz = async (score: number) => {
    setShowQuiz(false);
    engine.completeExperiment();
    setSession(engine.getSession());

    await saveProgress({
      experimentId: experiment.id,
      classId: experiment.classId,
      completedAt: new Date().toISOString(),
      attempts: session.attempts,
      bestQuizScore: score,
      hintsUsed: session.hintsUsed,
      timeSpentMinutes: experiment.estimatedMinutes,
    });
  };

  const currentStep = experiment.steps[session.currentStep];
  const isCurrentStepDone = session.completedSteps.includes(session.currentStep);
  const allStepsDone = session.completedSteps.length === experiment.steps.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Safety Briefing Modal */}
      {session.labState === 'safety' && (
        <SafetyModal
          safetyNotes={experiment.safetyNotes}
          chemicals={experiment.chemicals}
          onAcknowledge={() => {
            engine.startSimulation();
            setSession(engine.getSession());
          }}
        />
      )}

      {/* Quiz Modal */}
      {showQuiz && (
        <QuizModal
          questions={experiment.quiz}
          experimentTitle={experiment.title}
          onFinishQuiz={handleFinishQuiz}
        />
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href={`/classes/${experiment.classId}`} className="hover:text-cyan-400 flex items-center gap-1">
              <ChevronLeftIcon className="w-3.5 h-3.5" />
              <span>Class {experiment.classId} Experiments</span>
            </Link>
            <span>/</span>
            <span className="text-cyan-400">{experiment.category}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            {experiment.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 font-medium">
            Est. Time: {experiment.estimatedMinutes} mins
          </span>
          {allStepsDone && !session.completedAt && (
            <CyanButton
              variant="primary"
              size="md"
              icon={<AwardIcon className="w-4 h-4" />}
              onClick={() => setShowQuiz(true)}
            >
              Take Concept Quiz
            </CyanButton>
          )}
        </div>
      </div>

      {/* Main 2-Column Hands-on Lab Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 3D Hands-On Workbench (7 cols) */}
        <div className="lg:col-span-7 h-[500px] lg:h-[580px]">
          <InteractiveWorkbench
            initialItems={initialItems}
            liquidColor={liquidColor}
            isHeating={isHeating}
            onStepActionTriggered={handleStepActionTriggered}
          />
        </div>

        {/* Right Step Controls & Apparatus Info (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Scientific Principle Card */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-xs text-slate-300">
            <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
              <BookOpenIcon className="w-4 h-4" />
              <span>Scientific Principle</span>
            </div>
            <p className="leading-relaxed text-slate-300">{experiment.principle}</p>
          </div>

          {/* Step Controller (Hands-on guide on the side) */}
          {currentStep && (
            <StepPanel
              currentStep={currentStep}
              stepIndex={session.currentStep}
              totalSteps={experiment.steps.length}
              isCompleted={isCurrentStepDone}
              onPerformAction={handlePerformAction}
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              onReset={handleReset}
              onUseHint={() => engine.useHint()}
            />
          )}

          {/* Quick Apparatus Inventory */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-300 mb-2">Required Apparatus (Deployable from dock):</div>
            <div className="flex flex-wrap gap-1.5">
              {experiment.requiredEquipment.map((eq) => (
                <span
                  key={eq}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 font-mono"
                >
                  {eq}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Observation Table Section */}
      <ObservationTable
        expectedObservations={experiment.expectedObservations}
        liveObservations={session.observations}
        result={session.completedAt ? experiment.result : undefined}
        conclusion={session.completedAt ? experiment.conclusion : undefined}
      />

      {/* Completion Banner */}
      {session.completedAt && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <SparklesIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Experiment Completed Successfully!</h3>
              <p className="text-xs text-slate-300">
                Quiz score: <span className="text-emerald-400 font-bold">{session.quizScore}%</span> · Progress saved to local offline profile.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CyanButton variant="secondary" size="md" onClick={handleReset}>
              Perform Again
            </CyanButton>
            <Link href={`/classes/${experiment.classId}`}>
              <CyanButton variant="primary" size="md">
                Next Experiment
              </CyanButton>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
