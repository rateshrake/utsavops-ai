// =============================================================================
// UtsavAI — Simplified BYOK & Model Settings Modal
// Modular coordination panel:
// 1. Choose Provider (ProviderSelector)
// 2. Enter API Key (ApiKeyInput)
// 3. Manually type Model Name (ModelNameInput)
// 4. Test Live Connection (ConnectionTester)
// Includes focus trap and escape key management for WCAG 2.1 compliance.
// =============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Key, CheckCircle, Trash2 } from 'lucide-react';
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
import { ProviderSelector } from './apikey/ProviderSelector';
import { ApiKeyInput } from './apikey/ApiKeyInput';
import { ModelNameInput } from './apikey/ModelNameInput';
import { ConnectionTester } from './apikey/ConnectionTester';

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
  const [saved, setSaved] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Connection testing state
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    elapsedSeconds?: number;
  } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const loadProviderSettings = useCallback((providerId: ProviderId) => {
    const key = getProviderApiKey(providerId);
    setInputKey(key);

    const model = getProviderModel(providerId);
    setSelectedModel(model || PROVIDERS[providerId]?.defaultModel || '');

    if (providerId === 'custom') {
      setCustomBaseUrl(getCustomBaseUrl());
    }

    setValidationError(null);
    setTestResult(null);
  }, []);

  // Load current values when modal opens
  useEffect(() => {
    if (isOpen) {
      const activeP = getActiveProvider();
      setSelectedProvider(activeP);
      loadProviderSettings(activeP);
    }
  }, [isOpen, loadProviderSettings]);

  // Focus trap & Escape key handler (WCAG 2.1 compliance)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentProviderDef = PROVIDERS[selectedProvider] ?? PROVIDERS.openrouter;
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
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 animate-scaleUp max-h-[92vh] overflow-y-auto"
      >
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
        <ProviderSelector
          selectedProvider={selectedProvider}
          onSelect={handleProviderSelect}
        />

        {/* 2. API KEY INPUT */}
        <ApiKeyInput
          providerDef={currentProviderDef}
          inputKey={inputKey}
          onChange={handleKeyChange}
          validationError={validationError}
        />

        {/* 3. TYPE MODEL NAME */}
        <ModelNameInput
          providerDef={currentProviderDef}
          isCustom={selectedProvider === 'custom'}
          selectedModel={selectedModel}
          onModelChange={handleModelInputChange}
          customBaseUrl={customBaseUrl}
          onCustomBaseUrlChange={setCustomBaseUrl}
        />

        {/* 4. LIVE CONNECTION TEST */}
        <ConnectionTester
          isTesting={isTesting}
          canTest={Boolean(inputKey.trim() && selectedModel.trim())}
          onTest={handleTestConnection}
          testResult={testResult}
        />

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
ApiKeyModal.displayName = 'ApiKeyModal';

export default ApiKeyModal;
