/* eslint-disable jsx-a11y/click-events-have-key-events */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/storage';
import { Settings, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/** Trap keyboard focus within a modal element. */
function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  isActive: boolean,
) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusable = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (!first || !last) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    // Move focus to first focusable element
    first?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, isActive]);
}

export function SettingsPanel() {
  const { state, updateSettings } = useApp();
  const prefersReduced = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [tempKey, setTempKey] = useState(state.settings.geminiApiKey ?? '');
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(panelRef, isOpen);

  const handleSave = () => {
    updateSettings({ geminiApiKey: tempKey });
    setIsOpen(false);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Return focus to trigger button
    setTimeout(() => triggerButtonRef.current?.focus(), 50);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const animationProps = prefersReduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
      };

  return (
    <>
      <button
        ref={triggerButtonRef}
        onClick={() => setIsOpen(true)}
        aria-label="Settings"
        aria-expanded={isOpen}
        aria-controls="settings-panel"
        className="bg-surface-container-high text-on-surface-variant hover:text-primary fixed right-6 bottom-6 z-40 rounded-full p-3 shadow-sm transition-colors"
      >
        <Settings size={20} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
          >
            <motion.div
              ref={panelRef}
              id="settings-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-panel-heading"
              {...animationProps}
              className="border-primary/10 relative w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl"
            >
              <button
                onClick={handleClose}
                aria-label="Close settings"
                className="text-aethera-gray hover:text-primary absolute top-4 right-4 transition-colors"
              >
                <X size={20} aria-hidden="true" />
              </button>

              <h2
                id="settings-panel-heading"
                className="font-display text-primary mb-2 text-2xl"
              >
                Settings
              </h2>
              <p className="text-aethera-gray mb-6 text-sm">
                Configure your experience. Your API key is stored locally and
                never sent to our servers.
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="apiKey"
                    className="text-on-surface mb-1 block text-sm font-medium"
                  >
                    Gemini API Key (Optional)
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="border-primary/20 bg-surface-variant/30 focus:border-primary focus:ring-primary w-full rounded-lg border px-4 py-2 text-sm focus:ring-1 focus:outline-none"
                  />
                  <p className="text-aethera-gray mt-2 text-xs">
                    Used to generate personalized nudges. If left blank, a
                    fallback insight will be provided.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={handleClose}
                    className="text-aethera-gray hover:text-primary px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-primary text-on-primary rounded-lg px-6 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
