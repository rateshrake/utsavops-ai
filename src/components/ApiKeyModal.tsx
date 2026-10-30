// =============================================================================
// UtsavAI — Simplified BYOK & Model Settings Modal
// Simple, clean panel:
// 1. Choose Provider (OpenRouter, Groq, Google Gemini, OpenAI, xAI Grok, Custom)
// 2. Enter API Key
// 3. Manually type Model Name (no long model cards/lists)
// 4. Test Live Connection & Save
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Zap,
  Cpu,
  Globe,
  Sparkles,
  Layers,
  ExternalLink,
  Loader2,
  Check,
  Trash2,
} from 'lucide-react';
import {
  PROVIDERS,
  type ProviderId,
  getActiveProvider,
  setActiveProvider,
  getProviderApiKey,
  saveProviderApiKey,
  clearProviderApiKey,
  getProviderModel,
  saveProviderModel,
  getCustomBaseUrl,
  saveCustomBaseUrl,
  validateProviderKey,
  testProviderConnection,
} from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChanged: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyChanged }) => {
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>(() => getActiveProvider());
  const [inputKey, setInputKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [customBaseUrl, setCustomBaseUrl] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Connection testing state
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    elapsedSeconds?: number;
  } | null>(null);

  // Load current values when modal opens or provider changes
  useEffect(() => {
    if (isOpen) {
      const activeP = getActiveProvider();
      setSelectedProvider(activeP);
      loadProviderSettings(activeP);
    }
  }, [isOpen]);

  const loadProviderSettings = (providerId: ProviderId) => {
    const key = getProviderApiKey(providerId);
    setInputKey(key);

    const model = getProviderModel(providerId);
    setSelectedModel(model || PROVIDERS[providerId]?.defaultModel || '');

    if (providerId === 'custom') {
      setCustomBaseUrl(getCustomBaseUrl());
    }

    setValidationError(null);
    setTestResult(null);
  };

  const currentProviderDef = PROVIDERS[selectedProvider] || PROVIDERS.openrouter;
  const hasExistingKey = Boolean(inputKey && inputKey.trim().length > 0);

  if (!isOpen) return null;

  const handleProviderSelect = (pId: ProviderId) => {
    setSelectedProvider(pId);
    loadProviderSettings(pId);
  };

  const handleKeyChange = (val: string) => {
    setInputKey(val);
    setTestResult(null);
    const res = validateProviderKey(selectedProvider, val);
    if (!res.valid && val.trim().length > 0) {
      setValidationError(res.message || 'Invalid key format.');
    } else {
      setValidationError(null);
    }
  };

  const handleModelInputChange = (val: string) => {
    setSelectedModel(val);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const modelToTest = selectedModel.trim() || currentProviderDef.defaultModel;
    const res = await testProviderConnection(selectedProvider, inputKey, modelToTest, customBaseUrl);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    // 1. Validate key
    const keyRes = validateProviderKey(selectedProvider, inputKey);
    if (!keyRes.valid) {
      setValidationError(keyRes.message || 'Please provide a valid API key.');
      return;
    }

    // 2. Validate model
    if (!selectedModel || selectedModel.trim().length === 0) {
      setValidationError('Please type a model name.');
      return;
    }

    // 3. Persist Provider
    setActiveProvider(selectedProvider);

    // 4. Persist Key
    saveProviderApiKey(selectedProvider, inputKey.trim());

    // 5. Persist Model
    saveProviderModel(selectedProvider, selectedModel.trim());

    // 6. Persist Custom Base URL if applicable
    if (selectedProvider === 'custom' && customBaseUrl.trim().length > 0) {
      saveCustomBaseUrl(customBaseUrl.trim());
    }

    setSaved(true);
    setValidationError(null);
    onKeyChanged();

    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  const handleClearKey = () => {
    clearProviderApiKey(selectedProvider);
    setInputKey('');
    setValidationError(null);
    setTestResult({
      success: true,
      message: `Cleared API key for ${currentProviderDef.name}. App will use Demo Mode.`,
    });
    onKeyChanged();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 animate-scaleUp max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-slate-100"
          aria-label="Close API settings modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-200/80 shadow-xs shrink-0 mt-0.5">
            <Key size={20} />
          </div>
          <div>
            <h2 id="api-modal-title" className="text-lg font-bold text-slate-900">
              API Provider & Model Settings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your provider, paste your API key, and type the model name.
            </p>
          </div>
        </div>

        {/* 1. SELECT PROVIDER */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={13} className="text-indigo-600" />
            <span>1. Select AI Provider</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Select AI Provider">
            {/* OpenRouter */}
            <button
              type="button"
              onClick={() => handleProviderSelect('openrouter')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                selectedProvider === 'openrouter'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
              }`}
            >
              <Globe size={16} className={selectedProvider === 'openrouter' ? 'text-indigo-600' : 'text-slate-500'} />
              <span className="text-xs">OpenRouter</span>
            </button>

            {/* Groq */}
            <button
              type="button"
              onClick={() => handleProviderSelect('groq')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                selectedProvider === 'groq'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
              }`}
            >
              <Zap size={16} className={selectedProvider === 'groq' ? 'text-amber-500' : 'text-slate-500'} />
              <span className="text-xs">Groq</span>
            </button>

            {/* Google Gemini */}
            <button
              type="button"
              onClick={() => handleProviderSelect('gemini')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                selectedProvider === 'gemini'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
              }`}
            >
              <Sparkles size={16} className={selectedProvider === 'gemini' ? 'text-indigo-600' : 'text-slate-500'} />
              <span className="text-xs">Gemini</span>
            </button>

            {/* OpenAI */}
            <button
              type="button"
              onClick={() => handleProviderSelect('openai')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                selectedProvider === 'openai'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
              }`}
            >
              <Cpu size={16} className={selectedProvider === 'openai' ? 'text-indigo-600' : 'text-slate-500'} />
              <span className="text-xs">OpenAI</span>
            </button>

            {/* xAI (Grok) */}
            <button
              type="button"
              onClick={() => handleProviderSelect('xai')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                selectedProvider === 'xai'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
              }`}
            >
              <Zap size={16} className={selectedProvider === 'xai' ? 'text-indigo-600' : 'text-slate-500'} />
              <span className="text-xs">xAI (Grok)</span>
            </button>

            {/* Custom Endpoint */}
            <button
              type="button"
              onClick={() => handleProviderSelect('custom')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                selectedProvider === 'custom'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
              }`}
            >
              <Layers size={16} className={selectedProvider === 'custom' ? 'text-indigo-600' : 'text-slate-500'} />
              <span className="text-xs">Custom</span>
            </button>
          </div>
        </div>

        {/* 2. API KEY INPUT */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label htmlFor="api-key-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Key size={13} className="text-indigo-600" />
            <span>2. {currentProviderDef.name} API Key</span>
          </label>

          <div className="relative">
            <input
              id="api-key-input"
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder={currentProviderDef.keyPlaceholder}
              className="w-full pr-10 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-mono shadow-xs transition-colors"
              aria-label={`Enter API key for ${currentProviderDef.name}`}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 animate-fadeIn">
              <AlertTriangle size={14} className="text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Link to get key */}
          <div className="text-[11px] text-slate-500">
            Need a key?{' '}
            <a
              href={currentProviderDef.keyDocUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-0.5"
            >
              <span>Get key from {currentProviderDef.shortName}</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* 3. TYPE MODEL NAME */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label htmlFor="model-name-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu size={13} className="text-indigo-600" />
            <span>3. Model Name / Identifier</span>
          </label>

          <input
            id="model-name-input"
            type="text"
            value={selectedModel}
            onChange={(e) => handleModelInputChange(e.target.value)}
            placeholder={currentProviderDef.modelPlaceholder}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-mono shadow-xs font-semibold"
            aria-label="Enter model identifier"
          />

          <p className="text-[11px] text-slate-500 leading-snug">
            Type the exact model identifier you want to call (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">{currentProviderDef.defaultModel || 'model-name'}</code>).
          </p>
        </div>

        {/* Custom Base URL (if Custom provider selected) */}
        {selectedProvider === 'custom' && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label htmlFor="custom-base-url-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Custom Base URL
            </label>
            <input
              id="custom-base-url-input"
              type="text"
              value={customBaseUrl}
              onChange={(e) => setCustomBaseUrl(e.target.value)}
              placeholder="https://api.together.xyz/v1 or http://localhost:11434/v1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono shadow-xs"
            />
          </div>
        )}

        {/* 4. LIVE CONNECTION TEST */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !inputKey.trim() || !selectedModel.trim()}
            className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send a quick test message to verify key & model before saving"
          >
            {isTesting ? (
              <>
                <Loader2 size={13} className="animate-spin text-indigo-600" />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <Zap size={13} className="text-amber-500" />
                <span>Test Live Connection</span>
              </>
            )}
          </button>

          {/* Test Feedback Result */}
          {testResult && (
            <div
              className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {testResult.success ? (
                <Check size={14} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle size={14} className="text-rose-600 shrink-0" />
              )}
              <span className="truncate max-w-xs">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* 5. FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSave}
            disabled={isTesting}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-xs sm:text-sm shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
            aria-label="Save and apply AI settings"
          >
            {saved ? (
              <>
                <CheckCircle size={15} />
                <span>✓ Applied Successfully!</span>
              </>
            ) : (
              <span>Save & Apply Settings</span>
            )}
          </button>

          {hasExistingKey && (
            <button
              type="button"
              onClick={handleClearKey}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-medium rounded-xl transition-colors text-xs sm:text-sm cursor-pointer"
              title="Remove stored key and switch to Demo Mode"
            >
              <Trash2 size={13} />
              <span>Clear Key (Demo Mode)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
