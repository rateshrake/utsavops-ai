// =============================================================================
// UtsavOps AI — Connection Tester Sub-Component
// Live ping-pong tester sending an ephemeral LangChain request to verify API key & model.
// =============================================================================

import React from 'react';
import { Zap, Loader2, Check, AlertTriangle } from 'lucide-react';

interface ConnectionTesterProps {
  isTesting: boolean;
  canTest: boolean;
  onTest: () => void;
  testResult: {
    success: boolean;
    message: string;
    elapsedSeconds?: number;
  } | null;
}

export const ConnectionTester: React.FC<ConnectionTesterProps> = ({
  isTesting,
  canTest,
  onTest,
  testResult,
}) => {
  return (
    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <button
        type="button"
        onClick={onTest}
        disabled={isTesting || !canTest}
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
          role="status"
          aria-live="polite"
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
  );
};
ConnectionTester.displayName = 'ConnectionTester';
