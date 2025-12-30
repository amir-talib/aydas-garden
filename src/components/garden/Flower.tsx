"use client";

import { useState, useEffect, useRef } from "react";
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
  const [isBloomingNow, setIsBloomingNow] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  
  const previousStageRef = useRef<GrowthStage | null>(null);

  const stage = calculateGrowthStage(plant);
  const hydration = calculateHydration(plant.lastWateredAt);
  const progress = calculateProgress(plant);
  const palette = SEED_PALETTE[plant.color];

  // Position handling for fixed canvas system (500x900 canvas)
  // We handle three eras of positioning:
  // 1. Percentage (0-100)
  // 2. Original Fixed Canvas (1000x700)
  // 3. New Portrait Fixed Canvas (500x900)
  
  let positionX = plant.position.x;
  let positionY = plant.position.y;

  const isPercentage = plant.position.x <= 100 && plant.position.y <= 100;
  const isOldCanvas = !isPercentage && (plant.position.x > 500 || plant.position.y < 350); // Old canvas was 1000x700

  if (isPercentage) {
    positionX = (plant.position.x / 100) * 500;
    positionY = (plant.position.y / 100) * 900;
  } else if (isOldCanvas) {
    // Convert from 1000x700 to 500x900
    positionX = (plant.position.x / 1000) * 500;
    positionY = (plant.position.y / 700) * 900;
  }

  // Update countdown every second and detect stage changes
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(plant));
      
      // Check for real-time stage transition to "ready"
      const currentStage = calculateGrowthStage(plant);
      if (previousStageRef.current !== null && 
          previousStageRef.current !== "ready" && 
          currentStage === "ready") {
        // Flower just became ready - trigger bloom animation!
        triggerBloomAnimation();
      }
      previousStageRef.current = currentStage;
    }, 1000);
    
    // Initialize previous stage
    if (previousStageRef.current === null) {
      previousStageRef.current = stage;
    }
    
    return () => clearInterval(interval);
  }, [plant, stage]);

  // Trigger bloom animation sequence
  const triggerBloomAnimation = () => {
    setIsBloomingNow(true);
    setShowSparkles(true);
    
    // End bloom animation after 3 seconds
    setTimeout(() => setIsBloomingNow(false), 3000);
    // Keep sparkles for longer
    setTimeout(() => setShowSparkles(false), 5000);
  };

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

  const stageConfig: Record<GrowthStage, { scale: number; stemHeight: number; petalSize: number; stemWidth: number }> = {
    sprout: { scale: 0.6, stemHeight: 25, petalSize: 0, stemWidth: 3 },
    seedling: { scale: 0.75, stemHeight: 40, petalSize: 12, stemWidth: 4 },
    budding: { scale: 0.9, stemHeight: 55, petalSize: 16, stemWidth: 5 },
    blooming: { scale: 1.05, stemHeight: 70, petalSize: 20, stemWidth: 5 },
    ready: { scale: 1.2, stemHeight: 85, petalSize: 24, stemWidth: 6 },
  };

  const config = stageConfig[stage];
  const isReady = stage === "ready";
  const [sparkleList, setSparkleList] = useState<{ id: number; angle: number; distance: number; delay: number; size: number }[]>([]);

  // Generate sparkle positions only on client to avoid hydration mismatch
  useEffect(() => {
    if (showSparkles || isReady) {
      setSparkleList(
        Array.from({ length: 8 }).map((_, i) => ({
          id: i,
          angle: (i * 45) + Math.random() * 20,
          distance: 40 + Math.random() * 30,
          delay: i * 0.1,
          size: 4 + Math.random() * 4,
        }))
      );
    }
  }, [showSparkles, isReady]);

  return (
    <>
      <div
        className={`absolute select-none transition-all duration-500 ease-out ${
          isUprooting ? "opacity-0 translate-y-8 scale-75" : ""
        } ${uprootMode ? "animate-pulse" : ""}`}
        style={{
          left: positionX,
          top: positionY,
          transform: `translate(-50%, -100%) scale(${config.scale})`,
          // z-index based on vertical position (flowers lower on screen appear in front)
          zIndex: Math.floor(positionY),
        }}
        onClick={handleClick}
      >
        {/* Watering Can Overlay */}
        {isWatering && (
          <WateringCan onComplete={() => setIsWatering(false)} />
        )}

        {/* Ready Glow Aura */}
        {isReady && (
          <div 
            className="absolute inset-0 -m-8 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${palette.hex}40 0%, transparent 70%)`,
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />
        )}

        {/* Sparkles for bloom animation */}
        {(showSparkles || isReady) && (
          <div className="absolute inset-0 pointer-events-none">
            {sparkleList.map((sparkle) => (
              <div
                key={sparkle.id}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `rotate(${sparkle.angle}deg) translateY(-${sparkle.distance}px)`,
                  animation: isBloomingNow 
                    ? `sparkle-burst 1s ease-out ${sparkle.delay}s both`
                    : `sparkle-float 3s ease-in-out ${sparkle.delay}s infinite`,
                }}
              >
                <div 
                  className="rounded-full"
                  style={{
                    width: sparkle.size,
                    height: sparkle.size,
                    background: `linear-gradient(135deg, #fef3c7, ${palette.hex})`,
                    boxShadow: `0 0 ${sparkle.size * 2}px ${palette.hex}80`,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Uproot Mode Indicator */}
        {uprootMode && !showUprootConfirm && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            TAP TO UPROOT
          </div>
        )}

        {/* Flower Content Group (Bounces when happy or blooming) */}
        <div className={`relative transition-transform ${
          isHappy ? "animate-bounce-happy" : ""
        } ${isBloomingNow ? "animate-bloom-celebrate" : ""}`}>
          {/* Flower Head */}
          <div 
            className={`relative transition-transform duration-1000 origin-bottom ${
              isReady ? "animate-gentle-sway" : ""
            }`}
            style={{ transform: `rotate(${droopAngle}deg)` }}
          >
            <div style={{ width: 80, height: 80 }} className="relative">
              {stage !== "sprout" && (
                <>
                  {/* Petals */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <div
                      key={i}
                      className={`absolute rounded-full shadow-sm transition-all duration-500 ${
                        isReady ? "animate-petal-glow" : ""
                      }`}
                      style={{
                        width: config.petalSize,
                        height: config.petalSize,
                        backgroundColor: palette.hex,
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${config.petalSize + 6}px)`,
                        opacity: hydration < 20 ? 0.6 : 1,
                        boxShadow: isReady ? `0 0 12px ${palette.hex}60` : undefined,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                  {/* Center */}
                  <div
                    className={`absolute rounded-full shadow-inner z-10 ${isReady ? "animate-center-pulse" : ""}`}
                    style={{
                      width: config.petalSize * 0.6,
                      height: config.petalSize * 0.6,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      background: isReady 
                        ? "radial-gradient(circle at 35% 35%, #fef3c7, #fbbf24)"
                        : "radial-gradient(circle at 35% 35%, #fcd34d, #f59e0b)",
                      boxShadow: isReady ? "0 0 20px #fbbf2480" : undefined,
                    }}
                  />
                </>
              )}

              {stage === "sprout" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
                  <div className="w-5 h-12 bg-gradient-to-t from-green-600 to-green-400 rounded-full transform -rotate-15 origin-bottom shadow-sm" />
                  <div className="w-5 h-12 bg-gradient-to-t from-green-600 to-green-400 rounded-full transform rotate-15 origin-bottom shadow-sm" />
                </div>
              )}
            </div>
          </div>

          {/* Stem */}
          <div
            className="bg-gradient-to-b from-green-600 to-green-800 mx-auto rounded-full transition-all duration-1000"
            style={{ 
              height: config.stemHeight, 
              width: config.stemWidth,
              opacity: hydration < 20 ? 0.7 : 1 
            }}
          />

          {/* Hydration Bar - Horizontal at bottom */}
          <div 
            className={`mt-2 transition-all duration-500 ${
              hydration < 20 ? "animate-pulse scale-110" : ""
            } ${isWatering || hydration < 50 ? "opacity-100" : "opacity-0"} ${isReady ? "!opacity-0" : ""}`}
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
            {isReady ? (
              <div className="relative">
                <p 
                  className="text-[10px] font-bold tracking-tight animate-shimmer-text"
                  style={{
                    background: `linear-gradient(90deg, #f59e0b, ${palette.hex}, #f59e0b)`,
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ✨ TAP TO REVEAL ✨
                </p>
              </div>
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

      {/* Inline styles for animations */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        
        @keyframes sparkle-burst {
          0% { transform: rotate(var(--angle, 0deg)) translateY(0) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: rotate(var(--angle, 0deg)) translateY(-80px) scale(1.5); opacity: 0; }
        }
        
        @keyframes sparkle-float {
          0%, 100% { transform: rotate(var(--angle, 0deg)) translateY(var(--distance, -50px)) scale(1); opacity: 0.7; }
          50% { transform: rotate(var(--angle, 0deg)) translateY(calc(var(--distance, -50px) - 10px)) scale(1.2); opacity: 1; }
        }
        
        @keyframes bloom-celebrate {
          0% { transform: scale(1); }
          25% { transform: scale(1.15) rotate(-2deg); }
          50% { transform: scale(1.2) rotate(2deg); }
          75% { transform: scale(1.1) rotate(-1deg); }
          100% { transform: scale(1); }
        }
        
        @keyframes gentle-sway {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
        
        @keyframes petal-glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        
        @keyframes center-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        
        @keyframes shimmer-text {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-bloom-celebrate {
          animation: bloom-celebrate 1s ease-out;
        }
        
        .animate-gentle-sway {
          animation: gentle-sway 4s ease-in-out infinite;
        }
        
        .animate-petal-glow {
          animation: petal-glow 2s ease-in-out infinite;
        }
        
        .animate-center-pulse {
          animation: center-pulse 1.5s ease-in-out infinite;
        }
        
        .animate-shimmer-text {
          animation: shimmer-text 2s linear infinite;
        }
      `}</style>
    </>
  );
}
