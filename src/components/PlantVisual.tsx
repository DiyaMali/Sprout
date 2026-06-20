'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PlantStage } from '@/lib/types';

import {
  STAGE_DESCRIPTIONS,
  STAGE_LABELS,
  STAGE_NAMES as STAGE_ORDER,
} from '@/lib/constants';
export { STAGE_DESCRIPTIONS, STAGE_LABELS };

function getStageIndex(stage: PlantStage): number {
  const index = STAGE_ORDER.indexOf(stage);
  return index;
}

// ─── SVG representations ─────────────────────────────────────────────────────
const STAGES_SVG: Record<PlantStage, React.ReactNode> = {
  wilted: (
    <svg viewBox="0 0 100 100" className="text-aethera-gray h-full w-full">
      <path
        d="M50 90 Q40 60 30 70 Q40 80 50 90"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M50 90 Q60 50 70 65 Q60 75 50 90"
        fill="currentColor"
        opacity="0.4"
      />
      <path
        d="M50 90 L50 60"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  ),
  seedling: (
    <svg viewBox="0 0 100 100" className="h-full w-full text-[#8eb28e]">
      <path
        d="M50 90 Q40 70 30 65 Q45 60 50 90"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M50 90 Q60 70 70 65 Q55 60 50 90"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M50 90 L50 55"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  ),
  budding: (
    <svg viewBox="0 0 100 100" className="h-full w-full text-[#6bcb77]">
      <path
        d="M50 90 Q30 60 20 40 Q40 40 50 70"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M50 90 Q70 60 80 40 Q60 40 50 70"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M50 90 L50 35"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="50" cy="30" r="6" fill="#f0e68c" />
    </svg>
  ),
  blooming: (
    <svg viewBox="0 0 100 100" className="h-full w-full text-[#4d9f58]">
      <path d="M50 90 Q25 50 15 30 Q35 35 50 65" fill="currentColor" />
      <path
        d="M50 90 Q75 50 85 30 Q65 35 50 65"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M50 90 L50 25"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="50" cy="20" r="10" fill="#ffd700" />
      <circle cx="40" cy="15" r="8" fill="#ffd700" opacity="0.8" />
      <circle cx="60" cy="15" r="8" fill="#ffd700" opacity="0.8" />
    </svg>
  ),
  flourishing: (
    <svg viewBox="0 0 100 100" className="h-full w-full text-[#2e7d32]">
      <path d="M50 90 Q20 50 5 25 Q30 25 50 60" fill="currentColor" />
      <path
        d="M50 90 Q80 50 95 25 Q70 25 50 60"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M50 60 Q20 30 15 10 Q35 15 50 40"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M50 60 Q80 30 85 10 Q65 15 50 40"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M50 90 L50 15"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="50" cy="10" r="12" fill="#ffb300" />
      <circle cx="35" cy="15" r="10" fill="#ffa000" />
      <circle cx="65" cy="15" r="10" fill="#ffa000" />
    </svg>
  ),
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Properties for the PlantVisual component.
 */
interface PlantVisualProps {
  /** The current visual growth stage of the plant organism. */
  stage: PlantStage;
  /** Optional custom CSS classes for sizing and layout. */
  className?: string;
}

/**
 * Renders the reactive visual representation of the user's eco-plant,
 * displaying custom SVG graphics and animations based on the current PlantStage.
 * Handles accessibility tags and reduced motion preferences seamlessly.
 */
export const PlantVisual = React.memo(function PlantVisual({
  stage,
  className = 'w-64 h-64',
}: PlantVisualProps) {
  const prefersReduced = useReducedMotion();
  const stageIndex = getStageIndex(stage);
  const stageLabel = STAGE_LABELS[stageIndex] ?? STAGE_LABELS[0];
  const stageDescription =
    STAGE_DESCRIPTIONS[stageIndex] ?? STAGE_DESCRIPTIONS[0];
  const ariaLabel = `Plant stage: ${stageLabel} — ${stageDescription}`;

  return (
    <div
      className={`relative mx-auto flex items-center justify-center ${className}`}
      data-testid="plant-visual"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          role="img"
          aria-label={ariaLabel}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{
            duration: prefersReduced ? 0 : 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute inset-0"
        >
          {/* Accessible SVG title for screen readers */}
          <svg
            viewBox="0 0 0 0"
            aria-hidden="true"
            style={{ position: 'absolute', width: 0, height: 0 }}
          >
            <title>{`Plant stage: ${stageLabel}`}</title>
          </svg>
          {STAGES_SVG[stage]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});
