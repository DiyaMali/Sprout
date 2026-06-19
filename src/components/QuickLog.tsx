"use client";

import { useState } from 'react';
import { ACTIVITY_OPTIONS } from '@/lib/carbonData';
import { useApp } from '@/lib/storage';
import { ActivityCategory } from '@/lib/types';
import { Leaf, Zap, ShoppingBag, Car, PenLine, Loader2 } from 'lucide-react';

const CATEGORIES: { id: ActivityCategory | 'custom'; label: string; icon: React.ReactNode }[] = [
  { id: 'transport', label: 'Transport', icon: <Car size={18} /> },
  { id: 'meal', label: 'Meal', icon: <Leaf size={18} /> },
  { id: 'energy', label: 'Energy', icon: <Zap size={18} /> },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingBag size={18} /> },
  { id: 'custom', label: 'Custom', icon: <PenLine size={18} /> }
];

export function QuickLog({ onLog }: { onLog?: (activity: {categoryId: string, label: string, emissionsValue: number}) => void }) {
  const { state, logActivity } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'custom'>('transport');
  const [customText, setCustomText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const options = ACTIVITY_OPTIONS.filter(o => o.category === selectedCategory);

  const handleLog = (categoryId: string, optionId: string, label: string, emissionsValue: number) => {
    logActivity({
      categoryId: categoryId as ActivityCategory,
      optionId,
      label,
      emissionsValue,
    });
    if (onLog) onLog({ categoryId, label, emissionsValue });
  };

  const handleCustomLog = async () => {
    if (!customText.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customAction: customText,
          apiKeyOverride: state.settings.geminiApiKey,
        }),
      });
      const data = await res.json();
      handleLog('shopping', 'custom', data.label || 'Custom Action', data.emissionsValue || 0.5);
      setCustomText('');
      setSelectedCategory('transport');
    } catch {
      handleLog('shopping', 'custom', 'Eco Action', 0.5);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/50 backdrop-blur-md rounded-2xl border border-primary/5 p-6 shadow-sm">
      <h3 className="font-display text-3xl mb-6 text-primary">Log your choice</h3>
      
      {/* Category Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap
              ${selectedCategory === cat.id 
                ? 'bg-primary text-on-primary' 
                : 'bg-surface-variant text-on-surface-variant hover:bg-primary/10'}`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Option Chips or Custom Input */}
      {selectedCategory === 'custom' ? (
        <div className="flex gap-3 mt-4">
          <input 
            type="text" 
            placeholder="e.g. Repaired an old jacket instead of buying new..."
            className="flex-1 bg-surface-variant border-none rounded-xl px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-primary/20"
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomLog()}
            disabled={isEvaluating}
          />
          <button 
            onClick={handleCustomLog}
            disabled={!customText.trim() || isEvaluating}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center min-w-[100px] disabled:opacity-50"
          >
            {isEvaluating ? <Loader2 size={18} className="animate-spin" /> : 'Log'}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 mt-4">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleLog(selectedCategory, opt.id, opt.label, opt.emissionsValue)}
              className="px-5 py-3 rounded-xl border border-primary/10 bg-white hover:border-primary/30 hover:shadow-sm transition-all active:scale-95 text-sm font-medium"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
