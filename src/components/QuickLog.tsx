'use client';

import { useState } from 'react';
import { ACTIVITY_OPTIONS } from '@/lib/carbonData';
import { useApp } from '@/lib/storage';
import { ActivityCategory } from '@/lib/types';
import { Leaf, Zap, ShoppingBag, Car, PenLine, Loader2 } from 'lucide-react';

const CATEGORIES: {
  id: ActivityCategory | 'custom';
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'transport', label: 'Transport', icon: <Car size={18} /> },
  { id: 'meal', label: 'Meal', icon: <Leaf size={18} /> },
  { id: 'energy', label: 'Energy', icon: <Zap size={18} /> },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingBag size={18} /> },
  { id: 'custom', label: 'Custom', icon: <PenLine size={18} /> },
];

/**
 * Properties for the QuickLog component.
 */
interface QuickLogProps {
  /** Optional callback invoked after successfully logging an activity. */
  onLog?: (activity: {
    categoryId: string;
    label: string;
    emissionsValue: number;
  }) => void;
}

/**
 * QuickLog component allows the user to quickly log environmental activities
 * by choosing from predefined options across categories or evaluating custom actions.
 */
export function QuickLog({ onLog }: QuickLogProps): React.JSX.Element {
  const { state, logActivity } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<
    ActivityCategory | 'custom'
  >('transport');
  const [customText, setCustomText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState('');

  const options = ACTIVITY_OPTIONS.filter(
    (option) => option.category === selectedCategory,
  );

  const handleLog = (
    categoryId: string,
    optionId: string,
    label: string,
    emissionsValue: number,
  ) => {
    setError('');
    logActivity({
      categoryId: categoryId as ActivityCategory,
      optionId,
      label,
      emissionsValue,
    });
    if (onLog) onLog({ categoryId, label, emissionsValue });
  };

  const handleCustomLog = async () => {
    if (!customText.trim()) {
      setError('Please enter a custom action before logging.');
      return;
    }
    if (isEvaluating) return;
    setError('');
    setIsEvaluating(true);
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customAction: customText,
          apiKeyOverride: state.settings.geminiApiKey,
        }),
      });
      const data = await response.json();
      handleLog(
        'shopping',
        'custom',
        data.label || 'Custom Action',
        data.emissionsValue || 0.5,
      );
      setCustomText('');
      setSelectedCategory('transport');
    } catch {
      handleLog('shopping', 'custom', 'Eco Action', 0.5);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="border-primary/5 mx-auto w-full max-w-xl rounded-2xl border bg-white/50 p-6 shadow-sm backdrop-blur-md">
      <h3 className="font-display text-primary mb-6 text-3xl">
        Log your choice
      </h3>

      {/* Category Tabs */}
      <div
        className="mb-6 flex scrollbar-none space-x-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Activity categories"
      >
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            role="tab"
            aria-selected={selectedCategory === category.id}
            onClick={() => {
              setSelectedCategory(category.id);
              setError('');
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary text-on-primary'
                : 'bg-surface-variant text-on-surface-variant hover:bg-primary/10'
            }`}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </div>

      {/* Option Chips or Custom Input */}
      {selectedCategory === 'custom' ? (
        <fieldset className="m-0 border-none p-0">
          <legend className="sr-only">Custom eco action</legend>
          <div className="mt-4 flex gap-3">
            <label htmlFor="custom-action-input" className="sr-only">
              Describe your custom eco action
            </label>
            <input
              id="custom-action-input"
              type="text"
              placeholder="e.g. Repaired an old jacket instead of buying new..."
              className="bg-surface-variant font-body focus:ring-primary/20 flex-1 rounded-xl border-none px-4 py-3 text-sm outline-none focus:ring-2"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomLog()}
              disabled={isEvaluating}
              aria-describedby={error ? 'log-error' : undefined}
            />
            <button
              onClick={handleCustomLog}
              disabled={!customText.trim() || isEvaluating}
              aria-label="Log selected eco actions"
              aria-describedby={error ? 'log-error' : undefined}
              className="bg-primary text-on-primary flex min-w-[100px] items-center justify-center rounded-xl px-6 py-3 text-sm font-medium disabled:opacity-50"
            >
              {isEvaluating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Log'
              )}
            </button>
          </div>
        </fieldset>
      ) : (
        <fieldset className="m-0 border-none p-0">
          <legend className="sr-only">
            {CATEGORIES.find((category) => category.id === selectedCategory)
              ?.label ?? 'Activity'}{' '}
            options
          </legend>
          <div className="mt-4 flex flex-wrap gap-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  handleLog(
                    selectedCategory,
                    option.id,
                    option.label,
                    option.emissionsValue,
                  )
                }
                aria-label={`Log ${option.label}`}
                className="border-primary/10 hover:border-primary/30 rounded-xl border bg-white px-5 py-3 text-sm font-medium transition-all hover:shadow-sm active:scale-95"
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Inline validation error */}
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          id="log-error"
          className="font-body mt-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
