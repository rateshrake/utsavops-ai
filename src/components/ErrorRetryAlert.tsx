// =============================================================================
// UtsavAI — Error & Retry Alert Component
// Displays clear, actionable error feedback when an LLM / Gemini API call fails,
// offering a 1-click Retry button, diagnostic guidance, and optional fallback.
// =============================================================================

import React from 'react';
import { AlertTriangle, RefreshCw, Key, Sparkles, X } from 'lucide-react';

interface ErrorRetryAlertProps {
  error: string | null;
  onRetry: () => void;
  onDismiss?: () => void;
  onOpenApiModal?: () => void;
  onFallback?: () => void;
  fallbackLabel?: string;
  title?: string;
  isRetrying?: boolean;
}

export const ErrorRetryAlert: React.FC<ErrorRetryAlertProps> = ({
  error,
  onRetry,
  onDismiss,
  onOpenApiModal,
  onFallback,
  fallbackLabel = '⚡ Continue with Smart Demo Plan',
  title = 'AI Generation Encountered an Issue',
  isRetrying = false,
}) => {
  if (!error) return null;

  const errLower = error.toLowerCase();
  const isQuota = errLower.includes('429') || errLower.includes('quota') || errLower.includes('resource');
  const isServerBusy = errLower.includes('500') || errLower.includes('503') || errLower.includes('internal error') || errLower.includes('busy');
  const isTimeout = errLower.includes('timeout') || errLower.includes('timed out') || errLower.includes('abort');
  const isKeyError = errLower.includes('api key') || errLower.includes('key') || errLower.includes('403') || errLower.includes('unauthorized');

  let badgeText = 'API Issue';
  let adviceText = 'Click Retry below to re-send the request to OpenRouter.';

  if (isQuota) {
    badgeText = 'Rate Limit / Quota Exceeded';
    adviceText = 'OpenRouter free model rate limit was reached. Wait a few seconds and click Retry, or continue with our Smart Curated Demo plan.';
  } else if (isServerBusy) {
    badgeText = 'Model Server Busy';
    adviceText = "Upstream model servers are temporarily busy. Clicking Retry will automatically attempt re-connection.";
  } else if (isTimeout) {
    badgeText = 'Request Timed Out';
    adviceText = 'The LLM took longer than usual to respond. Click Retry to re-initiate synthesis.';
  } else if (isKeyError) {
    badgeText = 'API Key Issue';
    adviceText = 'Please ensure your OpenRouter API key is valid.';
  }

  return (
    <div
      role="alert"
      className="p-4 sm:p-5 bg-rose-50/90 border border-rose-200 rounded-3xl shadow-xs space-y-3.5 transition-all animate-fadeIn"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-xl flex-shrink-0 mt-0.5 shadow-2xs">
            <AlertTriangle size={18} />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-rose-950">{title}</h4>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-semibold tracking-wide">
                {badgeText}
              </span>
            </div>
            <p className="text-xs text-rose-800/90 font-mono break-words leading-relaxed">
              {error}
            </p>
            <p className="text-[11px] text-rose-700 font-sans mt-0.5">
              {adviceText}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-rose-400 hover:text-rose-700 p-1 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            aria-label="Dismiss error notice"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Action Buttons: Retry + Fallback + Settings */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/70">
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          aria-label="Retry AI generation"
        >
          <RefreshCw size={13} className={isRetrying ? 'animate-spin' : ''} />
          <span>{isRetrying ? 'Retrying...' : '🔄 Retry Generation'}</span>
        </button>

        {onFallback && (
          <button
            type="button"
            onClick={onFallback}
            className="px-3.5 py-2 bg-white hover:bg-rose-50 text-slate-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>{fallbackLabel}</span>
          </button>
        )}

        {onOpenApiModal && (
          <button
            type="button"
            onClick={onOpenApiModal}
            className="px-3.5 py-2 bg-white hover:bg-rose-50 text-slate-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ml-auto sm:ml-0"
          >
            <Key size={13} className="text-indigo-600" />
            <span>Check API Key</span>
          </button>
        )}
      </div>
    </div>
  );
};
