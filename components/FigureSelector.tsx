"use client";

import { useState } from "react";
import { FIGURES, HistoricalFigure } from "@/lib/figures";
import LetterExchange from "@/components/LetterExchange";

export default function FigureSelector() {
  const [selected, setSelected] = useState<HistoricalFigure | null>(null);

  if (selected) {
    return <LetterExchange figure={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <main className="min-h-screen bg-amber-50 text-stone-900 flex flex-col items-center px-4 py-16"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4b896' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-3 text-stone-800" style={{ fontFamily: "Georgia, serif" }}>
          Letters Across Time
        </h1>
        <p className="text-stone-500 text-lg max-w-md mx-auto">
          Choose a historical figure and begin a correspondence. They only know their world — you&apos;ll know both.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-3xl">
        {FIGURES.map((figure) => (
          <button
            key={figure.id}
            onClick={() => setSelected(figure)}
            className="bg-amber-100 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 rounded-2xl p-6 text-left transition-all hover:shadow-lg group"
          >
            <div className="text-4xl mb-3">{figure.avatar}</div>
            <h2 className="text-xl font-bold text-stone-800 group-hover:text-stone-900" style={{ fontFamily: "Georgia, serif" }}>
              {figure.name}
            </h2>
            <p className="text-sm text-amber-700 font-medium mt-0.5">{figure.role}</p>
            <p className="text-xs text-stone-500 mt-1">{figure.years} · {figure.era}</p>
            <p className="text-sm text-stone-600 mt-3 leading-relaxed line-clamp-2">{figure.personality}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
