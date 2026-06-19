"use client";

import { useState } from 'react';
import { useApp } from '@/lib/storage';
import { Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SettingsPanel() {
  const { state, updateSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [tempKey, setTempKey] = useState(state.settings.geminiApiKey || '');

  const handleSave = () => {
    updateSettings({ geminiApiKey: tempKey });
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-surface-container-high rounded-full text-on-surface-variant hover:text-primary transition-colors shadow-sm z-40"
        aria-label="Settings"
      >
        <Settings size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-primary/10 relative"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-aethera-gray hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
              
              <h2 className="font-display text-2xl mb-2 text-primary">Settings</h2>
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
                    onClick={() => setIsOpen(false)}
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
