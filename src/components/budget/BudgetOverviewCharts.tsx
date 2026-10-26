// =============================================================================
// UtsavAI — Budget Donut Chart Component
// Clean Recharts Donut visualization of category envelopes with color legend.
// Sits on the left side (1/3 width) of Tab 2.
// =============================================================================

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { BudgetCategory } from '../../types/event';

interface BudgetOverviewChartsProps {
  categories: BudgetCategory[];
  totalBudget: number;
  guestCount: number;
  totalAllocated: number;
  totalActual: number;
  chartColors: string[];
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const BudgetOverviewCharts: React.FC<BudgetOverviewChartsProps> = ({
  categories,
  totalBudget,
  totalAllocated,
  chartColors,
}) => {
  const pieData = categories.map((c) => ({
    name: c.name,
    value: c.allocatedAmount,
  }));

  const isOverAllocated = totalAllocated > totalBudget;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Allocation Envelopes
          </h3>
          <p className="text-xs text-slate-500">
            How your celebration funds are split.
          </p>
        </div>
        <span
          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
            isOverAllocated
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {isOverAllocated ? 'Over Budget' : 'Balanced'}
        </span>
      </div>

      {/* Donut Chart */}
      <div className="h-60 sm:h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2.5}
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown) => [
                typeof value === 'number' ? fmt(value) : String(value ?? ''),
                'Allocated',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#0f172a',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Allocated
          </span>
          <span className="text-base font-extrabold font-mono text-slate-900">
            {fmt(totalAllocated)}
          </span>
          <span className="text-[10px] text-slate-500">
            of {fmt(totalBudget)}
          </span>
        </div>
      </div>

      {/* Color Legend (Top Categories) */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Top Spending Items:
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {categories.slice(0, 6).map((cat, idx) => {
            const color = chartColors[idx % chartColors.length];
            const pct = Math.round((cat.allocatedAmount / Math.max(1, totalBudget)) * 100);
            return (
              <div key={cat.id} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-600 truncate text-[11px]" title={cat.name}>
                  {cat.name} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clean Quick Summary Box */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            📊 Quick Summary
          </span>
          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
            Real-Time
          </span>
        </div>

        {/* Top 3 Expenses */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Top 3 Outlays:
          </span>
          <div className="space-y-1">
            {categories
              .slice()
              .sort((a, b) => b.allocatedAmount - a.allocatedAmount)
              .slice(0, 3)
              .map((c, i) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 truncate pr-2 font-medium">
                    {i + 1}. {c.name}
                  </span>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {fmt(c.allocatedAmount)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Verified vs AI Estimated */}
        <div className="pt-2 border-t border-slate-200/70 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-white rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-emerald-700 font-bold block">✓ Verified</span>
            <span className="font-mono font-extrabold text-slate-900 text-xs">
              {fmt(
                categories
                  .filter((c) => c.isVerifiedQuote)
                  .reduce((acc, c) => acc + c.allocatedAmount, 0)
              )}
            </span>
            <span className="text-[9px] text-slate-400 block">
              {categories.filter((c) => c.isVerifiedQuote).length} locked quote(s)
            </span>
          </div>

          <div className="p-2 bg-white rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-indigo-700 font-bold block">✨ AI Estimated</span>
            <span className="font-mono font-extrabold text-slate-900 text-xs">
              {fmt(
                categories
                  .filter((c) => !c.isVerifiedQuote)
                  .reduce((acc, c) => acc + c.allocatedAmount, 0)
              )}
            </span>
            <span className="text-[9px] text-slate-400 block">
              {categories.filter((c) => !c.isVerifiedQuote).length} category envelopes
            </span>
          </div>
        </div>

        {/* 5% Emergency Buffer Status */}
        <div className="pt-1 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500">🛡️</span>
            <span className="text-[11px] font-medium text-slate-700">Safety Buffer</span>
          </div>
          <span className="font-mono font-bold text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            {fmt(
              categories.find(
                (c) =>
                  c.id === 'contingency' ||
                  c.name.toLowerCase().includes('contingency') ||
                  c.name.toLowerCase().includes('buffer')
              )?.allocatedAmount || Math.round(totalBudget * 0.05)
            )}{' '}
            (Protected)
          </span>
        </div>
      </div>
    </div>
  );
};
