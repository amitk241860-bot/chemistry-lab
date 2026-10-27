// ============================================================
// ChemLab Settings Store (Browser LocalStorage)
// Manages Google Gemini API Key and Preferred Model securely
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
  preferredModel: 'gemini-3.6-flash',
  enableSound: true,
  enableSafetyAlerts: true,
  autoValidateSteps: true,
};

export function loadSettings(): UserLabSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    
    // Auto-migrate discontinued models (1.5, 2.5) to Gemini 3.6 Flash
    let model = parsed.preferredModel || DEFAULT_SETTINGS.preferredModel;
    if (typeof model === 'string' && (model.includes('1.5') || model.includes('2.5'))) {
      model = 'gemini-3.6-flash';
    }

    const updated = { ...DEFAULT_SETTINGS, ...parsed, preferredModel: model };
    // Persist migrated model if needed
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
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    // Dispatch a custom event so open components react immediately
    window.dispatchEvent(new CustomEvent('chemlab-settings-changed', { detail: updated }));
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
