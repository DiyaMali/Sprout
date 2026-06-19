"use client";

import { InsightResponse } from '@/lib/types';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface InsightCardProps {
  insight: InsightResponse | null;
  isLoading: boolean;
}

export function InsightCard({ insight, isLoading }: InsightCardProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto bg-surface-variant/30 rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-primary/10 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-primary/10 rounded w-1/2 mb-8"></div>
        <div className="h-4 bg-primary/10 rounded w-5/6"></div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl mx-auto bg-surface-container-low rounded-2xl p-6 md:p-8 border border-primary/5 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-full shadow-sm text-primary flex-shrink-0 mt-1">
          <Sparkles size={20} />
        </div>
        <div className="space-y-4">
          <p className="font-display text-2xl leading-tight text-primary">
            {insight.insight}
          </p>
          
          <div className="pt-4 border-t border-primary/10">
            <p className="text-sm font-medium text-aethera-gray flex items-center gap-2">
              <ArrowRight size={14} />
              Next time: <span className="text-primary">{insight.suggestion}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
