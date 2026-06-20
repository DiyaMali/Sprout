import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Custom hook to manage Sprout AI Coach chat history, inputs, and API communication.
 *
 * @param geminiApiKey - User override API key.
 * @returns The messages history, input state, loading flag, send function, and reset function.
 */
export function useChatConversation(geminiApiKey: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am Sprout, your AI Eco-Coach. Ask me anything about swapping high-carbon habits, preparing plant-based meals, or making sense of your garden health today!',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const history = [...messages, userMessage];
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          apiKeyOverride: geminiApiKey,
        }),
      });
      if (!response.ok) throw new Error('API communication error');
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.content,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            'I hit a small communication snag. Let us focus on nurturing simple choices today.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [inputText, loading, messages, geminiApiKey]);

  return {
    messages,
    inputText,
    setInputText,
    loading,
    handleSend,
  };
}
