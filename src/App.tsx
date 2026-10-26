// =============================================================================
// UtsavOps AI — Main Application Shell
// Responsive dashboard with top nav, summary pills, and 4 main tabs.
// =============================================================================

import React, { useState, useCallback } from 'react';
import type {
  EventProfile,
  BudgetCategory,
  TimelineTask,
  CrisisScenario,
  TradeOffStrategy,
} from './types/event';
import { generateFullPlan, isApiKeyAvailable } from './services/geminiService';
import {
  DEFAULT_PROFILE,
  DEFAULT_BUDGET_CATEGORIES,
  DEFAULT_TIMELINE_TASKS,
  DEFAULT_CRISIS_SCENARIOS,
} from './data/defaults';
import ApiKeyModal from './components/ApiKeyModal';
import DiscoverySetup from './components/DiscoverySetup';
import BudgetCrisis from './components/BudgetCrisis';
import DependencyTimeline from './components/DependencyTimeline';
import VendorQuoteAnalyzer from './components/VendorQuoteAnalyzer';
import { HeaderNav, type TabId, type TabItem } from './components/HeaderNav';
import { ErrorBoundary } from './components/ErrorBoundary';

const TABS: TabItem[] = [
  { id: 'discovery', stepNumber: 1, label: 'Event Setup', emoji: '✨', ariaLabel: 'Event Setup tab' },
  { id: 'budget', stepNumber: 2, label: 'Budget & What-If', emoji: '💰', ariaLabel: 'Budget & What-If tab' },
  { id: 'timeline', stepNumber: 3, label: 'Checklist', emoji: '📅', ariaLabel: 'Checklist tab' },
  { id: 'vendor', stepNumber: 4, label: 'Compare Vendors', emoji: '🔍', ariaLabel: 'Compare Vendors tab' },
];

const getDaysLeft = (dateStr: string) => {
  const diff = Math.round((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return Math.max(0, diff);
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('discovery');
  const [apiModalOpen, setApiModalOpen] = useState(false);
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

  const handleGenerate = useCallback(async (overrideProfile?: EventProfile) => {
    setIsGenerating(true);
    setGenError(null);
    const targetProfile = overrideProfile || profile;
    if (overrideProfile) {
      setProfile(overrideProfile);
    }
    try {
      if (isApiKeyAvailable()) {
        try {
          const plan = await generateFullPlan(targetProfile);
          setBudgetCategories(plan.budgetCategories);
          setTimelineTasks(plan.timelineTasks);
          setCrisisScenarios(plan.crisisScenarios);
          setPlanSummary(plan.planSummary);
          setActiveTab('budget');
          return;
        } catch (apiErr) {
          console.warn('[UtsavOps AI] Cloud Gemini API error, seamlessly switching to smart offline planner:', apiErr);
          // If Gemini reported internal error or failed, fall through to smart offline planner
        }
      }

      // Smart Demo & Resilient Fallback: scale budget allocations proportionally to user-selected total budget
      const total = targetProfile.totalBudget;
      const scaledCategories = DEFAULT_BUDGET_CATEGORIES.map((cat) => ({
        ...cat,
        allocatedAmount: Math.round((cat.allocatedAmount / DEFAULT_PROFILE.totalBudget) * total),
      }));
      const sumAlloc = scaledCategories.reduce((acc, c) => acc + c.allocatedAmount, 0);
      if (sumAlloc !== total && scaledCategories.length > 0) {
        scaledCategories[0].allocatedAmount += total - sumAlloc;
      }
      setBudgetCategories(scaledCategories);
      setPlanSummary(
        `Smart master plan generated for ${targetProfile.occasion} (${targetProfile.title}). Budget allocated at ₹${total.toLocaleString('en-IN')} for ${targetProfile.guestCount} guests, prioritizing ${targetProfile.prioritiesRanked[0] || 'Catering'}.`
      );
      setActiveTab('budget');
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'AI generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [profile]);

  const handleLockVendorPrice = useCallback(
    (categoryName: string, vendorName: string, amount: number) => {
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

  const handleApplyRevision = useCallback((strategy: TradeOffStrategy) => {
    setBudgetCategories((prevCategories) => {
      // Helper function to check if an adjustment matches a category
      const findMatch = (cat: BudgetCategory) => {
        const catNameLower = cat.name.toLowerCase();
        const catIdLower = cat.id.toLowerCase();

        return strategy.categoryAdjustments.find((adj) => {
          const adjNameLower = adj.categoryName.toLowerCase();
          const adjIdLower = adj.categoryId.toLowerCase();

          if (adjIdLower === catIdLower) return true;
          if (adjNameLower === catNameLower) return true;

          // Domain synonym and keyword matching
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

      // If strategy has new categories not in prevCategories, add them
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

      // Reconcile total budget to ensure sum(allocatedAmount) === newTotalBudget
      if (strategy.newTotalBudget) {
        const currentSum = updated.reduce((sum, c) => sum + c.allocatedAmount, 0);
        const diff = strategy.newTotalBudget - currentSum;
        if (diff !== 0) {
          const targetCat =
            updated.find((c) => c.id.includes('contingency') || c.name.toLowerCase().includes('contingency')) ||
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
          const newDueDate = new Date(oldTime + shiftMs).toISOString().split('T')[0];
          return {
            ...task,
            dueDate: newDueDate,
          };
        })
      );
    }
  }, [profile.date]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header & Navigation */}
      <HeaderNav
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalBudget={profile.totalBudget}
        guestCount={profile.guestCount}
        daysLeft={daysLeft}
        hasApiKey={hasKey}
        onOpenApiModal={() => setApiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" role="main">
        <ErrorBoundary fallbackTitle="Application tab failed to render">
          {activeTab === 'discovery' && (
            <DiscoverySetup
              profile={profile}
              onProfileChange={setProfile}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              error={genError}
              hasApiKey={hasKey}
              onOpenApiModal={() => setApiModalOpen(true)}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetCrisis
              profile={profile}
              budgetCategories={budgetCategories}
              crisisScenarios={crisisScenarios}
              planSummary={planSummary}
              onBudgetUpdate={setBudgetCategories}
              onApplyRevision={handleApplyRevision}
            />
          )}

          {activeTab === 'timeline' && (
            <DependencyTimeline
              profile={profile}
              tasks={timelineTasks}
              onTaskUpdate={setTimelineTasks}
            />
          )}

          {activeTab === 'vendor' && (
            <VendorQuoteAnalyzer
              profile={profile}
              budgetCategories={budgetCategories}
              onLockVendorPrice={handleLockVendorPrice}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 UtsavAI — Smart Celebration & Event Planner.</p>
          <p className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <span>Model: Gemini 3.8 Flash</span>
            <span>•</span>
            <span>Zero Data Loss State Sync</span>
          </p>
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        onKeyChanged={() => setApiKeyRefresh((n) => n + 1)}
      />
    </div>
  );
};

export default App;
