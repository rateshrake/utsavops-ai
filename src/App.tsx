// =============================================================================
// UtsavOps AI — Main Application Shell
// Responsive dashboard with top nav, summary pills, and 4 main tabs.
// Wrapped in EventPlanProvider to prevent prop drilling and equipped with WCAG skip links.
// =============================================================================

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  EventProfile,
  BudgetCategory,
  TimelineTask,
  CrisisScenario,
  TradeOffStrategy,
} from './types/event';
import {
  generateFullPlan,
  generateSmartDemoPlan,
  isApiKeyAvailable,
  getSelectedModel,
  getModelDisplayName,
} from './services/geminiService';
import {
  DEFAULT_PROFILE,
  DEFAULT_BUDGET_CATEGORIES,
  DEFAULT_TIMELINE_TASKS,
  DEFAULT_CRISIS_SCENARIOS,
} from './data/defaults';
import ApiKeyModal from './components/ApiKeyModal';
import NoApiConfirmModal from './components/NoApiConfirmModal';
import DiscoverySetup from './components/DiscoverySetup';
import BudgetCrisis from './components/BudgetCrisis';
import DependencyTimeline from './components/DependencyTimeline';
import VendorQuoteAnalyzer from './components/VendorQuoteAnalyzer';
import { HeaderNav, type TabId, type TabItem } from './components/HeaderNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EventPlanProvider, type EventPlanContextType } from './context/EventPlanContext';

const TABS: TabItem[] = [
  { id: 'discovery', stepNumber: 1, label: 'Event Setup', emoji: '✨', ariaLabel: 'Event Setup tab' },
  { id: 'budget', stepNumber: 2, label: 'Budget & What-If', emoji: '💰', ariaLabel: 'Budget & What-If tab' },
  { id: 'timeline', stepNumber: 3, label: 'Checklist', emoji: '📅', ariaLabel: 'Checklist tab' },
  { id: 'vendor', stepNumber: 4, label: 'Compare Vendors', emoji: '🔍', ariaLabel: 'Compare Vendors tab' },
];

/**
 * Calculates remaining days from today until target event date.
 *
 * @param dateStr - ISO date string (YYYY-MM-DD).
 * @returns Non-negative number of days remaining.
 */
const getDaysLeft = (dateStr: string): number => {
  const diff = Math.round((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return Math.max(0, diff);
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('discovery');
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [noApiModalOpen, setNoApiModalOpen] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<EventProfile | null>(null);
  const [apiKeyRefresh, setApiKeyRefresh] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // --- Core State ---
  const [profile, setProfile] = useState<EventProfile>(DEFAULT_PROFILE);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(DEFAULT_BUDGET_CATEGORIES);
  const [timelineTasks, setTimelineTasks] = useState<TimelineTask[]>(DEFAULT_TIMELINE_TASKS);
  const [crisisScenarios, setCrisisScenarios] = useState<CrisisScenario[]>(DEFAULT_CRISIS_SCENARIOS);
  const [planSummary, setPlanSummary] = useState<string>(
    'Budget strategy prioritises Catering (30%) and Venue (22.5%) as the highest-ranked items, with Photography at 10% to capture memories. A 6.25% contingency buffer provides a safety net for last-minute surprises.'
  );

  const daysLeft = getDaysLeft(profile.date);
  const hasKey = apiKeyRefresh >= 0 && isApiKeyAvailable();
  const currentModelName = hasKey
    ? getModelDisplayName(getSelectedModel())
    : 'Demo Mode (No API Configured)';

  // Auto-refresh API status on mount
  useEffect(() => {
    setApiKeyRefresh((r) => r + 1);
  }, []);

  const handleOpenApiModal = useCallback((): void => {
    setApiModalOpen(true);
  }, []);

  const handleCloseApiModal = useCallback((): void => {
    setApiModalOpen(false);
  }, []);

  const handleCloseNoApiModal = useCallback((): void => {
    setNoApiModalOpen(false);
  }, []);

  const handleKeyRefresh = useCallback((): void => {
    setApiKeyRefresh((n) => n + 1);
  }, []);

  const handleClearGenError = useCallback((): void => {
    setGenError(null);
  }, []);

  const handleGenerateOfflineFallback = useCallback(
    (targetProfile?: EventProfile): void => {
      const prof = targetProfile || profile;
      if (targetProfile) {
        setProfile(targetProfile);
      }
      const smartPlan = generateSmartDemoPlan(prof);
      setBudgetCategories(smartPlan.budgetCategories);
      setTimelineTasks(smartPlan.timelineTasks);
      setCrisisScenarios(smartPlan.crisisScenarios);
      setPlanSummary(smartPlan.planSummary);
      setGenError(null);
      setIsGenerating(false);
      setActiveTab('budget');
    },
    [profile]
  );

  const handleGenerate = useCallback(
    async (overrideProfile?: EventProfile): Promise<void> => {
      const targetProfile = overrideProfile || profile;
      if (overrideProfile) {
        setProfile(overrideProfile);
      }

      // Check if an API key is configured
      if (!isApiKeyAvailable()) {
        setPendingProfile(targetProfile);
        setNoApiModalOpen(true);
        return;
      }

      setIsGenerating(true);
      setGenError(null);
      try {
        const plan = await generateFullPlan(targetProfile);
        setBudgetCategories(plan.budgetCategories);
        setTimelineTasks(plan.timelineTasks);
        setCrisisScenarios(plan.crisisScenarios);
        setPlanSummary(plan.planSummary);
        setActiveTab('budget');
      } catch (apiErr) {
        console.warn('[UtsavOps AI] Cloud API generation error:', apiErr);
        const msg =
          apiErr instanceof Error
            ? apiErr.message
            : 'AI plan generation failed. Click Retry or use Demo Mode.';
        setGenError(msg);
      } finally {
        setIsGenerating(false);
      }
    },
    [profile]
  );

  const handleConfirmDemo = useCallback((): void => {
    setNoApiModalOpen(false);
    handleGenerateOfflineFallback(pendingProfile || profile);
  }, [handleGenerateOfflineFallback, pendingProfile, profile]);

  const handleOpenApiFromPrompt = useCallback((): void => {
    setNoApiModalOpen(false);
    setApiModalOpen(true);
  }, []);

  const handleLockVendorPrice = useCallback(
    (categoryName: string, vendorName: string, amount: number): void => {
      setBudgetCategories((prevCategories) =>
        prevCategories.map((cat) => {
          const isMatch =
            cat.name.toLowerCase().includes(categoryName.toLowerCase().slice(0, 5)) ||
            categoryName.toLowerCase().includes(cat.name.toLowerCase().slice(0, 5)) ||
            (categoryName.toLowerCase().includes('cater') && cat.id === 'catering');

          if (isMatch) {
            return {
              ...cat,
              allocatedAmount: amount,
              actualCost: amount,
              isVerifiedQuote: true,
              notes: `Locked quote from ${vendorName} (Verified Quote)`,
            };
          }
          return cat;
        })
      );
    },
    []
  );

  const handleApplyRevision = useCallback(
    (strategy: TradeOffStrategy): void => {
      setBudgetCategories((prevCategories) => {
        const findMatch = (cat: BudgetCategory) => {
          const catNameLower = cat.name.toLowerCase();
          const catIdLower = cat.id.toLowerCase();

          return strategy.categoryAdjustments.find((adj) => {
            const adjNameLower = adj.categoryName.toLowerCase();
            const adjIdLower = adj.categoryId.toLowerCase();

            if (adjIdLower === catIdLower) return true;
            if (adjNameLower === catNameLower) return true;

            const keywords = [
              ['cater', 'food'],
              ['venue', 'hall', 'banquet'],
              ['decor', 'floral', 'flower', 'mandap'],
              ['photo', 'video', 'shoot', 'camera'],
              ['entertain', 'music', 'dj', 'dhol'],
              ['invite', 'gift', 'card'],
              ['beauty', 'makeup', 'trousseau', 'mehendi'],
              ['transport', 'car', 'logistics', 'travel'],
              ['pandit', 'ritual', 'pooja'],
              ['contingency', 'buffer', 'reserve'],
              ['stationery', 'signage', 'misc'],
            ];

            for (const group of keywords) {
              const catMatchesGroup = group.some((k) => catNameLower.includes(k) || catIdLower.includes(k));
              const adjMatchesGroup = group.some((k) => adjNameLower.includes(k) || adjIdLower.includes(k));
              if (catMatchesGroup && adjMatchesGroup) return true;
            }

            return false;
          });
        };

        const matchedAdjIds = new Set<string>();

        const updated = prevCategories.map((cat) => {
          const match = findMatch(cat);
          if (match) {
            matchedAdjIds.add(match.categoryId);
            return {
              ...cat,
              allocatedAmount: match.newAmount,
              notes: match.notes ? `${match.notes}` : cat.notes,
            };
          }
          return cat;
        });

        // Add any missing new categories from the strategy
        for (const adj of strategy.categoryAdjustments) {
          if (!matchedAdjIds.has(adj.categoryId) && adj.delta !== 0) {
            updated.push({
              id: adj.categoryId,
              name: adj.categoryName,
              allocatedAmount: adj.newAmount,
              actualCost: 0,
              isVerifiedQuote: false,
              notes: adj.notes || 'Adjusted allocation',
            });
          }
        }

        // Reconcile total budget sum
        if (strategy.newTotalBudget) {
          const currentSum = updated.reduce((sum, c) => sum + c.allocatedAmount, 0);
          const diff = strategy.newTotalBudget - currentSum;
          if (diff !== 0) {
            const targetCat =
              updated.find((c) => c.id.includes('contingency') || c.name.toLowerCase().includes('contingency')) ??
              updated[0];
            if (targetCat) {
              targetCat.allocatedAmount = Math.max(0, targetCat.allocatedAmount + diff);
            }
          }
        }

        return updated;
      });

      setProfile((prevProfile) => ({
        ...prevProfile,
        totalBudget: strategy.newTotalBudget ?? prevProfile.totalBudget,
        guestCount: strategy.newGuestCount ?? prevProfile.guestCount,
        date: strategy.newDate ?? prevProfile.date,
      }));

      if (strategy.newDate && strategy.newDate !== profile.date) {
        const shiftMs = new Date(strategy.newDate).getTime() - new Date(profile.date).getTime();
        setTimelineTasks((prevTasks) =>
          prevTasks.map((task) => {
            const oldTime = new Date(task.dueDate).getTime();
            const newDueDate = new Date(oldTime + shiftMs).toISOString().split('T')[0] ?? task.dueDate;
            return {
              ...task,
              dueDate: newDueDate,
            };
          })
        );
      }
    },
    [profile.date]
  );

  const contextValue: EventPlanContextType = useMemo(
    () => ({
      profile,
      setProfile,
      hasApiKey: hasKey,
      onOpenApiModal: handleOpenApiModal,
      isGenerating,
    }),
    [profile, hasKey, handleOpenApiModal, isGenerating]
  );

  return (
    <EventPlanProvider value={contextValue}>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
        {/* WCAG Skip to Main Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-indigo-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Skip to main content
        </a>

        {/* Top Header & Navigation */}
        <HeaderNav
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalBudget={profile.totalBudget}
          guestCount={profile.guestCount}
          daysLeft={daysLeft}
          hasApiKey={hasKey}
          activeModel={currentModelName}
          onOpenApiModal={handleOpenApiModal}
        />

        {/* Main Content Area */}
        <main
          id="main-content"
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
          role="main"
        >
          {activeTab === 'discovery' && (
            <ErrorBoundary fallbackTitle="Event Setup tab encountered an issue">
              <DiscoverySetup
                profile={profile}
                onProfileChange={setProfile}
                onGenerate={handleGenerate}
                onUseOfflineFallback={handleGenerateOfflineFallback}
                onClearError={handleClearGenError}
                isGenerating={isGenerating}
                error={genError}
                hasApiKey={hasKey}
                onOpenApiModal={handleOpenApiModal}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'budget' && (
            <ErrorBoundary fallbackTitle="Budget & What-If planner encountered an issue">
              <BudgetCrisis
                profile={profile}
                budgetCategories={budgetCategories}
                crisisScenarios={crisisScenarios}
                planSummary={planSummary}
                onBudgetUpdate={setBudgetCategories}
                onApplyRevision={handleApplyRevision}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'timeline' && (
            <ErrorBoundary fallbackTitle="Checklist & Timeline encountered an issue">
              <DependencyTimeline
                profile={profile}
                tasks={timelineTasks}
                onTaskUpdate={setTimelineTasks}
              />
            </ErrorBoundary>
          )}

          {activeTab === 'vendor' && (
            <ErrorBoundary fallbackTitle="Vendor Comparison tool encountered an issue">
              <VendorQuoteAnalyzer
                profile={profile}
                budgetCategories={budgetCategories}
                onLockVendorPrice={handleLockVendorPrice}
              />
            </ErrorBoundary>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 UtsavAI — Smart Celebration & Event Planner.</p>
            <p className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <span>Model: {currentModelName}</span>
              <span>•</span>
              <span>Zero Data Loss State Sync</span>
            </p>
          </div>
        </footer>

        {/* No API Key Confirmation Modal */}
        <NoApiConfirmModal
          isOpen={noApiModalOpen}
          onConfirmDemo={handleConfirmDemo}
          onOpenSettings={handleOpenApiFromPrompt}
          onClose={handleCloseNoApiModal}
        />

        {/* API Key Modal */}
        <ApiKeyModal
          isOpen={apiModalOpen}
          onClose={handleCloseApiModal}
          onKeyChanged={handleKeyRefresh}
        />
      </div>
    </EventPlanProvider>
  );
};

export default App;
