'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  selectedState?: string | null;
}

export default function AIAssistant({
  selectedState,
}: Props) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '👋 Hi! I am LokLens AI. Ask me about MPs, Parliament, bills, attendance or your selected state.',
    },
  ]);

  async function sendMessage() {
    if (!question.trim() || loading) return;

    const userMessage = question;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
      },
    ]);

    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
  question: userMessage,
  state: selectedState,
}),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer ?? 'Sorry, something went wrong.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to contact the AI service.',
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-indigo-600 text-white shadow-2xl hover:scale-110 transition-all"
      >
        <Bot className="h-7 w-7 mx-auto" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="font-bold text-foreground">
                  LokLens AI
                </p>
                <p className="text-xs text-muted-foreground">
                  Parliamentary Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-background">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === 'assistant'
                    ? 'bg-card border border-border text-foreground'
                    : 'ml-auto bg-indigo-600 text-white'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 bg-card">
            <div className="flex items-center gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Ask about MPs, bills, attendance..."
                className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                onClick={sendMessage}
                disabled={loading}
                className="rounded-xl bg-indigo-600 p-3 text-white hover:bg-indigo-500 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}