// =============================================================================
// UtsavAI — Category Breakdown Table Component
// Clean, scannable budget table with inline edits, 1-click verify badges,
// and visual percentage bars.
// =============================================================================

import React, { useState } from 'react';
import { Edit2, Check, X, ShieldCheck, Sparkles } from 'lucide-react';
import type { BudgetCategory } from '../../types/event';

interface CategoryBreakdownTableProps {
  categories: BudgetCategory[];
  totalBudget?: number;
  guestCount: number;
  chartColors: string[];
  onSaveCategory: (updated: BudgetCategory) => void;
  onToggleVerify: (category: BudgetCategory) => void;
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const CategoryBreakdownTable: React.FC<CategoryBreakdownTableProps> = React.memo(({
  categories,
  totalBudget = 800000,
  guestCount,
  chartColors,
  onSaveCategory,
  onToggleVerify,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAllocated, setEditAllocated] = useState<number>(0);
  const [showAll, setShowAll] = useState(false);

  const startEdit = (cat: BudgetCategory) => {
    setEditingId(cat.id);
    setEditAllocated(cat.allocatedAmount);
  };

  const handleSave = (cat: BudgetCategory) => {
    onSaveCategory({
      ...cat,
      allocatedAmount: editAllocated,
    });
    setEditingId(null);
  };

  const safeTotalBudget = totalBudget > 0 ? totalBudget : 1;
  const displayedCategories = showAll ? categories : categories.slice(0, 6);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Category Breakdown & Allocations
          </h3>
          <p className="text-xs text-slate-500">
            Click amounts to edit inline, or toggle verification status in 1 click.
          </p>
        </div>
        <span className="text-xs text-indigo-700 font-mono font-semibold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60">
          {showAll ? `All ${categories.length} Categories` : `Top 6 of ${categories.length} Categories`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs" role="table" aria-label="Budget categories table">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th scope="col" className="py-2.5 px-3">Category</th>
              <th scope="col" className="py-2.5 px-3 text-right">Allocated</th>
              <th scope="col" className="py-2.5 px-3 text-center">Status</th>
              <th scope="col" className="py-2.5 px-3 w-32">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedCategories.map((cat, idx) => {
              const color = chartColors[idx % chartColors.length];
              const isEditing = editingId === cat.id;
              const pct = Math.min(100, Math.round((cat.allocatedAmount / safeTotalBudget) * 100));
              const perHead = guestCount > 0 ? Math.round(cat.allocatedAmount / guestCount) : 0;

              return (
                <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Category Name & Note */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm block truncate">
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[220px]">
                          {cat.notes || `${fmt(perHead)}/person`}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Allocated Amount (Inline Edit) */}
                  <td className="py-3 px-3 text-right font-mono">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          value={editAllocated}
                          onChange={(e) => setEditAllocated(Number(e.target.value) || 0)}
                          className="w-24 px-2 py-1 bg-white border border-indigo-500 rounded text-right font-bold text-slate-900 text-xs shadow-2xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave(cat);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSave(cat)}
                          className="p-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                          title="Save"
                          aria-label={`Save ${cat.name}`}
                        >
                          <Check size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                          title="Cancel"
                          aria-label="Cancel editing"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => startEdit(cat)}
                        className="cursor-pointer inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-indigo-50/60 transition-colors"
                        title="Click to edit allocated amount"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{fmt(cat.allocatedAmount)}</span>
                          <span className="text-[10px] text-slate-400 block">{pct}% of budget</span>
                        </div>
                        <Edit2 size={11} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    )}
                  </td>

                  {/* Subtle 1-Click Verification Toggle Badge */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleVerify(cat)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                        cat.isVerifiedQuote
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 shadow-2xs'
                      }`}
                      title="Click to toggle between AI Estimate and Verified Quote"
                      aria-label={`Toggle verified quote for ${cat.name}`}
                    >
                      {cat.isVerifiedQuote ? (
                        <>
                          <ShieldCheck size={12} className="text-emerald-600" />
                          <span>Verified Quote</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={11} className="text-amber-600" />
                          <span>AI Estimate</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Visual Percentage Bar */}
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block text-right">
                        {pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show all / Show top 6 toggle button */}
      {categories.length > 6 && (
        <div className="pt-2 text-center border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 py-1.5 px-3.5 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer inline-flex items-center gap-1.5 border border-indigo-200/80 bg-indigo-50/40 shadow-2xs"
            aria-label={showAll ? 'Show top 6 categories' : `Show all ${categories.length} categories`}
          >
            <span>{showAll ? 'Show top 6 major categories ▴' : `Show all ${categories.length} categories ▾`}</span>
          </button>
        </div>
      )}
    </div>
  );
});
CategoryBreakdownTable.displayName = 'CategoryBreakdownTable';
