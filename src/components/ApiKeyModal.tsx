// =============================================================================
// UtsavAI — Bring Your Own Key (BYOK) & Model Settings Modal
// Supports: OpenRouter (Default pre-configured), Google Gemini, OpenAI, Groq, Custom
// Allows users to:
// 1. Choose Provider
// 2. Paste their own API key (or use default OpenRouter key)
// 3. Choose from curated models or enter any custom model ID
// 4. Test live connection before saving
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Zap,
  Cpu,
  Globe,
  Sparkles,
  Layers,
  ExternalLink,
  Loader2,
  Check,
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
  DEFAULT_PROVIDER,
  DEFAULT_OPENROUTER_KEY,
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
  const [customModelInput, setCustomModelInput] = useState<string>('');
  const [isUsingCustomModel, setIsUsingCustomModel] = useState<boolean>(false);
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
    const providerDef = PROVIDERS[providerId];
    const isCurated = providerDef.models.some((m) => m.id === model);

    if (isCurated) {
      setSelectedModel(model);
      setIsUsingCustomModel(false);
      setCustomModelInput('');
    } else {
      setSelectedModel(model);
      setIsUsingCustomModel(true);
      setCustomModelInput(model);
    }

    if (providerId === 'custom') {
      setCustomBaseUrl(getCustomBaseUrl());
    }

    setValidationError(null);
    setTestResult(null);
  };

  if (!isOpen) return null;

  const currentProviderDef = PROVIDERS[selectedProvider];
  const isDefaultOpenRouter =
    selectedProvider === 'openrouter' &&
    (!inputKey || inputKey.trim() === DEFAULT_OPENROUTER_KEY || inputKey.trim() === '');

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

  const handleModelSelect = (mId: string) => {
    setSelectedModel(mId);
    setIsUsingCustomModel(false);
    setTestResult(null);
  };

  const handleCustomModelToggle = (enable: boolean) => {
    setIsUsingCustomModel(enable);
    if (enable) {
      setSelectedModel(customModelInput.trim() || currentProviderDef.defaultModel);
    } else {
      setSelectedModel(currentProviderDef.defaultModel);
    }
    setTestResult(null);
  };

  const handleCustomModelInputChange = (val: string) => {
    setCustomModelInput(val);
    setSelectedModel(val.trim());
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const modelToTest = isUsingCustomModel ? customModelInput.trim() : selectedModel;
    const res = await testProviderConnection(selectedProvider, inputKey, modelToTest, customBaseUrl);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    // 1. Validate key if required
    const keyRes = validateProviderKey(selectedProvider, inputKey);
    if (!keyRes.valid && selectedProvider !== 'openrouter') {
      setValidationError(keyRes.message || 'Please provide a valid API key.');
      return;
    }

    // 2. Persist Provider
    setActiveProvider(selectedProvider);

    // 3. Persist Key
    if (selectedProvider === 'openrouter' && (!inputKey || inputKey.trim() === '')) {
      clearProviderApiKey('openrouter');
    } else {
      saveProviderApiKey(selectedProvider, inputKey.trim());
    }

    // 4. Persist Model
    const finalModel = isUsingCustomModel && customModelInput.trim().length > 0
      ? customModelInput.trim()
      : selectedModel || currentProviderDef.defaultModel;
    saveProviderModel(selectedProvider, finalModel);

    // 5. Persist Custom Base URL if applicable
    if (selectedProvider === 'custom' && customBaseUrl.trim().length > 0) {
      saveCustomBaseUrl(customBaseUrl.trim());
    }

    setSaved(true);
    setValidationError(null);
    onKeyChanged();

    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleRevertToDefault = () => {
    setActiveProvider(DEFAULT_PROVIDER);
    clearProviderApiKey('openrouter');
    saveProviderModel('openrouter', 'openrouter/free');
    setSelectedProvider('openrouter');
    setInputKey('');
    setSelectedModel('openrouter/free');
    setIsUsingCustomModel(false);
    setCustomModelInput('');
    setValidationError(null);
    setTestResult({
      success: true,
      message: 'Reverted to default pre-configured OpenRouter connection.',
    });
    onKeyChanged();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="byok-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-6 animate-fadeIn max-h-[92vh] overflow-y-auto">
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
            <div className="flex items-center gap-2">
              <h2 id="byok-modal-title" className="text-lg sm:text-xl font-bold text-slate-900">
                AI Provider & Model Settings
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                BYOK Supported
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Choose your AI provider, paste your API key, and select any model. Default pre-configured OpenRouter is always available.
            </p>
          </div>
        </div>

        {/* STEP 1: CHOOSE PROVIDER */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={13} className="text-indigo-600" />
            <span>1. Select AI Provider</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" role="radiogroup" aria-label="Select AI Provider">
            {/* OpenRouter */}
            <button
              type="button"
              onClick={() => handleProviderSelect('openrouter')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                selectedProvider === 'openrouter'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Globe size={18} className={selectedProvider === 'openrouter' ? 'text-indigo-600' : 'text-slate-500'} />
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  Default
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">OpenRouter</p>
                <p className="text-[10px] text-slate-500">Free & Multi-LLM</p>
              </div>
            </button>

            {/* Google Gemini */}
            <button
              type="button"
              onClick={() => handleProviderSelect('gemini')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                selectedProvider === 'gemini'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <Sparkles size={18} className={selectedProvider === 'gemini' ? 'text-indigo-600' : 'text-slate-500'} />
              <div>
                <p className="text-xs font-bold text-slate-900">Gemini</p>
                <p className="text-[10px] text-slate-500">Google AI Studio</p>
              </div>
            </button>

            {/* OpenAI */}
            <button
              type="button"
              onClick={() => handleProviderSelect('openai')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                selectedProvider === 'openai'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <Cpu size={18} className={selectedProvider === 'openai' ? 'text-indigo-600' : 'text-slate-500'} />
              <div>
                <p className="text-xs font-bold text-slate-900">OpenAI</p>
                <p className="text-[10px] text-slate-500">GPT-4o & Mini</p>
              </div>
            </button>

            {/* Groq */}
            <button
              type="button"
              onClick={() => handleProviderSelect('groq')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                selectedProvider === 'groq'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <Zap size={18} className={selectedProvider === 'groq' ? 'text-amber-500' : 'text-slate-500'} />
              <div>
                <p className="text-xs font-bold text-slate-900">Groq</p>
                <p className="text-[10px] text-slate-500">Ultra-fast LPU</p>
              </div>
            </button>

            {/* Custom */}
            <button
              type="button"
              onClick={() => handleProviderSelect('custom')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                selectedProvider === 'custom'
                  ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <Layers size={18} className={selectedProvider === 'custom' ? 'text-indigo-600' : 'text-slate-500'} />
              <div>
                <p className="text-xs font-bold text-slate-900">Custom</p>
                <p className="text-[10px] text-slate-500">Any OpenAI URL</p>
              </div>
            </button>
          </div>
        </div>

        {/* STEP 2: API KEY INPUT */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label htmlFor="byok-api-key-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Key size={13} className="text-indigo-600" />
              <span>2. {currentProviderDef.name} API Key</span>
            </label>

            {selectedProvider === 'openrouter' && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ★ Pre-configured Key Active
              </span>
            )}
          </div>

          {/* Help box for OpenRouter default */}
          {selectedProvider === 'openrouter' && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
              <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Default Key Included:</p>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  You can generate plans immediately without entering a key! Leave this field blank to use the pre-configured OpenRouter key, or paste your personal OpenRouter key below.
                </p>
              </div>
            </div>
          )}

          {/* Custom Base URL (if Custom provider selected) */}
          {selectedProvider === 'custom' && (
            <div className="space-y-1">
              <label htmlFor="custom-base-url-input" className="block text-[11px] font-bold text-slate-600 uppercase">
                Base URL (OpenAI-compatible)
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

          {/* Key Input Field */}
          <div className="relative">
            <input
              id="byok-api-key-input"
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder={isDefaultOpenRouter ? 'Using pre-configured default key (paste your own to override)' : currentProviderDef.keyPlaceholder}
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
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Need a {currentProviderDef.shortName} key?{' '}
              <a
                href={currentProviderDef.keyDocUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-0.5"
              >
                <span>Get key from {currentProviderDef.shortName}</span>
                <ExternalLink size={10} />
              </a>
            </span>

            {isDefaultOpenRouter && (
              <span className="font-mono text-emerald-700 font-semibold">Active: sk-or-v1-...5c4</span>
            )}
          </div>
        </div>

        {/* STEP 3: MODEL SELECTION */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu size={13} className="text-indigo-600" />
              <span>3. Choose or Custom Model</span>
            </label>

            {/* Custom Model Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-700 font-medium select-none">
              <input
                type="checkbox"
                checked={isUsingCustomModel}
                onChange={(e) => handleCustomModelToggle(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Type custom model name</span>
            </label>
          </div>

          {/* Curated Models Grid (when not custom) */}
          {!isUsingCustomModel && currentProviderDef.models.length > 0 && (
            <div className="space-y-2" role="radiogroup" aria-label="Curated models">
              {currentProviderDef.models.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleModelSelect(m.id)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleModelSelect(m.id);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-500 ring-1 ring-indigo-500/30 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">{m.name}</span>
                        {m.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            {m.badge}
                          </span>
                        )}
                        {m.speed && (
                          <span className="text-[11px] font-mono text-slate-500 ml-auto flex items-center gap-1 font-semibold">
                            <Zap size={10} className="text-amber-500" />
                            <span>{m.speed}</span>
                          </span>
                        )}
                      </div>
                      {m.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom Model Input (when toggle is checked or no curated models) */}
          {(isUsingCustomModel || currentProviderDef.models.length === 0) && (
            <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <label htmlFor="custom-model-id-input" className="block text-xs font-semibold text-slate-700">
                Custom Model Identifier:
              </label>
              <input
                id="custom-model-id-input"
                type="text"
                value={customModelInput}
                onChange={(e) => handleCustomModelInputChange(e.target.value)}
                placeholder={currentProviderDef.defaultModel}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-mono shadow-xs"
              />
              <p className="text-[11px] text-slate-500">
                Enter the exact model string (e.g. <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-800 font-mono">gemini-2.5-flash</code>, <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-800 font-mono">gpt-4o-mini</code>, <code className="bg-slate-200/80 px-1 py-0.5 rounded text-slate-800 font-mono">deepseek/deepseek-r1</code>).
              </p>
            </div>
          )}
        </div>

        {/* STEP 4: LIVE CONNECTION TEST */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSave}
            disabled={Boolean(validationError) || isTesting}
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

          <button
            type="button"
            onClick={handleRevertToDefault}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-xs sm:text-sm cursor-pointer"
            title="Reset to pre-configured OpenRouter connection"
          >
            <RotateCcw size={13} />
            <span>Reset to Default (OpenRouter)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
