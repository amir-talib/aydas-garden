"use client";

import { 
  Droplets, 
  Sun, 
  Moon, 
  Book, 
  Snowflake, 
  Leaf, 
  Flower2,
  Shovel
} from "lucide-react";
import Link from "next/link";

type Season = "spring" | "summer" | "fall" | "winter";

interface ControlBarProps {
  wateringMode: boolean;
  onWateringToggle: () => void;
  uprootMode: boolean;
  onUprootToggle: () => void;
  season: Season;
  onSeasonChange: () => void;
  isNight: boolean;
  onNightToggle: () => void;
  memoryCount: number;
}

export default function ControlBar({
  wateringMode,
  onWateringToggle,
  uprootMode,
  onUprootToggle,
  season,
  onSeasonChange,
  isNight,
  onNightToggle,
  memoryCount,
}: ControlBarProps) {
  const SeasonIcon = {
    spring: Flower2,
    summer: Sun,
    fall: Leaf,
    winter: Snowflake,
  }[season];

  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-xl rounded-full shadow-lg border border-white/30 ring-1 ring-black/5">
        {/* Watering */}
        <button
          onClick={onWateringToggle}
          className={`
            group relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 active:scale-95
            ${wateringMode 
              ? "bg-blue-500 text-white shadow-blue-200 shadow-md" 
              : "text-stone-500 active:bg-stone-100"
            }
          `}
          aria-label="Nurture mode"
        >
          <Droplets className={`w-5 h-5 transition-transform duration-300 ${wateringMode ? "scale-110" : ""}`} />
          {wateringMode && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
          )}
        </button>

        {/* Uproot */}
        <button
          onClick={onUprootToggle}
          className={`
            group relative flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 active:scale-95
            ${uprootMode 
              ? "bg-rose-500 text-white shadow-rose-200 shadow-md" 
              : "text-stone-500 active:bg-stone-100"
            }
          `}
          aria-label="Uproot mode"
        >
          <Shovel className={`w-5 h-5 transition-transform duration-300 ${uprootMode ? "scale-110 rotate-12" : ""}`} />
          {uprootMode && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          )}
        </button>

        <div className="w-px h-5 bg-stone-200/60" />

        {/* Season */}
        <button
          onClick={onSeasonChange}
          className="group flex items-center justify-center w-11 h-11 rounded-full text-stone-500 active:bg-stone-100 transition-all duration-300 active:scale-95"
          aria-label={`Season: ${season}`}
        >
          <SeasonIcon className={`w-5 h-5 transition-transform duration-300 ${
            season === 'spring' ? 'text-pink-500' :
            season === 'summer' ? 'text-amber-500' :
            season === 'fall' ? 'text-orange-600' :
            'text-sky-500'
          }`} />
        </button>

        <div className="w-px h-5 bg-stone-200/60" />

        {/* Day/Night */}
        <button
          onClick={onNightToggle}
          className={`
            group flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 active:scale-95
            ${isNight 
              ? "bg-indigo-900 text-indigo-100 active:bg-indigo-800" 
              : "text-stone-500 active:bg-stone-100"
            }
          `}
          aria-label={isNight ? "Switch to Day" : "Switch to Night"}
        >
          {isNight ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500" />
          )}
        </button>

        <div className="w-px h-5 bg-stone-200/60" />

        {/* Memories */}
        <Link
          href="/journal"
          className="group relative flex items-center justify-center w-11 h-11 rounded-full text-stone-500 active:bg-stone-100 transition-all duration-300 active:scale-95"
          aria-label="Memories"
        >
          <Book className="w-5 h-5" />
          {memoryCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-1 ring-white"></span>
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}