'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/storage';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useChatConversation } from '@/lib/hooks/useChatConversation';

export const EcoChat = React.memo(function EcoChat() {
  const { state } = useApp();
  const prefersReduced = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const { messages, inputText, setInputText, loading, handleSend } =
    useChatConversation(state.settings.geminiApiKey);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Move focus to input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      toggleButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Don't show the widget if not logged in
  if (!state.user) return null;

  const transitionDuration = prefersReduced ? 0 : 0.2;
  const containerTransition = prefersReduced
    ? { duration: 0 }
    : { type: 'spring' as const, damping: 20, stiffness: 260 };

  return (
    <div className="font-body fixed right-6 bottom-6 z-50">
      {/* Floating Action Button */}
      <motion.button
        ref={toggleButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close Sprout chat' : 'Open Sprout chat'}
        aria-expanded={isOpen}
        aria-controls="eco-chat-panel"
        className="bg-primary text-on-primary relative flex items-center justify-center rounded-full p-4 shadow-lg transition-shadow duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
        whileHover={{ scale: prefersReduced ? 1 : 1.05 }}
        whileTap={{ scale: prefersReduced ? 1 : 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: prefersReduced ? 0 : -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: prefersReduced ? 0 : 90, opacity: 0 }}
              transition={{ duration: transitionDuration }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ rotate: prefersReduced ? 0 : 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: prefersReduced ? 0 : -90, opacity: 0 }}
              transition={{ duration: transitionDuration }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Box Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="eco-chat-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="eco-chat-heading"
            initial={{
              opacity: 0,
              scale: prefersReduced ? 1 : 0.85,
              y: prefersReduced ? 0 : 30,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: prefersReduced ? 1 : 0.85,
              y: prefersReduced ? 0 : 30,
            }}
            transition={containerTransition}
            className="border-primary/5 absolute right-0 bottom-20 z-50 flex h-[500px] w-[340px] origin-bottom-right flex-col overflow-hidden rounded-3xl border bg-white/75 shadow-2xl backdrop-blur-xl sm:w-[380px]"
          >
            {/* Header */}
            <div className="bg-primary text-on-primary border-primary/5 flex items-center justify-between border-b p-5">
              <div className="flex items-center gap-3">
                <div
                  className="bg-on-primary/10 flex h-8 w-8 items-center justify-center rounded-full text-lg"
                  aria-hidden="true"
                >
                  🌱
                </div>
                <div>
                  <h2
                    id="eco-chat-heading"
                    className="font-display text-lg leading-tight tracking-wide"
                  >
                    Sprout AI Coach
                  </h2>
                  <div className="mt-0.5 flex items-center gap-1">
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400"
                      aria-hidden="true"
                    ></span>
                    <span className="text-on-primary/70 text-[10px] font-semibold tracking-wider uppercase">
                      Online Nurturer
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="text-on-primary/70 hover:text-on-primary p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Body — role="log" ensures screen readers announce new messages */}
            <div
              role="log"
              aria-live="polite"
              aria-label="Chat conversation"
              className="flex-1 scrollbar-thin space-y-4 overflow-y-auto bg-white/30 p-5"
            >
              {messages.map((message) => {
                const isAssistant = message.role === 'assistant';
                return (
                  <div
                    key={message.id}
                    className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} animate-fade-rise`}
                  >
                    <div
                      aria-label={
                        isAssistant
                          ? `Sprout replied: ${message.content}`
                          : `You said: ${message.content}`
                      }
                      className={`max-w-[85%] rounded-2xl border p-3.5 text-sm leading-relaxed ${
                        isAssistant
                          ? 'border-primary/5 text-primary rounded-tl-none bg-white shadow-sm'
                          : 'bg-primary text-on-primary border-primary/10 rounded-tr-none'
                      }`}
                    >
                      <div className="font-body whitespace-pre-line">
                        {message.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex justify-start">
                  <div className="border-primary/5 text-secondary flex items-center gap-2 rounded-2xl rounded-tl-none border bg-white p-4 shadow-sm">
                    <Loader2
                      size={16}
                      className="text-primary animate-spin"
                      aria-hidden="true"
                    />
                    <span className="text-xs italic">
                      Sprout is formulating eco-advice...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <div className="border-primary/5 flex gap-2 border-t bg-white/80 p-4 backdrop-blur-md">
              <label htmlFor="chat-input" className="sr-only">
                Message Sprout
              </label>
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                placeholder="Ask about footprint swaps, energy saving..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="bg-surface-variant/70 border-primary/5 focus:border-primary/20 text-primary flex-1 rounded-xl border px-4 py-2.5 text-xs transition-colors outline-none"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || loading}
                aria-label="Send message to Sprout"
                className="bg-primary text-on-primary rounded-xl p-2.5 transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              >
                <Send size={16} aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
