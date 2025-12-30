"use client";

import { useState, useEffect } from "react";

interface SplashScreenProps {
  isLoading: boolean;
  onComplete: () => void;
}

export default function SplashScreen({ isLoading, onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<"entering" | "visible" | "exiting" | "hidden">("entering");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Entrance animation
    const enterTimer = setTimeout(() => setStage("visible"), 100);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    // Simulate progress while loading
    if (isLoading && progress < 90) {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isLoading, progress]);

  useEffect(() => {
    // When loading completes, finish progress and exit
    if (!isLoading && stage === "visible") {
      setProgress(100);
      const exitTimer = setTimeout(() => {
        setStage("exiting");
        setTimeout(() => {
          setStage("hidden");
          onComplete();
        }, 800);
      }, 400);
      return () => clearTimeout(exitTimer);
    }
  }, [isLoading, stage, onComplete]);

  if (stage === "hidden") return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center transition-all duration-700 ${
        stage === "entering" ? "opacity-0" : 
        stage === "exiting" ? "opacity-0 scale-110" : 
        "opacity-100"
      }`}
      style={{
        background: "linear-gradient(to bottom, #bae6fd 0%, #fef3c7 50%, #86efac 100%)",
      }}
    >
      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-40"
            style={{
              width: 8 + Math.random() * 16,
              height: 8 + Math.random() * 16,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ["#f9a8d4", "#fcd34d", "#86efac", "#a5b4fc", "#fca5a5"][i % 5],
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div 
        className={`relative flex flex-col items-center transition-all duration-700 delay-200 ${
          stage === "entering" ? "opacity-0 translate-y-8" : 
          stage === "exiting" ? "opacity-0 -translate-y-8" :
          "opacity-100 translate-y-0"
        }`}
      >
        {/* Animated Flower Logo */}
        <div className="relative mb-8">
          {/* Glow */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl animate-pulse"
            style={{ 
              background: "radial-gradient(circle, #fcd34d60 0%, transparent 70%)",
              transform: "scale(2)",
            }}
          />
          
          {/* Flower */}
          <div className="relative w-32 h-32">
            {/* Petals */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 rounded-full"
                style={{
                  background: ["#f9a8d4", "#fcd34d", "#86efac", "#a5b4fc"][i % 4],
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-28px)`,
                  animation: `petal-bloom 0.6s ease-out ${i * 0.08}s both`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
            ))}
            {/* Center */}
            <div
              className="absolute w-10 h-10 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                background: "radial-gradient(circle at 35% 35%, #fef3c7, #fbbf24)",
                boxShadow: "0 4px 16px rgba(251, 191, 36, 0.4)",
                animation: "center-pulse 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h1 
          className="font-serif text-4xl font-bold text-stone-800 mb-2 tracking-wide"
          style={{
            textShadow: "0 2px 10px rgba(255,255,255,0.8)",
          }}
        >
          Ayda's Garden
        </h1>

        {/* Subtitle */}
        <p className="text-stone-600 text-sm font-medium mb-8 tracking-wider">
          Where love blooms
        </p>

        {/* Progress Bar */}
        <div className="w-48 h-1.5 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #f9a8d4, #fcd34d, #86efac)",
            }}
          />
        </div>

        {/* Loading text */}
        <p className="text-stone-500 text-xs mt-3 tracking-wider animate-pulse">
          {progress < 100 ? "Growing your garden..." : "Ready!"}
        </p>
      </div>

      {/* Inline keyframes */}
      <style jsx>{`
        @keyframes petal-bloom {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(0) scale(0);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(-28px) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes center-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
