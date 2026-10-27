import type {
  Experiment,
  ExperimentSession,
  LabState,
  ObservationRow,
  UserAction,
} from '@/types/experiment';
import { validateStepAction, type ValidationResult } from './validator';

export class SimulationEngine {
  private session: ExperimentSession;

  constructor(experiment: Experiment) {
    this.session = {
      experiment,
      labState: 'safety',
      currentStep: 0,
      completedSteps: [],
      observations: [],
      hintsUsed: 0,
      quizAnswers: [],
      quizScore: null,
      startedAt: new Date(),
      completedAt: null,
      attempts: 1,
    };
  }

  public getSession(): ExperimentSession {
    return { ...this.session };
  }

  public setLabState(state: LabState): void {
    this.session.labState = state;
  }

  public advanceFromSafety(): void {
    this.session.labState = 'intro';
  }

  public startSimulation(): void {
    this.session.labState = 'running';
  }

  public submitAction(action: UserAction): {
    success: boolean;
    result: ValidationResult;
    session: ExperimentSession;
  } {
    const currentStep = this.session.experiment.steps[this.session.currentStep];
    if (!currentStep) {
      return {
        success: false,
        result: { valid: false, message: 'No active step.' },
        session: this.getSession(),
      };
    }

    const validation = validateStepAction(currentStep, action);
    if (validation.valid) {
      if (!this.session.completedSteps.includes(this.session.currentStep)) {
        this.session.completedSteps.push(this.session.currentStep);
      }

      if (currentStep.observation) {
        this.addObservation({
          parameter: currentStep.title,
          value: currentStep.observation,
        });
      }

      // Check if all steps done
      if (this.session.currentStep < this.session.experiment.steps.length - 1) {
        this.session.currentStep += 1;
      } else {
        this.session.labState = 'observing';
      }
    }

    return {
      success: validation.valid,
      result: validation,
      session: this.getSession(),
    };
  }

  public goToStep(stepIndex: number): boolean {
    if (stepIndex >= 0 && stepIndex < this.session.experiment.steps.length) {
      this.session.currentStep = stepIndex;
      return true;
    }
    return false;
  }

  public useHint(): string {
    const currentStep = this.session.experiment.steps[this.session.currentStep];
    this.session.hintsUsed += 1;
    return currentStep?.hint || 'Review the instructions carefully.';
  }

  public addObservation(obs: ObservationRow): void {
    const existing = this.session.observations.findIndex((o) => o.parameter === obs.parameter);
    if (existing >= 0) {
      this.session.observations[existing] = obs;
    } else {
      this.session.observations.push(obs);
    }
  }

  public finishObservation(): void {
    if (this.session.experiment.quiz && this.session.experiment.quiz.length > 0) {
      this.session.labState = 'quiz';
    } else {
      this.completeExperiment();
    }
  }

  public submitQuiz(answers: number[]): { scorePercent: number; correctCount: number } {
    this.session.quizAnswers = answers;
    const questions = this.session.experiment.quiz;
    let correct = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correct++;
      }
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    this.session.quizScore = scorePercent;
    this.completeExperiment();
    return { scorePercent, correctCount: correct };
  }

  public completeExperiment(): void {
    this.session.labState = 'completed';
    this.session.completedAt = new Date();
  }

  public resetExperiment(): void {
    this.session.labState = 'running';
    this.session.currentStep = 0;
    this.session.completedSteps = [];
    this.session.observations = [];
    this.session.quizAnswers = [];
    this.session.quizScore = null;
    this.session.attempts += 1;
  }
}
