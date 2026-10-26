// =============================================================================
// UtsavAI — Tab 4 ("4. Compare Vendors")
// Side-by-side quote intake and scannable comparison matrix:
// 1. Top header with "✨ Load Sample Catering Quotes" 1-click button
// 2. 2 clean side-by-side input cards (Vendor 1 & Vendor 2, + Add 3rd Quote)
// 3. Centered big primary button: "✨ Compare Quotes & Find Hidden Costs"
// 4. Results: Warm emerald Winner recommendation banner + side-by-side cards
// =============================================================================

import React, { useState } from 'react';
import {
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import type {
  EventProfile,
  BudgetCategory,
  QuoteComparisonResult,
  AnalyzedQuoteComparison,
} from '../types/event';
import {
  compareVendorQuotes,
  analyzeQuotesOffline,
  isApiKeyAvailable,
} from '../services/geminiService';
import {
  SAMPLE_CATERING_QUOTES,
  DEFAULT_QUOTE_COMPARISON,
} from '../data/defaults';
import { QuoteInputTabs, type QuoteInputItem } from './quotes/QuoteInputTabs';
import { QuoteComparisonCard } from './quotes/QuoteComparisonCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorBoundary } from './ErrorBoundary';

interface VendorQuoteAnalyzerProps {
  profile: EventProfile;
  budgetCategories: BudgetCategory[];
  onLockVendorPrice?: (categoryName: string, vendorName: string, amount: number) => void;
}

const CATEGORY_OPTIONS = [
  'Catering & Food',
  'Venue & Hall',
  'Photography & Video',
  'Decor & Floral',
  'Entertainment & Music',
  'Invitations & Gifts',
  'Bridal Beauty & Trousseau',
  'Transportation',
];

export const VendorQuoteAnalyzer: React.FC<VendorQuoteAnalyzerProps> = ({
  profile,
  budgetCategories,
  onLockVendorPrice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Catering & Food');
  const [quoteInputs, setQuoteInputs] = useState<QuoteInputItem[]>(SAMPLE_CATERING_QUOTES);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<QuoteComparisonResult | null>(
    DEFAULT_QUOTE_COMPARISON
  );
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [justCompared, setJustCompared] = useState<boolean>(false);
  const [copiedVendorId, setCopiedVendorId] = useState<string | null>(null);
  const [lockSuccessToast, setLockSuccessToast] = useState<string | null>(null);
  const [lockedVendorId, setLockedVendorId] = useState<string | null>(null);

  const matchedCat = budgetCategories.find(
    (c) =>
      c.name.toLowerCase() === selectedCategory.toLowerCase() ||
      c.name.toLowerCase().includes(selectedCategory.toLowerCase().slice(0, 4)) ||
      selectedCategory.toLowerCase().includes(c.name.toLowerCase().slice(0, 4))
  );
  const allocatedBudget = matchedCat?.allocatedAmount || 240000;

  const handleLoadSampleQuotes = () => {
    setQuoteInputs(SAMPLE_CATERING_QUOTES);
    setComparisonResult(DEFAULT_QUOTE_COMPARISON);
    setComparisonError(null);
  };

  const handleAddEmptyQuote = () => {
    if (quoteInputs.length >= 3) return;
    const newQuote: QuoteInputItem = {
      id: `custom-quote-${Date.now()}`,
      vendorName: `Vendor #${quoteInputs.length + 1}`,
      rawText: '',
    };
    setQuoteInputs([...quoteInputs, newQuote]);
  };

  const handleRemoveQuote = (id: string) => {
    if (quoteInputs.length <= 1) return;
    setQuoteInputs(quoteInputs.filter((q) => q.id !== id));
  };

  const handleUpdateQuote = (id: string, fields: Partial<QuoteInputItem>) => {
    setQuoteInputs((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...fields } : q))
    );
  };

  const handleRunComparison = async () => {
    const validQuotes = quoteInputs.filter((q) => q.rawText.trim().length > 10);
    if (validQuotes.length === 0) {
      setComparisonError('Please paste quotation text for at least one vendor quote.');
      return;
    }

    setIsComparing(true);
    setComparisonError(null);
    try {
      if (isApiKeyAvailable()) {
        const result = await compareVendorQuotes(
          selectedCategory,
          allocatedBudget,
          profile.guestCount,
          validQuotes
        );
        setComparisonResult(result);
      } else {
        // Run smart offline heuristic analyzer with realistic micro-delay so the user sees the audit happen
        await new Promise((r) => setTimeout(r, 900));
        const offlineResult = analyzeQuotesOffline(
          selectedCategory,
          allocatedBudget,
          profile.guestCount,
          validQuotes
        );
        setComparisonResult(offlineResult);
      }
      setJustCompared(true);
      setTimeout(() => setJustCompared(false), 4500);

      // Smoothly scroll down so the user is directly anchored to the results
      setTimeout(() => {
        const el = document.getElementById('quote-comparison-results');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err) {
      try {
        const fallback = analyzeQuotesOffline(
          selectedCategory,
          allocatedBudget,
          profile.guestCount,
          validQuotes
        );
        setComparisonResult(fallback);
        setJustCompared(true);
        setTimeout(() => setJustCompared(false), 4500);
        setTimeout(() => {
          const el = document.getElementById('quote-comparison-results');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      } catch {
        setComparisonError(
          err instanceof Error ? err.message : 'Comparison failed. Please verify API key.'
        );
      }
    } finally {
      setIsComparing(false);
    }
  };

  const handleCopyWhatsAppQuestions = async (
    vendorName: string,
    questions: string[],
    vendorId: string
  ) => {
    const text = `Hi ${vendorName}, thank you for the quote for our celebration. We are reviewing vendor proposals and have 4 specific questions before confirming:\n\n${questions
      .map((q, idx) => `${idx + 1}. ${q}`)
      .join('\n\n')}\n\nCould you please confirm these points on WhatsApp? Thank you!`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedVendorId(vendorId);
      setTimeout(() => {
        setCopiedVendorId(null);
      }, 3000);
    } catch (err) {
      console.warn('[UtsavOps AI] Clipboard copy failed:', err);
    }
  };

  const handleLockInVendor = (quote: AnalyzedQuoteComparison) => {
    if (onLockVendorPrice) {
      onLockVendorPrice(selectedCategory, quote.vendorName, quote.baseCost);
    }
    setLockedVendorId(quote.id);
    setLockSuccessToast(
      `🎉 Successfully locked in ${quote.vendorName}! ₹${quote.baseCost.toLocaleString('en-IN')} updated in Tab 2 (${selectedCategory}) as a Verified Quote.`
    );
    setTimeout(() => {
      setLockSuccessToast(null);
    }, 5000);
  };

  return (
    <ErrorBoundary fallbackTitle="Error loading Vendor Quote Analyzer">
      <section aria-label="Vendor Quote Analyzer" className="space-y-6">
        {/* Celebratory Green Toast Notification */}
        {lockSuccessToast && (
          <div
            role="status"
            className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm font-semibold shadow-sm animate-pulse"
          >
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{lockSuccessToast}</span>
          </div>
        )}

        {/* Top Header Card with 1-Click Sample Button */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 border border-indigo-200/80 rounded-full text-xs font-semibold text-indigo-700 mb-1">
                <FileText size={12} className="text-indigo-600" />
                <span>Step 4 of 4 • Vendor Comparison</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Compare Vendor Proposals Side-by-Side
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Paste raw estimates from WhatsApp or email. UtsavAI calculates true unit costs, unmasks hidden surcharges, and crafts WhatsApp questions to negotiate like a pro.
              </p>
            </div>

            {/* 1-Click Load Sample Catering Quotes Button */}
            <button
              type="button"
              onClick={handleLoadSampleQuotes}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start md:self-auto flex-shrink-0"
              aria-label="Load Sample Catering Quotes"
            >
              <Sparkles size={14} className="text-indigo-600" />
              <span>✨ Load Sample Catering Quotes</span>
            </button>
          </div>
        </div>

        {/* 1. Side-by-Side Input Cards */}
        <QuoteInputTabs
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categoryOptions={CATEGORY_OPTIONS}
          allocatedBudget={allocatedBudget}
          guestCount={profile.guestCount}
          quoteInputs={quoteInputs}
          onAddQuote={handleAddEmptyQuote}
          onRemoveQuote={handleRemoveQuote}
          onUpdateQuote={handleUpdateQuote}
          onLoadSampleQuotes={handleLoadSampleQuotes}
        />

        {comparisonError && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="text-red-600 flex-shrink-0" />
            <span>{comparisonError}</span>
          </div>
        )}

        {/* 2. Big Centered Primary Button & Real-time Feedback */}
        <div className="flex flex-col items-center justify-center py-2 gap-2.5">
          <button
            type="button"
            onClick={handleRunComparison}
            disabled={isComparing}
            className={`w-full sm:w-auto px-10 py-3.5 font-bold rounded-2xl text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 ${
              justCompared
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/60 shadow-md'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
            }`}
            aria-label="Compare Quotes & Find Hidden Costs"
          >
            {isComparing ? (
              <>
                <Loader2 size={18} className="animate-spin text-white" />
                <span>Auditing Proposals with AI...</span>
              </>
            ) : justCompared ? (
              <>
                <CheckCircle2 size={18} className="text-emerald-100 animate-pulse" />
                <span>✓ Quotes Compared & Audited!</span>
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-white" />
                <span>✨ Compare Quotes & Find Hidden Costs</span>
              </>
            )}
          </button>

          {justCompared && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 shadow-2xs animate-fade-in">
              <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
              <span>
                Audited against your ₹{allocatedBudget.toLocaleString('en-IN')} {selectedCategory} budget! Detailed comparison below.
              </span>
            </div>
          )}
        </div>

        {/* Loading Skeleton while evaluating quotes */}
        {isComparing && (
          <LoadingSkeleton
            label="Auditing vendor quotations with AI..."
            subLabel="Unmasking hidden taxes, generator surcharges, and drafting 4 tough WhatsApp questions..."
            cardCount={2}
          />
        )}

        {/* 3. Results Section Below */}
        {comparisonResult && !isComparing && (
          <div id="quote-comparison-results" className="space-y-6 pt-2 scroll-mt-6">
            {/* Warm Emerald Highlight Banner: 1-Sentence Winner Recommendation */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-xs flex items-start gap-3.5">
              <div className="p-2.5 bg-emerald-600 text-white rounded-2xl flex-shrink-0 mt-0.5 shadow-xs">
                <Trophy size={20} />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  AI Recommendation & Synthesis
                </span>
                <p className="text-sm font-semibold text-emerald-950 leading-relaxed font-sans">
                  {comparisonResult.recommendation}
                </p>
              </div>
            </div>

            {/* Side-by-Side Comparison Cards */}
            <div
              className={`grid grid-cols-1 ${
                comparisonResult.quotes.length > 2 ? 'lg:grid-cols-3' : 'md:grid-cols-2'
              } gap-6`}
            >
              {comparisonResult.quotes.map((quote) => (
                <QuoteComparisonCard
                  key={quote.id}
                  quote={quote}
                  isCopied={copiedVendorId === quote.id}
                  onCopyWhatsAppQuestions={handleCopyWhatsAppQuestions}
                  onLockInVendor={handleLockInVendor}
                  isLockedIn={lockedVendorId === quote.id}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </ErrorBoundary>
  );
};

export default VendorQuoteAnalyzer;
