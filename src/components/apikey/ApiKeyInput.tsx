// =============================================================================
// UtsavOps AI — API Key Input Sub-Component
// Includes show/hide password toggle, live validation alert, and provider docs link.
// =============================================================================

import React, { useState } from 'react';
import { Key, Eye, EyeOff, AlertTriangle, ExternalLink } from 'lucide-react';
import type { ProviderDefinition } from '../../services/langchainClient';

interface ApiKeyInputProps {
  providerDef: ProviderDefinition;
  inputKey: string;
  onChange: (val: string) => void;
  validationError: string | null;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  providerDef,
  inputKey,
  onChange,
  validationError,
}) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100">
      <label
        htmlFor="api-key-input"
        className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
      >
        <Key size={13} className="text-indigo-600" />
        <span>2. {providerDef.name} API Key</span>
      </label>

      <div className="relative">
        <input
          id="api-key-input"
          type={showKey ? 'text' : 'password'}
          value={inputKey}
          onChange={(e) => onChange(e.target.value)}
          placeholder={providerDef.keyPlaceholder}
          aria-describedby={validationError ? 'api-key-error' : 'api-key-doc-link'}
          aria-invalid={Boolean(validationError)}
          className="w-full pr-10 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-mono shadow-xs transition-colors"
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
          aria-label={showKey ? 'Hide API key' : 'Show API key'}
        >
          {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Live Validation Alert */}
      {validationError && (
        <div
          id="api-key-error"
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 animate-fadeIn"
        >
          <AlertTriangle size={14} className="text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Secure Documentation Link */}
      <div id="api-key-doc-link" className="text-[11px] text-slate-500">
        Need a key?{' '}
        <a
          href={providerDef.keyDocUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-0.5"
        >
          <span>Get key from {providerDef.shortName}</span>
          <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
};
ApiKeyInput.displayName = 'ApiKeyInput';
