// =============================================================================
// UtsavAI — API Key Settings Modal
// Clean, warm light mode modal for configuring Gemini API keys safely.
// Stored in browser sessionStorage only.
// =============================================================================

import React, { useState } from 'react';
import { X, Key, Eye, EyeOff, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { saveApiKeyToSession, clearSessionApiKey, getApiKey, isApiKeyAvailable } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChanged: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyChanged }) => {
  const [inputKey, setInputKey] = useState(() => (typeof window !== 'undefined' ? sessionStorage.getItem('utsavops_gemini_key') ?? '' : ''));
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const hasEnvKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());
  const currentKey = getApiKey();

  const handleSave = () => {
    saveApiKeyToSession(inputKey);
    setSaved(true);
    onKeyChanged();
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const handleClear = () => {
    clearSessionApiKey();
    setInputKey('');
    onKeyChanged();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-7 space-y-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100"
          aria-label="Close API Key Settings modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200/80 shadow-xs">
            <Key size={18} />
          </div>
          <div>
            <h2 id="api-key-modal-title" className="text-base sm:text-lg font-bold text-slate-900">
              API Key Settings
            </h2>
            <p className="text-xs text-slate-500">Gemini 2.5 Flash — securely stored in sessionStorage</p>
          </div>
        </div>

        {/* Env key status */}
        {hasEnvKey && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
            <p>
              Loaded from <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-[11px]">.env</code>. You can override it below for this session.
            </p>
          </div>
        )}

        {!isApiKeyAvailable() && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
            <p>
              No API key detected. Provide your Gemini key to enable live AI features, or test with rich pre-loaded plans.
            </p>
          </div>
        )}

        {/* Key input */}
        <div className="space-y-1.5">
          <label htmlFor="gemini-api-key" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Gemini API Key
          </label>
          <div className="relative">
            <input
              id="gemini-api-key"
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full pr-10 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-mono shadow-xs transition-colors"
              aria-label="Enter your Gemini API key"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Your key is <strong className="text-slate-700">never sent to any intermediate server</strong>. It communicates directly with Google's Gemini API endpoints and clears when you close this browser tab.
        </p>

        {/* Current active key indicator */}
        {currentKey && (
          <p className="text-xs text-slate-600 font-mono">
            Active key: <code className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">{currentKey.slice(0, 8)}...{currentKey.slice(-4)}</code>
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2.5 pt-2">
          <button
            onClick={handleSave}
            disabled={!inputKey.trim()}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-xs sm:text-sm shadow-sm cursor-pointer"
            aria-label="Save API key to session storage"
          >
            {saved ? '✓ Saved!' : 'Save Key'}
          </button>
          {sessionStorage.getItem('utsavops_gemini_key') && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium rounded-xl transition-colors text-xs sm:text-sm cursor-pointer"
              aria-label="Clear saved API key from session storage"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
