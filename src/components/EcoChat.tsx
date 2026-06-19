"use client";

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function EcoChat() {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am Sprout, your AI Eco-Coach. Ask me anything about swapping high-carbon habits, preparing plant-based meals, or making sense of your garden health today!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Don't show the widget if not logged in
  if (!state.user) return null;

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const history = [...messages, userMsg];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          apiKeyOverride: state.settings.geminiApiKey
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I hit a small communication snag. Let us focus on nurturing simple choices today."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-body">
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-on-primary p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center relative hover:scale-105 active:scale-95 duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
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
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="absolute bottom-20 right-0 w-[340px] sm:w-[380px] h-[500px] bg-white/75 backdrop-blur-xl border border-primary/5 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 origin-bottom-right"
          >
            {/* Header */}
            <div className="bg-primary text-on-primary p-5 flex items-center justify-between border-b border-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-on-primary/10 flex items-center justify-center text-lg">
                  🌱
                </div>
                <div>
                  <h3 className="font-display text-lg tracking-wide leading-tight">Sprout AI Coach</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-on-primary/70 font-semibold uppercase tracking-wider">Online Nurturer</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-on-primary/70 hover:text-on-primary transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white/30 scrollbar-thin">
              {messages.map((msg) => {
                const isAI = msg.role === 'assistant';
                return (
                  <div 
                    key={msg.id}
                    className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade-rise`}
                  >
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed border ${
                      isAI 
                        ? 'bg-white border-primary/5 text-primary rounded-tl-none shadow-sm' 
                        : 'bg-primary text-on-primary border-primary/10 rounded-tr-none'
                    }`}>
                      <div className="whitespace-pre-line font-body">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-primary/5 text-secondary p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="text-xs italic">Sprout is formulating eco-advice...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <div className="p-4 border-t border-primary/5 bg-white/80 backdrop-blur-md flex gap-2">
              <input
                type="text"
                placeholder="Ask about footprint swaps, energy saving..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-surface-variant/70 border border-primary/5 focus:border-primary/20 rounded-xl px-4 py-2.5 text-xs outline-none transition-colors text-primary"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || loading}
                className="bg-primary text-on-primary p-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
