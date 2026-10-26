// =============================================================================
// UtsavAI — Quote Comparison Card Component
// Scannable side-by-side card:
// - 3-stat row (Total Price, Per Plate, Guests)
// - ⚠️ Watch Out For (Hidden Costs) clean bullet list (no heavy red boxes)
// - 💬 Questions to Ask on WhatsApp in soft slate box with 1-click "📋 Copy Questions"
// =============================================================================

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MessageCircle,
  Check,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import type { AnalyzedQuoteComparison } from '../../types/event';

interface QuoteComparisonCardProps {
  quote: AnalyzedQuoteComparison;
  isCopied: boolean;
  onCopyWhatsAppQuestions: (vendorName: string, questions: string[], quoteId: string) => void;
  onLockInVendor?: (quote: AnalyzedQuoteComparison) => void;
  isLockedIn?: boolean;
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const QuoteComparisonCard: React.FC<QuoteComparisonCardProps> = ({
  quote,
  isCopied,
  onCopyWhatsAppQuestions,
  onLockInVendor,
  isLockedIn = false,
}) => {
  const isOverBudget = quote.budgetAlignment.status === 'over-budget';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 flex flex-col justify-between hover:border-slate-300 transition-all">
      <div className="space-y-4">
        {/* Header: Name & Budget Status */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
              {quote.category}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {quote.vendorName}
            </h3>
          </div>

          {/* Budget Alignment Badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 flex-shrink-0 ${
              isOverBudget
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {isOverBudget ? (
              <>
                <TrendingUp size={12} className="text-rose-600" />
                Over Budget (+{fmt(quote.budgetAlignment.difference)})
              </>
            ) : (
              <>
                <TrendingDown size={12} className="text-emerald-600" />
                Within Budget ({fmt(Math.abs(quote.budgetAlignment.difference))} under)
              </>
            )}
          </span>
        </div>

        {/* 1. 3-Stat Row (Total Price, Per Plate, Guests) */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Price
            </span>
            <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900 mt-0.5 block">
              {fmt(quote.baseCost)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Per Plate
            </span>
            <span className="text-sm sm:text-base font-extrabold font-mono text-indigo-700 mt-0.5 block">
              {fmt(quote.perUnitCost)}
            </span>
            <span className="text-[9px] text-slate-400 block">{quote.unitLabel}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Guests
            </span>
            <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900 mt-0.5 block">
              {quote.guestsCovered}
            </span>
            <span className="text-[9px] text-slate-400 block">Covered</span>
          </div>
        </div>

        {/* Budget Impact Summary */}
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800 font-semibold">Budget Impact: </strong>
          {quote.budgetAlignment.summary}
        </p>

        {/* 2. ⚠️ Watch Out For (Hidden Costs) clean bullet list */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
            <span>Watch Out For (Hidden Costs):</span>
          </span>

          {quote.hiddenCharges.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No undisclosed surcharges detected in quote text.</p>
          ) : (
            <ul className="space-y-1.5 text-xs text-slate-700">
              {quote.hiddenCharges.map((hc, hIdx) => (
                <li key={hIdx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold flex-shrink-0">•</span>
                  <span className="leading-snug">{hc}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Exclusions if any */}
          {quote.exclusions.length > 0 && (
            <div className="pt-1.5">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Notable Exclusions:
              </span>
              <ul className="space-y-1 text-xs text-slate-600">
                {quote.exclusions.slice(0, 3).map((ex, eIdx) => (
                  <li key={eIdx} className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold flex-shrink-0">•</span>
                    <span className="leading-snug">{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 3. 💬 Questions to Ask on WhatsApp in a Soft Slate Box */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MessageCircle size={14} className="text-emerald-600" />
              <span>Questions to Ask on WhatsApp</span>
            </span>

            {/* 1-Click Copy Questions Button */}
            <button
              type="button"
              onClick={() =>
                onCopyWhatsAppQuestions(
                  quote.vendorName,
                  quote.whatsappQuestions,
                  quote.id
                )
              }
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                isCopied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              aria-label={`Copy WhatsApp questions for ${quote.vendorName}`}
            >
              {isCopied ? (
                <>
                  <Check size={12} className="text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} className="text-slate-500" />
                  <span>📋 Copy Questions</span>
                </>
              )}
            </button>
          </div>

          <ol className="space-y-2 text-xs text-slate-700 font-sans">
            {quote.whatsappQuestions.map((q, qIdx) => (
              <li key={qIdx} className="flex items-start gap-2">
                <span className="text-indigo-600 font-mono font-bold flex-shrink-0">
                  {qIdx + 1}.
                </span>
                <span className="leading-snug">{q}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Lock In Vendor Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onLockInVendor && onLockInVendor(quote)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              isLockedIn
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
            }`}
            aria-label={`Choose ${quote.vendorName} and lock price in budget`}
          >
            <CheckCircle2 size={16} />
            <span>
              {isLockedIn
                ? `✓ ${quote.vendorName} Locked in Budget (${fmt(quote.baseCost)})`
                : `✅ Choose ${quote.vendorName} & Lock Price in Budget`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
