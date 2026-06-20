'use client';

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
      <div className="bg-surface-variant/30 mx-auto w-full max-w-xl animate-pulse rounded-2xl p-6">
        <div className="bg-primary/10 mb-4 h-4 w-3/4 rounded"></div>
        <div className="bg-primary/10 mb-8 h-4 w-1/2 rounded"></div>
        <div className="bg-primary/10 h-4 w-5/6 rounded"></div>
      </div>
    );
  }

  if (!insight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-low border-primary/5 mx-auto w-full max-w-xl rounded-2xl border p-6 shadow-sm md:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="text-primary mt-1 flex-shrink-0 rounded-full bg-white p-3 shadow-sm">
          <Sparkles size={20} />
        </div>
        <div className="space-y-4">
          <p className="font-display text-primary text-2xl leading-tight">
            {insight.insight}
          </p>

          <div className="border-primary/10 border-t pt-4">
            <p className="text-aethera-gray flex items-center gap-2 text-sm font-medium">
              <ArrowRight size={14} />
              Next time:{' '}
              <span className="text-primary">{insight.suggestion}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
