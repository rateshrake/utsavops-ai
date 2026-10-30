// =============================================================================
// UtsavAI — No API Key Configured Confirmation Modal
// Prompts the user when they click Generate without an active API key:
// "Currently no API is configured. Demo mode is available. Would you like to continue with the demo mode?"
// Yes -> Continues with smart demo plan
// No  -> Opens the simplified API configuration panel
// =============================================================================

import React from 'react';
import { Sparkles, Key, X } from 'lucide-react';

interface NoApiConfirmModalProps {
  isOpen: boolean;
  onConfirmDemo: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export const NoApiConfirmModal: React.FC<NoApiConfirmModalProps> = ({
  isOpen,
  onConfirmDemo,
  onOpenSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="no-api-dialog-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-slate-100"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-200/80 shadow-xs shrink-0 mt-0.5">
            <Sparkles size={22} className="text-indigo-600" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
              <span>Demo Mode Available</span>
            </div>
            <h3 id="no-api-dialog-title" className="text-base sm:text-lg font-bold text-slate-900">
              No API Configured
            </h3>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Currently no API is configured. Demo mode is available.
          </p>
          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            Would you like to continue with the demo mode?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onConfirmDemo}
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all text-xs sm:text-sm shadow-sm cursor-pointer flex items-center justify-center gap-1.5 order-1 sm:order-1"
          >
            <Sparkles size={14} />
            <span>Yes, Continue with Demo Mode</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 transition-colors text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5 order-2 sm:order-2"
          >
            <Key size={14} className="text-slate-500" />
            <span>No, Configure API Key</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoApiConfirmModal;
