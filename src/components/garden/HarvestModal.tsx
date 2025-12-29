"use client";

import { useEffect, useState } from "react";
import type { Memory } from "@/types/garden";
import { SEED_PALETTE, formatDuration } from "@/types/garden";

interface HarvestModalProps {
  memory: Memory | null;
  onClose: () => void;
}

export default function HarvestModal({ memory, onClose }: HarvestModalProps) {
  const [stage, setStage] = useState<"entering" | "revealing" | "shown">("entering");
  const [messageVisible, setMessageVisible] = useState(false);

  useEffect(() => {
    if (memory) {
      // Animation sequence
      setStage("entering");
      setMessageVisible(false);

      const t1 = setTimeout(() => setStage("revealing"), 500);
      const t2 = setTimeout(() => {
        setStage("shown");
        setMessageVisible(true);
      }, 1500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [memory]);

  if (!memory) return null;

  const palette = SEED_PALETTE[memory.color];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={stage === "shown" ? onClose : undefined}
    >
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black transition-opacity duration-700
          ${stage === "entering" ? "opacity-0" : "opacity-60"}
        `}
      />

      {/* Content */}
      <div
        className={`
          relative max-w-sm w-full mx-6 bg-white rounded-3xl shadow-2xl overflow-hidden
          transition-all duration-700 ease-out
          ${stage === "entering" ? "scale-50 opacity-0" : "scale-100 opacity-100"}
        `}
      >
        {/* Decorative Header */}
        <div
          className="h-32 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${palette.hex} 0%, ${palette.hex}cc 100%)`,
          }}
        >
          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Flower Icon */}
          <div
            className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              text-6xl transition-all duration-1000
              ${stage === "revealing" || stage === "shown" ? "scale-100 rotate-0" : "scale-0 rotate-180"}
            `}
          >
            🌸
          </div>
        </div>

        {/* Message Section */}
        <div className="p-8 text-center">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
            A Message For You
          </p>

          <div
            className={`
              transition-all duration-700 delay-300
              ${messageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
          >
            <p className="text-xl font-serif text-stone-800 leading-relaxed mb-6">
              "{memory.message}"
            </p>

            <div className="flex items-center justify-center gap-4 text-xs text-stone-400">
              <span>Bloomed in {formatDuration(memory.durationMinutes)}</span>
              <span>•</span>
              <span>{palette.name}</span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`
              mt-8 px-8 py-3 rounded-full font-semibold text-white
              transition-all duration-500 delay-500
              ${messageVisible ? "opacity-100" : "opacity-0"}
            `}
            style={{ backgroundColor: palette.hex }}
          >
            Keep This Memory
          </button>
        </div>
      </div>
    </div>
  );
}
