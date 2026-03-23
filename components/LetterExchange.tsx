"use client";

import { useState, useEffect, useRef } from "react";
import { HistoricalFigure } from "@/lib/figures";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Props {
  figure: HistoricalFigure;
  onBack: () => void;
}

const STORAGE_KEY = (figureId: string) => `penpal_letters_${figureId}`;

export default function LetterExchange({ figure, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load saved conversation
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY(figure.id));
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [figure.id]);

  // Save on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY(figure.id), JSON.stringify(messages));
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, figure.id]);

  async function sendLetter() {
    if (!draft.trim() || loading) return;
    const userMessage: Message = {
      role: "user",
      content: draft.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setDraft("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figureId: figure.id,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Failed to send");
      const data = await res.json();

      const reply: Message = {
        role: "assistant",
        content: data.letter,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      setError("The letter was lost in transit. Try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    if (confirm(`Clear your entire correspondence with ${figure.name}?`)) {
      localStorage.removeItem(STORAGE_KEY(figure.id));
      setMessages([]);
    }
  }

  return (
    <main
      className="min-h-screen bg-amber-50 flex flex-col"
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4b896' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      {/* Header */}
      <div className="bg-amber-100 border-b-2 border-amber-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onBack} className="text-stone-500 hover:text-stone-800 text-sm flex items-center gap-2 transition-colors">
          ← All Figures
        </button>
        <div className="text-center">
          <h2 className="font-bold text-stone-800" style={{ fontFamily: "Georgia, serif" }}>
            {figure.avatar} {figure.name}
          </h2>
          <p className="text-xs text-stone-500">{figure.era}</p>
        </div>
        <button onClick={clearConversation} className="text-stone-400 hover:text-red-500 text-xs transition-colors">
          Clear
        </button>
      </div>

      {/* Letters */}
      <div className="flex-1 overflow-y-auto px-4 py-8 max-w-2xl mx-auto w-full space-y-8">
        {messages.length === 0 && (
          <div className="text-center text-stone-400 mt-16">
            <p className="text-4xl mb-4">{figure.avatar}</p>
            <p className="text-lg" style={{ fontFamily: "Georgia, serif" }}>
              Begin your correspondence with {figure.name}
            </p>
            <p className="text-sm mt-2 max-w-sm mx-auto">
              Write your first letter below. They will reply as they would have in their time.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-lg w-full rounded-2xl p-6 shadow-sm ${
                msg.role === "user"
                  ? "bg-stone-700 text-amber-50 rounded-tr-none"
                  : "bg-amber-100 border border-amber-200 text-stone-800 rounded-tl-none"
              }`}
            >
              {msg.role === "assistant" && (
                <p className="text-xs font-semibold text-amber-600 mb-3 uppercase tracking-widest">
                  {figure.name}
                </p>
              )}
              {msg.role === "user" && (
                <p className="text-xs font-semibold text-amber-200 mb-3 uppercase tracking-widest">
                  Your Letter
                </p>
              )}
              <p
                className="leading-relaxed whitespace-pre-wrap text-sm"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {msg.content}
              </p>
              <p className={`text-xs mt-4 ${msg.role === "user" ? "text-amber-200/60" : "text-stone-400"}`}>
                {new Date(msg.timestamp).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-amber-100 border border-amber-200 rounded-2xl rounded-tl-none px-6 py-4 max-w-sm">
              <p className="text-xs font-semibold text-amber-600 mb-2 uppercase tracking-widest">{figure.name}</p>
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-center text-red-500 text-sm">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="bg-amber-100 border-t-2 border-amber-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendLetter();
            }}
            placeholder={`Write your letter to ${figure.name}...`}
            rows={4}
            className="w-full bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 resize-none"
            style={{ fontFamily: "Georgia, serif" }}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-stone-400">Cmd+Enter to send</p>
            <button
              onClick={sendLetter}
              disabled={!draft.trim() || loading}
              className="bg-stone-700 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed text-amber-50 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Send Letter →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
