'use client';

import { useState } from 'react';

export default function TestAI() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  async function askAI() {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setAnswer(data.answer || data.error);
  }

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">Test LokLens AI</h1>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something..."
        className="border p-2 w-full rounded"
      />

      <button
        onClick={askAI}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Ask AI
      </button>

      <div className="border rounded p-4 min-h-[100px]">
        {answer}
      </div>
    </div>
  );
}