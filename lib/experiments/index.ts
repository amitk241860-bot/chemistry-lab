import type { Experiment, ClassId } from '@/types/experiment';
import { CORE_EXPERIMENTS } from './fiveExperiments';
import { CLASS9_EXPERIMENTS } from './class9';
import { CLASS10_EXPERIMENTS } from './class10';
import { CLASS11_EXPERIMENTS } from './class11';
import { CLASS12_EXPERIMENTS } from './class12';

export { CORE_EXPERIMENTS };

export const ALL_EXPERIMENTS: Experiment[] = [
  ...CORE_EXPERIMENTS,
  ...CLASS9_EXPERIMENTS,
  ...CLASS10_EXPERIMENTS,
  ...CLASS11_EXPERIMENTS,
  ...CLASS12_EXPERIMENTS,
];

export function getExperimentsByClass(classId: ClassId): Experiment[] {
  return ALL_EXPERIMENTS.filter((exp) => exp.classId === classId);
}

export function getExperimentById(id: string): Experiment | undefined {
  return ALL_EXPERIMENTS.find((exp) => exp.id === id);
}

export function getCategoriesByClass(classId: ClassId): string[] {
  const exps = getExperimentsByClass(classId);
  return Array.from(new Set(exps.map((e) => e.category)));
}
