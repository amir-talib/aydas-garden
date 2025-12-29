"use client";

import Link from "next/link";
import { useGarden } from "@/hooks/useGarden";
import { SEED_PALETTE, formatDuration } from "@/types/garden";

export default function JournalPage() {
  const { memories, loading } = useGarden();

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Back to Garden
          </Link>
          <h1 className="font-serif text-xl font-semibold text-stone-800">
            Journal
          </h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-xl font-serif text-stone-600 mb-2">
              No Memories Yet
            </h2>
            <p className="text-stone-400 text-sm">
              When you harvest a flower, its message will appear here forever.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-stone-500 text-center mb-8">
              {memories.length} {memories.length === 1 ? "memory" : "memories"} preserved
            </p>

            {memories.map((memory) => {
              const palette = SEED_PALETTE[memory.color];
              const date = memory.harvestedAt.toDate();

              return (
                <article
                  key={memory.id}
                  className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Color Bar */}
                  <div
                    className="h-2"
                    style={{ backgroundColor: palette.hex }}
                  />

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-lg font-serif text-stone-800 leading-relaxed mb-4">
                      "{memory.message}"
                    </p>

                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: palette.hex }}
                        />
                        <span>{palette.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>Bloomed in {formatDuration(memory.durationMinutes)}</span>
                        <span>•</span>
                        <span>
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
