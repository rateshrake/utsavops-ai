// =============================================================================
// UtsavAI — Smart Questions Step Component
// Step 2 card: 3 quick questions to personalize the plan, with short helper hints,
// quick-select suggestion chips for effortless 1-click answers, and emerald action button.
// =============================================================================

import React from 'react';
import { Sparkles, Loader2, Lightbulb, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ClarifyingQuestion } from '../../types/event';

interface SmartQuestionsStepProps {
  questions: ClarifyingQuestion[];
  isAskingQuestions: boolean;
  questionsError: string | null;
  onGetSmartQuestions: () => void;
  onAnswerChange: (id: string, answer: string) => void;
  onGeneratePlan: () => void;
  onBackToBasics?: () => void;
  isGenerating: boolean;
}

const getSuggestionsForQuestion = (q: ClarifyingQuestion, index: number): string[] => {
  const text = (q.question + ' ' + (q.contextWhyAsked || '')).toLowerCase();

  if (text.includes('weather') || text.includes('monsoon') || text.includes('outdoor') || text.includes('lawn') || text.includes('venue')) {
    return [
      '🌦️ Covered lawn + indoor AC banquet backup',
      '🏛️ 100% Indoor banquet hall only',
      '🎪 Waterproof mandap floral canopy',
      '🌅 Open-air lawn with sunset view',
    ];
  }

  if (text.includes('diet') || text.includes('veg') || text.includes('jain') || text.includes('food') || text.includes('cater') || text.includes('alcohol')) {
    return [
      '🥗 Pure Veg with live Jain counter',
      '🍽️ Multi-cuisine North + South Indian buffet',
      '🍢 Live Chaat & gourmet dessert counter',
      '🍹 Mocktail bar & welcome juice counter',
    ];
  }

  if (text.includes('wheelchair') || text.includes('elder') || text.includes('kid') || text.includes('child') || text.includes('access') || text.includes('age')) {
    return [
      '♿ Ground floor access & wheelchair ramps',
      '🛋️ 2 Dedicated quiet rest rooms for elders',
      '🎈 Kids play area & activity corner',
      '🚗 Valet parking for all guests',
    ];
  }

  // Fallback preset suggestions based on index
  if (index === 0) {
    return [
      '🌧️ Indoor AC hall lock-in option included',
      '🎪 Waterproof canopy over mandap & dining',
      '🏛️ Fully indoor celebration',
    ];
  }
  if (index === 1) {
    return [
      '🥗 Pure Veg with Jain live counter',
      '🍽️ Multi-cuisine buffet spread',
      '🍢 Live counters for Chaat & desserts',
    ];
  }
  return [
    '♿ Ground floor ramp access confirmed',
    '🛋️ Dedicated elder lounge & child-friendly zone',
    '🚗 Valet parking & seamless drop-off',
  ];
};

export const SmartQuestionsStep: React.FC<SmartQuestionsStepProps> = ({
  questions,
  isAskingQuestions,
  questionsError,
  onGetSmartQuestions,
  onAnswerChange,
  onGeneratePlan,
  onBackToBasics,
  isGenerating,
}) => {
  return (
    <div className="space-y-6">
      {/* Step 2 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          {onBackToBasics && (
            <button
              type="button"
              onClick={onBackToBasics}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-1 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Basics & Priorities</span>
            </button>
          )}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            3 Quick Questions to Personalize Your Plan
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Help UtsavAI tailor your venue, menu, and logistics. Click any quick suggestion or type freely.
          </p>
        </div>

        <button
          type="button"
          onClick={onGetSmartQuestions}
          disabled={isAskingQuestions}
          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto disabled:opacity-50"
          aria-label="Ask Gemini for fresh smart questions"
        >
          {isAskingQuestions ? (
            <>
              <Loader2 size={13} className="animate-spin text-indigo-600" />
              <span>Analyzing with AI...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} className="text-indigo-600" />
              <span>Regenerate Questions</span>
            </>
          )}
        </button>
      </div>

      {questionsError && (
        <div
          role="alert"
          className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2"
        >
          <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
          <span>{questionsError}</span>
        </div>
      )}

      {/* 3 Questions List */}
      <div className="space-y-4">
        {questions.slice(0, 3).map((q, idx) => {
          const suggestions = getSuggestionsForQuestion(q, idx);
          return (
            <div
              key={q.id || idx}
              className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 transition-all hover:border-slate-300"
            >
              {/* Question Header */}
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5 shadow-xs">
                  {idx + 1}
                </span>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h4>
                  {q.contextWhyAsked && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/90 border border-amber-200/70 text-[11px] text-amber-900">
                      <Lightbulb size={12} className="text-amber-600 flex-shrink-0" />
                      <span>{q.contextWhyAsked}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Field */}
              <div>
                <input
                  type="text"
                  value={q.userAnswer || ''}
                  onChange={(e) => onAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer, or pick a suggestion below..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-sans shadow-xs transition-colors"
                  aria-label={`Answer for: ${q.question}`}
                />
              </div>

              {/* Quick-select suggestion chips */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Quick Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug, sIdx) => {
                    const isPicked = (q.userAnswer || '').toLowerCase().includes(sug.slice(3, 15).toLowerCase());
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => onAnswerChange(q.id, sug)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          isPicked
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-xs'
                            : 'bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200'
                        }`}
                      >
                        {sug}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emerald Bottom Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        {onBackToBasics ? (
          <button
            type="button"
            onClick={onBackToBasics}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer order-2 sm:order-1"
          >
            ← Review Basics & Priorities
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={onGeneratePlan}
          disabled={isGenerating}
          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 order-1 sm:order-2"
          aria-label="Create My Custom Plan"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin text-white" />
              <span>Generating Your Custom Plan...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} className="text-white" />
              <span>Create My Custom Plan →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
