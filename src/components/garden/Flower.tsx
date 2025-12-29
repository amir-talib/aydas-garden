"use client";

import { useState, useEffect } from "react";
import type { Plant, GrowthStage } from "@/types/garden";
import {
  SEED_PALETTE,
  calculateGrowthStage,
  calculateProgress,
  calculateHydration,
  calculateTimeRemaining,
  formatCountdown,
} from "@/types/garden";
import WateringCan from "./WateringCan";

interface FlowerProps {
  plant: Plant;
  onWater: () => void;
  onHarvest: () => void;
  onUproot: () => void;
  wateringMode?: boolean;
  uprootMode?: boolean;
}

export default function Flower({ 
  plant, 
  onWater, 
  onHarvest, 
  onUproot,
  wateringMode = false,
  uprootMode = false,
}: FlowerProps) {
  const [isWatering, setIsWatering] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [isUprooting, setIsUprooting] = useState(false);
  const [showUprootConfirm, setShowUprootConfirm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(plant));

  const stage = calculateGrowthStage(plant);
  const hydration = calculateHydration(plant.lastWateredAt);
  const progress = calculateProgress(plant);
  const palette = SEED_PALETTE[plant.color];

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(plant));
    }, 1000);
    return () => clearInterval(interval);
  }, [plant]);

  // Droop angle based on hydration (0-25 degrees)
  // If happy (just watered), perk up immediately
  const droopAngle = isHappy ? 0 : (100 - hydration) * 0.25;

  const handleWater = () => {
    if (isWatering) return;
    
    setIsWatering(true);
    
    setTimeout(() => {
      onWater();
      setIsHappy(true);
    }, 800);

    setTimeout(() => setIsHappy(false), 2000);
  };

  const handleUproot = () => {
    setShowUprootConfirm(false);
    setIsUprooting(true);
    
    // Wait for animation then delete
    setTimeout(() => {
      onUproot();
    }, 600);
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    if (uprootMode) {
      setShowUprootConfirm(true);
      return;
    }
    
    if (stage === "ready") {
      onHarvest();
    } else if (wateringMode || hydration < 50) {
      handleWater();
    }
  };

  const stageConfig: Record<GrowthStage, { scale: number; stemHeight: number; petalSize: number }> = {
    sprout: { scale: 0.5, stemHeight: 20, petalSize: 0 },
    seedling: { scale: 0.65, stemHeight: 35, petalSize: 10 },
    budding: { scale: 0.8, stemHeight: 50, petalSize: 14 },
    blooming: { scale: 1, stemHeight: 65, petalSize: 18 },
    ready: { scale: 1.1, stemHeight: 80, petalSize: 20 },
  };

  const config = stageConfig[stage];

  return (
    <>
      <div
        className={`absolute select-none transition-all duration-500 ease-out ${
          isUprooting ? "opacity-0 translate-y-8 scale-75" : ""
        } ${uprootMode ? "animate-pulse" : ""}`}
        style={{
          left: plant.position.x,
          top: plant.position.y,
          transform: `translate(-50%, -100%) scale(${config.scale})`,
          zIndex: Math.floor(plant.position.y),
        }}
        onClick={handleClick}
      >
        {/* Watering Can Overlay */}
        {isWatering && (
          <WateringCan onComplete={() => setIsWatering(false)} />
        )}

        {/* Uproot Mode Indicator */}
        {uprootMode && !showUprootConfirm && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            TAP TO UPROOT
          </div>
        )}

        {/* Flower Content Group (Bounces when happy) */}
        <div className={`relative transition-transform ${isHappy ? "animate-bounce-happy" : ""}`}>
          {/* Flower Head */}
          <div 
            className="relative transition-transform duration-1000 origin-bottom"
            style={{ transform: `rotate(${droopAngle}deg)` }}
          >
            <div style={{ width: 60, height: 60 }} className="relative">
              {stage !== "sprout" && (
                <>
                  {/* Petals */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full shadow-sm"
                      style={{
                        width: config.petalSize,
                        height: config.petalSize,
                        backgroundColor: palette.hex,
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${config.petalSize + 4}px)`,
                        opacity: hydration < 20 ? 0.6 : 1,
                      }}
                    />
                  ))}
                  <div
                    className="absolute rounded-full shadow-inner z-10"
                    style={{
                      width: config.petalSize * 0.7,
                      height: config.petalSize * 0.7,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "radial-gradient(circle at 35% 35%, #fcd34d, #f59e0b)",
                    }}
                  />
                </>
              )}

              {stage === "sprout" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                  <div className="w-4 h-8 bg-green-500 rounded-full transform -rotate-12 origin-bottom" />
                  <div className="w-4 h-8 bg-green-500 rounded-full transform rotate-12 origin-bottom" />
                </div>
              )}
            </div>
          </div>

          {/* Stem */}
          <div
            className="w-1.5 bg-gradient-to-b from-green-600 to-green-800 mx-auto rounded-full transition-all duration-1000"
            style={{ height: config.stemHeight, opacity: hydration < 20 ? 0.7 : 1 }}
          />

          {/* Hydration Bar - Horizontal at bottom */}
          <div 
            className={`mt-2 transition-all duration-500 ${
              hydration < 20 ? "animate-pulse scale-110" : ""
            } ${isWatering || hydration < 50 ? "opacity-100" : "opacity-0"}`}
          >
            <div 
              className="w-10 h-1.5 bg-stone-300/40 rounded-full overflow-hidden shadow-inner mx-auto"
              title={`Hydration: ${hydration}%`}
            >
              <div 
                className={`h-full transition-all duration-1000 rounded-full ${
                  hydration > 50 ? "bg-blue-400" : hydration > 20 ? "bg-amber-400" : "bg-rose-400"
                }`}
                style={{ width: `${hydration}%` }}
              />
            </div>
          </div>

          {/* Countdown / Progress Label */}
          <div className="mt-1 w-24 text-center mx-auto">
            {stage === "ready" ? (
              <p className="text-[9px] font-bold tracking-tighter text-amber-600 animate-pulse">
                ✨ REVEAL ME ✨
              </p>
            ) : timeRemaining.isNear ? (
              <p className="text-[9px] font-bold tracking-tighter text-emerald-600 animate-pulse">
                🌟 {formatCountdown(timeRemaining)}
              </p>
            ) : (
              <p className={`text-[9px] font-bold tracking-tighter transition-colors duration-500 ${
                hydration < 20 ? "text-rose-500" : "text-stone-500"
              }`}>
                {formatCountdown(timeRemaining)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Uproot Confirmation Modal */}
      {showUprootConfirm && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowUprootConfirm(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 mx-4 max-w-xs shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                <span className="text-3xl">🥀</span>
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-2">Uproot this flower?</h3>
              <p className="text-sm text-stone-500 mb-6">
                This will permanently remove the flower and its hidden message. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUprootConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-stone-100 text-stone-600 font-bold text-sm active:scale-95 transition-transform"
                >
                  Keep it
                </button>
                <button
                  onClick={handleUproot}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-500 text-white font-bold text-sm active:scale-95 transition-transform"
                >
                  Uproot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}