// =============================================================================
// UtsavAI — Event Intake Form Component
// Clean, warm light-mode form inputs for occasion, event name, budget, headcount,
// event date, vibe, and non-negotiables.
// =============================================================================

import React, { useState } from 'react';
import {
  IndianRupee,
  Users,
  Calendar,
  Sparkles,
  Heart,
  Crown,
  Scale,
  Plus,
  X,
} from 'lucide-react';
import type { EventProfile, AtmosphereType } from '../../types/event';

interface EventIntakeFormProps {
  profile: EventProfile;
  onUpdate: (fields: Partial<EventProfile>) => void;
  perHeadBudget: number;
}

const PRIMARY_OCCASIONS = [
  'Wedding',
  'Birthday',
  'Anniversary',
  'Cultural/Community',
  'Corporate',
];

const BUDGET_PRESETS = [200000, 500000, 800000, 1500000, 2500000];
const GUEST_PRESETS = [50, 100, 200, 350, 500];

const ATMOSPHERE_OPTIONS: Array<{
  type: AtmosphereType;
  label: string;
  desc: string;
  icon: React.ReactNode;
}> = [
  {
    type: 'Intimate',
    label: 'Intimate',
    desc: 'Cozy, close-knit & personal',
    icon: <Heart size={15} className="text-pink-500" />,
  },
  {
    type: 'Balanced',
    label: 'Balanced',
    desc: 'Warm, elegant social celebration',
    icon: <Scale size={15} className="text-amber-500" />,
  },
  {
    type: 'Grand',
    label: 'Grand',
    desc: 'High-energy, spectacular scale',
    icon: <Crown size={15} className="text-indigo-600" />,
  },
];

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtShort = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;

export const EventIntakeForm: React.FC<EventIntakeFormProps> = ({
  profile,
  onUpdate,
  perHeadBudget,
}) => {
  const [newMustHave, setNewMustHave] = useState('');

  const addMustHave = () => {
    if (!newMustHave.trim()) return;
    onUpdate({ mustHaves: [...profile.mustHaves, newMustHave.trim()] });
    setNewMustHave('');
  };

  const removeMustHave = (idx: number) => {
    onUpdate({ mustHaves: profile.mustHaves.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* 1. Occasion Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Occasion Type
        </label>
        <div className="flex flex-wrap gap-2">
          {PRIMARY_OCCASIONS.map((occ) => {
            const isSelected = profile.occasion === occ;
            return (
              <button
                key={occ}
                type="button"
                onClick={() => onUpdate({ occasion: occ })}
                aria-pressed={isSelected}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {occ}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Event Name */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Event Name / Title
        </label>
        <input
          type="text"
          value={profile.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="e.g. Sharma–Mehta Grand Wedding Celebration"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* 3. Budget & Quick Chips */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <IndianRupee size={13} className="text-emerald-600" />
            <span>Total Budget</span>
          </label>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            {fmt(profile.totalBudget)}
          </span>
        </div>
        <div className="relative mb-2">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
            ₹
          </span>
          <input
            type="number"
            value={profile.totalBudget || ''}
            onChange={(e) => onUpdate({ totalBudget: Number(e.target.value) || 0 })}
            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="800000"
            aria-label="Total budget amount in INR"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {BUDGET_PRESETS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onUpdate({ totalBudget: b })}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer ${
                profile.totalBudget === b
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {fmtShort(b)}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Guest Count & Quick Chips */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={13} className="text-indigo-600" />
            <span>Guest Count</span>
          </label>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
            {profile.guestCount} Pax (~{fmt(perHeadBudget)}/head)
          </span>
        </div>
        <div className="relative mb-2">
          <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="number"
            value={profile.guestCount || ''}
            onChange={(e) => onUpdate({ guestCount: Number(e.target.value) || 0 })}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="200"
            aria-label="Number of expected guests"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {GUEST_PRESETS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onUpdate({ guestCount: g })}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer ${
                profile.guestCount === g
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {g} Pax
            </button>
          ))}
        </div>
      </div>

      {/* 5. Event Date */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Calendar size={13} className="text-indigo-600" />
          <span>Event Date</span>
        </label>
        <input
          type="date"
          value={profile.date}
          onChange={(e) => onUpdate({ date: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
        />
      </div>

      {/* 6. Atmosphere & Vibe (Full width stacked below Date) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Sparkles size={13} className="text-indigo-600" />
          <span>Atmosphere & Vibe</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {ATMOSPHERE_OPTIONS.map((atm) => {
            const isSelected = profile.atmosphere === atm.type;
            return (
              <button
                key={atm.type}
                type="button"
                onClick={() => onUpdate({ atmosphere: atm.type })}
                aria-pressed={isSelected}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{atm.icon}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{atm.label}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal font-normal">{atm.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Non-Negotiable Must-Haves */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Non-Negotiable Must-Haves
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newMustHave}
            onChange={(e) => setNewMustHave(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMustHave()}
            placeholder="e.g. Jain counter, live shehnai, drone photography..."
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={addMustHave}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Non-negotiable must-have items">
          {profile.mustHaves.map((mh, idx) => (
            <span
              key={`${mh}-${idx}`}
              role="listitem"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
            >
              <span>{mh}</span>
              <button
                type="button"
                onClick={() => removeMustHave(idx)}
                className="text-slate-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition-colors"
                aria-label={`Remove ${mh}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
