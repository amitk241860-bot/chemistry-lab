'use client';

import React, { useState, useEffect } from 'react';
import {
  SettingsIcon,
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
  Volume2Icon,
  VolumeXIcon,
} from '@/components/ui/Icons';
import { loadSettings, saveSettings, UserLabSettings } from '@/lib/settings/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserLabSettings>(loadSettings());
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [serverKeyConfigured, setServerKeyConfigured] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string; models?: string[] } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadSettings());
      setTestResult(null);
      setSaveSuccess(false);
      fetch('/api/ai/test-key')
        .then((r) => r.json())
        .then((d) => {
          if (d && typeof d.configured === 'boolean') {
            setServerKeyConfigured(d.configured);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!settings.geminiApiKey && !serverKeyConfigured) {
      setTestResult({
        valid: false,
        message: 'Set GEMINI_API_KEY in .env.local on the server or enter a key to test.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.geminiApiKey || undefined,
          model: settings.preferredModel,
          includeModels: true,
        }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setTestResult({
          valid: true,
          message: data.message || 'Connection successful! Gemini AI is ready.',
          models: Array.isArray(data.availableModels) ? data.availableModels.slice(0, 6) : undefined,
        });
      } else {
        setTestResult({
          valid: false,
          message: data.error || 'Connection failed. Please verify your GEMINI_API_KEY in .env.local.',
        });
      }
    } catch (err: any) {
      setTestResult({
        valid: false,
        message: err?.message || 'Network error while testing API key.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Laboratory Settings & Gemini AI
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  Server .env.local Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure your Google Gemini model and laboratory simulation preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* API Key Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <KeyIcon className="w-3.5 h-3.5 text-cyan-400" />
                Google Gemini API Key
                {serverKeyConfigured && (
                  <span className="ml-1.5 px-2 py-0.5 text-[10px] rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold normal-case">
                    ✓ Loaded from Server .env.local
                  </span>
                )}
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
              >
                Get API Key (Google AI Studio) →
              </a>
            </div>

            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.geminiApiKey}
                onChange={(e) => {
                  setSettings({ ...settings, geminiApiKey: e.target.value });
                  setTestResult(null);
                }}
                placeholder={
                  serverKeyConfigured
                    ? 'Using server-side GEMINI_API_KEY from .env.local (optional override)...'
                    : 'Optional override (recommended: set GEMINI_API_KEY in .env.local)...'
                }
                className="w-full px-4 py-2.5 pr-24 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 font-mono transition"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 transition rounded-lg hover:bg-slate-800"
                  title={showKey ? 'Hide Key' : 'Show Key'}
                >
                  {showKey ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || (!settings.geminiApiKey && !serverKeyConfigured)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 disabled:hover:bg-cyan-600 transition flex items-center gap-1.5"
                >
                  {isTesting ? (
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Test'
                  )}
                </button>
              </div>
            </div>

            {/* Privacy note */}
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">🔒 Server-side .env.local supported:</span>{' '}
              Keep <code className="text-cyan-300">GEMINI_API_KEY</code> in <code className="text-cyan-300">.env.local</code> so it stays exclusively on the server.
            </p>

            {/* Test result status badge */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                  testResult.valid
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {testResult.valid ? (
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircleIcon className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                {testResult.models && testResult.models.length > 0 && (
                  <div className="pl-6 text-[10px] text-emerald-300/90 font-mono">
                    Verified key models: {testResult.models.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
              Default Gemini Model
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'gemini-2.5-flash',
                  name: 'Gemini 2.5 Flash',
                  tag: 'Recommended',
                  desc: 'Fastest reaction analysis & standard API key support',
                },
                {
                  id: 'gemini-flash-latest',
                  name: 'Gemini Flash Latest',
                  tag: 'Alias',
                  desc: 'Always resolves to the latest supported Flash model',
                },
                {
                  id: 'gemini-3.8-flash',
                  name: 'Gemini 3.8 Flash',
                  tag: 'Next-Gen',
                  desc: 'High-speed multimodal reasoning (auto-falls back if unavailable)',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, preferredModel: m.id })}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    settings.preferredModel === m.id
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-950/30'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-200">{m.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded ${
                          settings.preferredModel === m.id
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {m.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Preferences */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Laboratory Intelligence Preferences
            </h3>

            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                  {settings.enableSound ? <Volume2Icon className="w-4 h-4" /> : <VolumeXIcon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200">Web Audio Tactile Sound Effects</p>
                  <p className="text-[11px] text-slate-400">
                    Procedural audio synthesis for pouring, boiling bubbles, and success chimes
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableSound}
                onChange={(e) => setSettings({ ...settings, enableSound: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>

            {/* ChemMCP Safety Alerts Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                  <AlertCircleIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200">ChemMCP GHS Safety & Hazard Alerts</p>
                  <p className="text-[11px] text-slate-400">
                    Show real-time hazard statements, PPE alerts, and chemical warning badges
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enableSafetyAlerts}
                onChange={(e) => setSettings({ ...settings, enableSafetyAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>

            {/* AI Auto-Validation Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200">Live AI Procedure Step Validation</p>
                  <p className="text-[11px] text-slate-400">
                    Validate user bench actions in real time and trigger celebratory success banners
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoValidateSteps}
                onChange={(e) => setSettings({ ...settings, autoValidateSteps: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setSettings({ ...settings, geminiApiKey: '' });
              setTestResult(null);
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium transition"
          >
            Clear API Key
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              {saveSuccess ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-slate-950" />
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
