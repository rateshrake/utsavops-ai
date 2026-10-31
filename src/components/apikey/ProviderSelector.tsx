// =============================================================================
// UtsavOps AI — Provider Selector Sub-Component
// Displays accessible radio buttons for selecting among 6 AI providers.
// =============================================================================

import React from 'react';
import { Layers, Globe, Zap, Sparkles, Cpu } from 'lucide-react';
import type { ProviderId } from '../../services/langchainClient';

interface ProviderSelectorProps {
  selectedProvider: ProviderId;
  onSelect: (providerId: ProviderId) => void;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProvider,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        <Layers size={13} className="text-indigo-600" />
        <span>1. Select AI Provider</span>
      </label>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        role="radiogroup"
        aria-label="Select AI Provider"
      >
        {/* OpenRouter */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedProvider === 'openrouter'}
          aria-label="Select OpenRouter as AI provider"
          onClick={() => onSelect('openrouter')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            selectedProvider === 'openrouter'
              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
          }`}
        >
          <Globe
            size={16}
            className={selectedProvider === 'openrouter' ? 'text-indigo-600' : 'text-slate-500'}
          />
          <span className="text-xs">OpenRouter</span>
        </button>

        {/* Groq */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedProvider === 'groq'}
          aria-label="Select Groq as AI provider"
          onClick={() => onSelect('groq')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            selectedProvider === 'groq'
              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
          }`}
        >
          <Zap
            size={16}
            className={selectedProvider === 'groq' ? 'text-amber-500' : 'text-slate-500'}
          />
          <span className="text-xs">Groq</span>
        </button>

        {/* Google Gemini */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedProvider === 'gemini'}
          aria-label="Select Google Gemini as AI provider"
          onClick={() => onSelect('gemini')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            selectedProvider === 'gemini'
              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
          }`}
        >
          <Sparkles
            size={16}
            className={selectedProvider === 'gemini' ? 'text-indigo-600' : 'text-slate-500'}
          />
          <span className="text-xs">Gemini</span>
        </button>

        {/* OpenAI */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedProvider === 'openai'}
          aria-label="Select OpenAI as AI provider"
          onClick={() => onSelect('openai')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            selectedProvider === 'openai'
              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
          }`}
        >
          <Cpu
            size={16}
            className={selectedProvider === 'openai' ? 'text-indigo-600' : 'text-slate-500'}
          />
          <span className="text-xs">OpenAI</span>
        </button>

        {/* xAI (Grok) */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedProvider === 'xai'}
          aria-label="Select xAI Grok as AI provider"
          onClick={() => onSelect('xai')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            selectedProvider === 'xai'
              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
          }`}
        >
          <Zap
            size={16}
            className={selectedProvider === 'xai' ? 'text-indigo-600' : 'text-slate-500'}
          />
          <span className="text-xs">xAI (Grok)</span>
        </button>

        {/* Custom Endpoint */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedProvider === 'custom'}
          aria-label="Select Custom OpenAI-compatible endpoint"
          onClick={() => onSelect('custom')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
            selectedProvider === 'custom'
              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900 font-bold'
              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
          }`}
        >
          <Layers
            size={16}
            className={selectedProvider === 'custom' ? 'text-indigo-600' : 'text-slate-500'}
          />
          <span className="text-xs">Custom</span>
        </button>
      </div>
    </div>
  );
};
ProviderSelector.displayName = 'ProviderSelector';
