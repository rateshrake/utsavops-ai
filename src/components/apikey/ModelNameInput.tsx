// =============================================================================
// UtsavOps AI — Model Name Input Sub-Component
// Allows user to manually type any valid model identifier for their provider.
// =============================================================================

import React from 'react';
import { Cpu } from 'lucide-react';
import type { ProviderDefinition } from '../../services/langchainClient';

interface ModelNameInputProps {
  providerDef: ProviderDefinition;
  isCustom: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
  customBaseUrl: string;
  onCustomBaseUrlChange: (url: string) => void;
}

export const ModelNameInput: React.FC<ModelNameInputProps> = ({
  providerDef,
  isCustom,
  selectedModel,
  onModelChange,
  customBaseUrl,
  onCustomBaseUrlChange,
}) => {
  return (
    <>
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label
          htmlFor="model-name-input"
          className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
        >
          <Cpu size={13} className="text-indigo-600" />
          <span>3. Model Name / Identifier</span>
        </label>

        <input
          id="model-name-input"
          type="text"
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          placeholder={providerDef.modelPlaceholder}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-mono shadow-xs font-semibold"
          aria-label="Enter model identifier"
        />

        <p className="text-[11px] text-slate-500 leading-snug">
          Type the exact model identifier you want to call (e.g.{' '}
          <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">
            {providerDef.defaultModel || 'model-name'}
          </code>
          ).
        </p>
      </div>

      {isCustom && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label
            htmlFor="custom-base-url-input"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
          >
            Custom Base URL
          </label>
          <input
            id="custom-base-url-input"
            type="text"
            value={customBaseUrl}
            onChange={(e) => onCustomBaseUrlChange(e.target.value)}
            placeholder="https://api.together.xyz/v1 or http://localhost:11434/v1"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono shadow-xs"
          />
        </div>
      )}
    </>
  );
};
ModelNameInput.displayName = 'ModelNameInput';
