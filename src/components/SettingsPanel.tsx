/* eslint-disable jsx-a11y/click-events-have-key-events */
"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/storage';
import { Settings, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/** Trap keyboard focus within a modal element. */
function useFocusTrap(ref: React.RefObject<HTMLElement | null>, isActive: boolean) {
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
    : { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } };

  return (
    <>
      <button
        ref={triggerButtonRef}
        onClick={() => setIsOpen(true)}
        aria-label="Settings"
        aria-expanded={isOpen}
        aria-controls="settings-panel"
        className="fixed bottom-6 right-6 p-3 bg-surface-container-high rounded-full text-on-surface-variant hover:text-primary transition-colors shadow-sm z-40"
      >
        <Settings size={20} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm"
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
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-primary/10 relative"
            >
              <button
                onClick={handleClose}
                aria-label="Close settings"
                className="absolute top-4 right-4 text-aethera-gray hover:text-primary transition-colors"
              >
                <X size={20} aria-hidden="true" />
              </button>

              <h2 id="settings-panel-heading" className="font-display text-2xl mb-2 text-primary">
                Settings
              </h2>
              <p className="text-sm text-aethera-gray mb-6">
                Configure your experience. Your API key is stored locally and never sent to our servers.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-on-surface mb-1">
                    Gemini API Key (Optional)
                  </label>
                  <input
                    id="apiKey"
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  />
                  <p className="text-xs text-aethera-gray mt-2">
                    Used to generate personalized nudges. If left blank, a fallback insight will be provided.
                  </p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-aethera-gray hover:text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
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
