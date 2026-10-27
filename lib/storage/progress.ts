import type { ProgressEntry, UserSettings, ClassId } from '@/types/experiment';

const STORAGE_KEYS = {
  PROGRESS: 'chem_lab_progress_v1',
  SETTINGS: 'chem_lab_settings_v1',
  BOOKMARKS: 'chem_lab_bookmarks_v1',
  BADGES: 'chem_lab_badges_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  selectedClass: 10,
  reducedMotion: false,
  showHints: true,
  cameraSpeed: 'normal',
};

export async function saveProgress(entry: ProgressEntry): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const existing = await getAllProgress();
    const prev = existing[entry.experimentId];
    const bestScore = prev ? Math.max(prev.bestQuizScore, entry.bestQuizScore) : entry.bestQuizScore;
    const attempts = prev ? prev.attempts + 1 : 1;

    existing[entry.experimentId] = {
      ...entry,
      bestQuizScore: bestScore,
      attempts,
    };

    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(existing));
    await checkAndAwardBadges(existing);
  } catch (err) {
    console.error('Failed to save progress:', err);
  }
}

export async function getAllProgress(): Promise<Record<string, ProgressEntry>> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export async function getProgressByClass(classId: ClassId): Promise<ProgressEntry[]> {
  const all = await getAllProgress();
  return Object.values(all).filter((entry) => entry.classId === classId);
}

export function getStoredSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: Partial<UserSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function getBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(experimentId: string): boolean {
  if (typeof window === 'undefined') return false;
  const current = getBookmarks();
  let updated: string[];
  let isBookmarked: boolean;

  if (current.includes(experimentId)) {
    updated = current.filter((id) => id !== experimentId);
    isBookmarked = false;
  } else {
    updated = [...current, experimentId];
    isBookmarked = true;
  }

  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  return isBookmarked;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  isUnlocked: boolean;
}

export const BADGE_DEFINITIONS: Omit<Badge, 'isUnlocked'>[] = [
  {
    id: 'first_reaction',
    name: 'First Reaction',
    icon: '🧪',
    description: 'Complete your first chemistry experiment successfully.',
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    icon: '🏆',
    description: 'Score 100% on any post-experiment quiz.',
  },
  {
    id: 'class_champion',
    name: 'Curriculum Hero',
    icon: '⚗️',
    description: 'Complete all 5 experiments in any single CBSE class.',
  },
  {
    id: 'curious_chemist',
    name: 'Curious Explorer',
    icon: '🔬',
    description: 'Perform experiments across at least two different classes.',
  },
  {
    id: 'lab_safety_first',
    name: 'Safety Inspector',
    icon: '🛡️',
    description: 'Review and acknowledge lab safety protocols before experiments.',
  },
];

export async function getEarnedBadges(): Promise<Badge[]> {
  const all = await getAllProgress();
  const completedCount = Object.keys(all).length;
  const scores = Object.values(all).map((p) => p.bestQuizScore);
  const classesExplored = new Set(Object.values(all).map((p) => p.classId)).size;

  return BADGE_DEFINITIONS.map((badge) => {
    let isUnlocked = false;
    if (badge.id === 'first_reaction' && completedCount >= 1) isUnlocked = true;
    if (badge.id === 'quiz_master' && scores.some((s) => s === 100)) isUnlocked = true;
    if (badge.id === 'class_champion') {
      const classCounts: Record<number, number> = {};
      Object.values(all).forEach((p) => {
        classCounts[p.classId] = (classCounts[p.classId] || 0) + 1;
      });
      isUnlocked = Object.values(classCounts).some((c) => c >= 5);
    }
    if (badge.id === 'curious_chemist' && classesExplored >= 2) isUnlocked = true;
    if (badge.id === 'lab_safety_first' && completedCount >= 1) isUnlocked = true;

    return { ...badge, isUnlocked };
  });
}

async function checkAndAwardBadges(progressMap: Record<string, ProgressEntry>): Promise<void> {
  // Automatically computed dynamically via getEarnedBadges
}
