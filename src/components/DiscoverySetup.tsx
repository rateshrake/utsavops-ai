// =============================================================================
// UtsavAI — Tab 1 ("1. Event Setup")
// Clean 2-step wizard inside a centered card (max-w-4xl mx-auto) eliminating scroll fatigue:
// Step 1: Basics & Priorities (Occasion, Name, Budget, Guests, Date, Vibe + Priority List)
// Step 2: 3 Quick Questions to Personalize Your Plan (Helper hints, quick suggestion chips)
// =============================================================================

import React, { useState, useMemo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { EventProfile, ClarifyingQuestion } from '../types/event';
import {
  generateSmartQuestions,
  isApiKeyAvailable,
  getModelDisplayName,
} from '../services/geminiService';
import { EventIntakeForm } from './discovery/EventIntakeForm';
import { PriorityRanker } from './discovery/PriorityRanker';
import { SmartQuestionsStep } from './discovery/SmartQuestionsStep';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorRetryAlert } from './ErrorRetryAlert';
import { ErrorBoundary } from './ErrorBoundary';

interface DiscoverySetupProps {
  profile: EventProfile;
  onProfileChange: (p: EventProfile) => void;
  onGenerate: (overrideProfile?: EventProfile) => Promise<void>;
  onUseOfflineFallback?: (overrideProfile?: EventProfile) => void;
  onClearError?: () => void;
  isGenerating: boolean;
  error: string | null;
  hasApiKey?: boolean;
  onOpenApiModal?: () => void;
}

const CORE_PRIORITIES = [
  'Food & Catering',
  'Venue & Hospitality',
  'Decor & Ambience',
  'Photography & Memories',
  'Entertainment & Music',
];

export const DiscoverySetup: React.FC<DiscoverySetupProps> = ({
  profile,
  onProfileChange,
  onGenerate,
  onUseOfflineFallback,
  onClearError,
  isGenerating,
  error,
  hasApiKey = false,
  onOpenApiModal,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isAskingQuestions, setIsAskingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const update = (fields: Partial<EventProfile>) => {
    onProfileChange({ ...profile, ...fields });
  };

  const perHeadBudget = useMemo(() => {
    if (!profile.guestCount || profile.guestCount <= 0) return 0;
    return Math.round(profile.totalBudget / profile.guestCount);
  }, [profile.totalBudget, profile.guestCount]);

  const selectedPriorities = useMemo(() => {
    if (profile.prioritiesRanked && profile.prioritiesRanked.length > 0) {
      return profile.prioritiesRanked;
    }
    return CORE_PRIORITIES;
  }, [profile.prioritiesRanked]);

  const allPriorities = useMemo(() => {
    const list = [...CORE_PRIORITIES];
    if (profile.prioritiesRanked) {
      for (const item of profile.prioritiesRanked) {
        if (!list.includes(item)) list.push(item);
      }
    }
    return list;
  }, [profile.prioritiesRanked]);

  const handleMovePriority = (item: string, direction: 'up' | 'down') => {
    const list = [...selectedPriorities];
    const i = list.indexOf(item);
    if (i === -1) return;
    if (direction === 'up' && i > 0) {
      [list[i - 1], list[i]] = [list[i], list[i - 1]];
    }
    if (direction === 'down' && i < list.length - 1) {
      [list[i + 1], list[i]] = [list[i], list[i + 1]];
    }
    update({ prioritiesRanked: list });
  };

  const handleTogglePriority = (item: string) => {
    const list = [...selectedPriorities];
    const isSelected = list.includes(item);
    if (isSelected) {
      if (list.length <= 1) return;
      const updated = list.filter((p) => p !== item);
      update({ prioritiesRanked: updated });
    } else {
      const updated = [...list, item];
      update({ prioritiesRanked: updated });
    }
  };

  const handleGetSmartQuestions = async () => {
    setIsAskingQuestions(true);
    setQuestionsError(null);
    try {
      if (isApiKeyAvailable()) {
        const questions = await generateSmartQuestions(profile);
        update({ smartQuestions: questions });
      } else {
        setQuestionsError('Using default curated questions. Enter an API key anytime for live AI generation.');
      }
    } catch (err) {
      setQuestionsError(err instanceof Error ? err.message : 'Could not fetch questions from AI.');
    } finally {
      setIsAskingQuestions(false);
    }
  };

  const handleAnswerChange = (qId: string, answer: string) => {
    const questions = profile.smartQuestions || [];
    const updated = questions.map((q: ClarifyingQuestion) =>
      q.id === qId ? { ...q, userAnswer: answer } : q
    );
    update({ smartQuestions: updated });
  };

  const handleStep2Click = () => {
    setCurrentStep(2);
    // If smart questions aren't loaded or user is using AI
    if ((!profile.smartQuestions || profile.smartQuestions.length === 0) && isApiKeyAvailable()) {
      handleGetSmartQuestions();
    }
  };

  return (
    <ErrorBoundary fallbackTitle="Error loading Event Setup wizard">
      <section aria-label="Tell us about your celebration" className="max-w-5xl mx-auto space-y-6">
        {/* Provider & BYOK Quick Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:px-4 bg-indigo-50/70 border border-indigo-200/70 rounded-2xl text-xs text-indigo-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-indigo-600 shrink-0" />
            <span>
              <strong>{hasApiKey ? 'Live AI Ready' : 'AI Ready'} ({getModelDisplayName()}):</strong> Using default OpenRouter connection or your custom key.
            </span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {onOpenApiModal && (
              <button
                type="button"
                onClick={onOpenApiModal}
                className="px-3 py-1.5 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-semibold cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5"
                title="Change provider, model or enter custom API key"
              >
                <span>🔑 Change Provider / Key</span>
              </button>
            )}
            {onUseOfflineFallback && (
              <button
                type="button"
                onClick={() => onUseOfflineFallback(profile)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer transition-colors flex items-center gap-1"
                title="Generate smart calibrated plan instantly without API call"
              >
                <span>⚡ Demo Plan</span>
              </button>
            )}
          </div>
        </div>

        {/* Centered Main Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header & Step Flow Indicator */}
          <div className="space-y-4 pb-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-1.5">
                  <Sparkles size={12} className="text-indigo-600" />
                  <span>Step 1 of 4 • Event Setup</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Tell us about your celebration
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Set your parameters and rank your priorities. We'll generate a balanced master plan in seconds.
                </p>
              </div>

              {/* 2-Step Sub-Pills */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentStep === 1
                      ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      currentStep === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    1
                  </span>
                  <span>Basics & Priorities</span>
                </button>

                <button
                  type="button"
                  onClick={handleStep2Click}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentStep === 2
                      ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      currentStep === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    2
                  </span>
                  <span>3 Quick Questions</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real Error Message with Diagnosis & 1-Click Retry */}
          {error && (
            <ErrorRetryAlert
              error={error}
              onRetry={() => onGenerate()}
              onFallback={() => onUseOfflineFallback?.(profile)}
              onOpenApiModal={onOpenApiModal}
              onDismiss={onClearError}
              isRetrying={isGenerating}
              title="Celebration Plan Generation Error"
            />
          )}

          {/* Loading Skeleton with Animated Progress Bar while generating plan */}
          {isGenerating && (
            <LoadingSkeleton
              label={`Creating your personalized celebration plan with ${getModelDisplayName()}...`}
              subLabel="Balancing venue envelopes, catering menus, critical timeline checklist, and risk pre-mortems..."
              cardCount={3}
              estimatedDurationSeconds={25}
              steps={[
                `Connecting to ${getModelDisplayName()} & reading priorities`,
                'Structuring budget envelopes & calculating math balance',
                'Generating chronological critical-path timeline',
                'Auditing weather & guest surge contingency playbooks',
                'Synchronizing executive celebration master plan',
              ]}
            />
          )}

          {/* ================= STEP 1: BASICS & PRIORITIES ================= */}
          {!isGenerating && currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form Inputs (Occasion, Name, Budget, Guests, Date, Vibe) */}
                <div className="lg:col-span-7">
                  <EventIntakeForm
                    profile={profile}
                    onUpdate={update}
                    perHeadBudget={perHeadBudget}
                  />
                </div>

                {/* Right Column: Clean Compact Priority List */}
                <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                  <PriorityRanker
                    selectedPriorities={selectedPriorities}
                    allPriorities={allPriorities}
                    onMovePriority={handleMovePriority}
                    onTogglePriority={handleTogglePriority}
                  />
                </div>
              </div>

              {/* Bottom Action Buttons for Step 1 */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Secondary Button: Ask 3 Smart Questions First */}
                <button
                  type="button"
                  onClick={handleStep2Click}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs order-2 sm:order-1"
                >
                  <Sparkles size={15} className="text-indigo-600" />
                  <span>✨ Ask Me 3 Smart Questions First</span>
                </button>

                {/* Primary Button: Generate My Plan Now */}
                <button
                  type="button"
                  onClick={() => onGenerate()}
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm hover:shadow-md order-1 sm:order-2"
                >
                  <span>Generate My Plan Now</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: 3 SMART QUESTIONS ================= */}
          {!isGenerating && currentStep === 2 && (
            <SmartQuestionsStep
              questions={profile.smartQuestions || []}
              isAskingQuestions={isAskingQuestions}
              questionsError={questionsError}
              onGetSmartQuestions={handleGetSmartQuestions}
              onAnswerChange={handleAnswerChange}
              onGeneratePlan={() => onGenerate()}
              onBackToBasics={() => setCurrentStep(1)}
              isGenerating={isGenerating}
              onOpenApiModal={onOpenApiModal}
            />
          )}
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default DiscoverySetup;
