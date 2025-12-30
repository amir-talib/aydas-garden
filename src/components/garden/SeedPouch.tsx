"use client";

import { X } from "lucide-react";
import { Seed, SEED_PALETTE, formatDuration } from "@/types/garden";
import FlowerIcon from "@/components/ui/FlowerIcon";

interface SeedPouchProps {
  seeds: Seed[];
  selectedSeed: Seed | null;
  onSelect: (seed: Seed | null) => void;
  isPlantingMode: boolean;
}

export default function SeedPouch({
  seeds,
  selectedSeed,
  onSelect,
  isPlantingMode,
}: SeedPouchProps) {
  if (seeds.length === 0) {
    return (
      <div 
        className="fixed left-1/2 -translate-x-1/2 z-40 pointer-events-none opacity-60"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)" }}
      >
        <div className="bg-white/70 backdrop-blur-md rounded-full shadow-sm px-4 py-2 border border-white/30">
          <p className="text-stone-500 text-xs font-medium tracking-wide">
            No seeds waiting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 z-40 w-full max-w-md pointer-events-none flex justify-center px-4"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)" }}
      onClick={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-2 border border-white/30 pointer-events-auto ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-center justify-between px-2 pt-0.5 pb-1.5 border-b border-black/5 mb-1.5">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            {isPlantingMode ? "Tap ground to plant" : "Seed Pouch"}
          </p>
          {selectedSeed && (
            <button
              onClick={() => onSelect(null)}
              className="p-1.5 -mr-0.5 text-stone-400 active:text-stone-600 rounded-full active:bg-black/5 transition-colors"
              aria-label="Cancel selection"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Seeds */}
        <div className="flex gap-1.5 overflow-x-auto p-0.5 max-w-[calc(100vw-3rem)] scrollbar-hide">
          {seeds.map((seed) => {
            const palette = SEED_PALETTE[seed.color];
            const isSelected = selectedSeed?.id === seed.id;

            return (
              <button
                key={seed.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(isSelected ? null : seed);
                }}
                className={`
                  relative flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all duration-200 min-w-[52px] active:scale-95
                  ${isSelected
                    ? "bg-amber-100/80 ring-2 ring-amber-400/60 shadow-sm"
                    : "active:bg-stone-100/50"
                  }
                `}
                aria-label={`Plant ${palette.name}`}
              >
                {/* Flower Illustration */}
                <div className="filter drop-shadow-sm">
                  <FlowerIcon color={seed.color} size={28} />
                </div>

                {/* Duration Badge */}
                <span className={`
                  absolute -top-0.5 -right-0.5 text-[8px] font-bold px-1 py-0.5 rounded-full shadow-sm transition-colors
                  ${isSelected ? "bg-amber-500 text-white" : "bg-stone-200/80 text-stone-600"}
                `}>
                  {formatDuration(seed.durationMinutes)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}