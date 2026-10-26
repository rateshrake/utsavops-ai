// =============================================================================
// UtsavAI — Side-by-Side Quote Input Cards Component
// Shows clean side-by-side input cards (Vendor Quote #1, Vendor Quote #2)
// with textareas (rows={5}) and optional + Add 3rd Quote button.
// =============================================================================

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface QuoteInputItem {
  id: string;
  vendorName: string;
  rawText: string;
}

interface QuoteInputTabsProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categoryOptions: string[];
  allocatedBudget: number;
  guestCount: number;
  quoteInputs: QuoteInputItem[];
  activeTabIdx?: number;
  setActiveTabIdx?: (idx: number) => void;
  onAddQuote: () => void;
  onRemoveQuote: (id: string) => void;
  onUpdateQuote: (id: string, fields: Partial<QuoteInputItem>) => void;
  onLoadSampleQuotes: () => void;
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const QuoteInputTabs: React.FC<QuoteInputTabsProps> = ({
  selectedCategory,
  setSelectedCategory,
  categoryOptions,
  allocatedBudget,
  guestCount,
  quoteInputs,
  onAddQuote,
  onRemoveQuote,
  onUpdateQuote,
}) => {
  return (
    <div className="space-y-4">
      {/* Category Benchmark Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <label htmlFor="quote-category-select" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Comparing Category:
          </label>
          <select
            id="quote-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600">
            <span>Your Target Envelope: </span>
            <strong className="text-indigo-700 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
              {fmt(allocatedBudget)}
            </strong>
            <span className="text-slate-400 text-[11px] ml-1">
              (~{fmt(Math.round(allocatedBudget / Math.max(1, guestCount)))}/pax)
            </span>
          </div>

          {quoteInputs.length < 3 && (
            <button
              type="button"
              onClick={onAddQuote}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 flex items-center gap-1 cursor-pointer transition-colors"
              aria-label="Add 3rd Quote"
            >
              <Plus size={13} />
              <span>+ Add 3rd Quote</span>
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side Input Cards (Vendor Quote #1, Vendor Quote #2) */}
      <div
        className={`grid grid-cols-1 ${
          quoteInputs.length > 2 ? 'lg:grid-cols-3' : 'md:grid-cols-2'
        } gap-4`}
      >
        {quoteInputs.map((q, idx) => (
          <div
            key={q.id}
            className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Vendor Quote #{idx + 1}
                  </span>
                </div>

                {quoteInputs.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onRemoveQuote(q.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove this quote"
                    aria-label={`Remove Quote #${idx + 1}`}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Vendor Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Vendor Name / Business
                </label>
                <input
                  type="text"
                  value={q.vendorName}
                  onChange={(e) => onUpdateQuote(q.id, { vendorName: e.target.value })}
                  placeholder={idx === 0 ? 'e.g. Royal Rasoi Catering' : 'e.g. Utsav Swad Hospitality'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Quotation Textarea (rows={5}) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Quotation Text (WhatsApp message, estimate or email):
                </label>
                <textarea
                  rows={5}
                  value={q.rawText}
                  onChange={(e) => onUpdateQuote(q.id, { rawText: e.target.value })}
                  placeholder="Paste vendor estimate, menu prices, inclusions, or WhatsApp breakdown here..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y leading-relaxed"
                  aria-label={`Quotation text for Quote #${idx + 1}`}
                />
              </div>
            </div>

            <span className="text-[10px] text-slate-400 italic block text-right">
              {q.rawText.trim().length > 0
                ? `${q.rawText.trim().split(/\s+/).length} words entered`
                : 'Awaiting quotation text'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
