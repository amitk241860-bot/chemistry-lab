// ============================================================
// ChemLab Settings Store (Browser LocalStorage)
// Manages user lab preferences and Preferred Gemini Model
// ============================================================

export interface UserLabSettings {
  geminiApiKey: string;
  preferredModel: string;
  enableSound: boolean;
  enableSafetyAlerts: boolean;
  autoValidateSteps: boolean;
}

const SETTINGS_KEY = 'chemlab_user_settings_v1';

export const DEFAULT_SETTINGS: UserLabSettings = {
  geminiApiKey: '',
  preferredModel: 'gemini-2.5-flash',
  enableSound: true,
  enableSafetyAlerts: true,
  autoValidateSteps: true,
};

function sanitizePreferredModel(model: unknown): string {
  if (typeof model !== 'string' || !model.trim()) {
    return DEFAULT_SETTINGS.preferredModel;
  }
  const m = model.trim();
  // Migrate nonexistent 'gemini-3.6-flash' or retired 1.5/1.0 models to 'gemini-2.5-flash'
  if (
    m.includes('3.6') ||
    m.includes('1.5') ||
    m.includes('1.0') ||
    m === 'gemini-pro'
  ) {
    return 'gemini-2.5-flash';
  }
  return m;
}

export function loadSettings(): UserLabSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);

    const model = sanitizePreferredModel(parsed.preferredModel);
    const updated = { ...DEFAULT_SETTINGS, ...parsed, preferredModel: model };

    if (parsed.preferredModel !== model) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    }
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<UserLabSettings>): UserLabSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const current = loadSettings();
    const nextModel =
      settings.preferredModel !== undefined
        ? sanitizePreferredModel(settings.preferredModel)
        : current.preferredModel;
    const updated = { ...current, ...settings, preferredModel: nextModel };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent('chemlab-settings-changed', { detail: updated })
    );
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getActiveApiKey(): string {
  if (typeof window === 'undefined') return '';
  const settings = loadSettings();
  return settings.geminiApiKey || '';
}
