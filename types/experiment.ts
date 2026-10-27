// ============================================================
// Experiment Types
// ============================================================

export type ClassId = 9 | 10 | 11 | 12;
export type LabState = 'idle' | 'safety' | 'intro' | 'running' | 'paused' | 'observing' | 'quiz' | 'completed';

export type ActionType =
  | 'select_equipment'
  | 'place_equipment'
  | 'add_chemical'
  | 'pour'
  | 'heat'
  | 'stir'
  | 'filter'
  | 'measure'
  | 'record_observation'
  | 'add_indicator'
  | 'titrate'
  | 'observe'
  | 'complete_step';

export interface UserAction {
  type: ActionType;
  targetId?: string;         // equipment or chemical ID
  value?: number | string;   // amount, reading, etc.
  metadata?: Record<string, unknown>;
}

export interface ValidationRule {
  requiredAction: ActionType;
  requiredTargetId?: string;
  valueRange?: [number, number];
  errorMessage: string;
  partialCreditOk?: boolean;
}

export interface ExperimentStep {
  index: number;
  title: string;
  instruction: string;
  action: UserAction;
  validation: ValidationRule;
  hint: string;
  observation?: string;
  safetyNote?: string;
  // 3D scene changes to apply when this step is reached
  sceneChanges?: SceneChange[];
}

export interface SceneChange {
  type: 'add_equipment' | 'remove_equipment' | 'pour_liquid' | 'color_change' | 'add_particles' | 'show_label';
  targetId: string;
  value?: string | number | [number, number, number];
}

export interface ObservationRow {
  parameter: string;
  value: string;
  unit?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Experiment {
  id: string;
  title: string;
  classId: ClassId;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  learningObjectives: string[];
  requiredEquipment: string[];    // Equipment IDs
  chemicals: string[];            // Substance IDs
  principle: string;              // Scientific principle explained
  steps: ExperimentStep[];
  expectedObservations: ObservationRow[];
  result: string;
  conclusion: string;
  safetyNotes: string[];
  quiz: QuizQuestion[];
  tags: string[];
  isImplemented: boolean;         // true = simulation works; false = coming soon
}

export interface ExperimentSession {
  experiment: Experiment;
  labState: LabState;
  currentStep: number;
  completedSteps: number[];
  observations: ObservationRow[];
  hintsUsed: number;
  quizAnswers: number[];
  quizScore: number | null;
  startedAt: Date;
  completedAt: Date | null;
  attempts: number;
}

export interface ProgressEntry {
  experimentId: string;
  classId: ClassId;
  completedAt: string;     // ISO date string
  attempts: number;
  bestQuizScore: number;
  hintsUsed: number;
  timeSpentMinutes: number;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  selectedClass: ClassId;
  reducedMotion: boolean;
  showHints: boolean;
  cameraSpeed: 'slow' | 'normal' | 'fast';
}
