"use client";

import { useState, useEffect } from "react";

interface SplashScreenProps {
  isLoading: boolean;
  minDisplayTime?: number;
}

export default function SplashScreen({ isLoading, minDisplayTime = 1500 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Check last active time on mount
  useEffect(() => {
    const lastActive = localStorage.getItem("garden_last_active");
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (lastActive && now - parseInt(lastActive) < fiveMinutes) {
      setIsVisible(false);
    }

    // Update last active time when user leaves or closes app
    const updateLastActive = () => {
      localStorage.setItem("garden_last_active", Date.now().toString());
    };

    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        updateLastActive();
      }
    });

    window.addEventListener("beforeunload", updateLastActive);

    return () => {
      window.removeEventListener("visibilitychange", updateLastActive);
      window.removeEventListener("beforeunload", updateLastActive);
    };
  }, []);

  // Minimum display timer
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => setMinTimeElapsed(true), minDisplayTime);
    return () => clearTimeout(timer);
  }, [minDisplayTime, isVisible]);

  // Simulate progress
  useEffect(() => {
    if (progress < 90) {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 12, 90));
      }, 150);
      return () => clearInterval(interval);
    }
  }, [progress]);

  // Exit when both loading is done and min time has elapsed
  useEffect(() => {
    if (!isLoading && minTimeElapsed && !isExiting) {
      setProgress(100);
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => setIsVisible(false), 700);
      }, 300);
    }
  }, [isLoading, minTimeElapsed, isExiting]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center transition-all duration-700 ${
        isExiting ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{
        background: "linear-gradient(165deg, #bae6fd 0%, #fef3c7 40%, #bbf7d0 100%)",
      }}
    >
      {/* Soft floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 6 + Math.random() * 14,
              height: 6 + Math.random() * 14,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ["#f9a8d4", "#fcd34d", "#86efac", "#a5b4fc", "#fca5a5"][i % 5],
              opacity: 0.3,
              animation: `splash-float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center">
        {/* Animated Flower Logo */}
        <div className="relative mb-10">
          {/* Ambient glow */}
          <div 
            className="absolute inset-0 rounded-full blur-3xl"
            style={{ 
              background: "radial-gradient(circle, #fcd34d50 0%, transparent 70%)",
              transform: "scale(2.5)",
              animation: "splash-glow 3s ease-in-out infinite",
            }}
          />
          
          {/* Flower container */}
          <div className="relative w-36 h-36">
            {/* Petals with staggered bloom animation */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <div
                key={i}
                className="absolute w-9 h-9 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${["#fda4af", "#fdba74", "#a5b4fc", "#86efac"][i % 4]} 0%, ${["#fb7185", "#f97316", "#818cf8", "#22c55e"][i % 4]} 100%)`,
                  left: "50%",
                  top: "50%",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1), inset 0 -2px 10px rgba(255,255,255,0.3)",
                  animation: `splash-petal-bloom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.06}s both`,
                  ["--angle" as string]: `${angle}deg`,
                }}
              />
            ))}
            
            {/* Golden center */}
            <div
              className="absolute w-12 h-12 rounded-full left-1/2 top-1/2 z-10"
              style={{
                background: "radial-gradient(circle at 30% 30%, #fef3c7, #fbbf24)",
                boxShadow: "0 4px 20px rgba(251, 191, 36, 0.5), inset 0 -4px 12px rgba(245, 158, 11, 0.3)",
                transform: "translate(-50%, -50%)",
                animation: "splash-center-pulse 2.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h1 
          className="font-serif text-4xl font-bold text-stone-800 mb-3 tracking-wide"
          style={{
            textShadow: "0 2px 20px rgba(255,255,255,0.9)",
            animation: "splash-fade-up 0.8s ease-out 0.3s both",
          }}
        >
          Ayda's Garden
        </h1>

        {/* Tagline */}
        <p 
          className="text-stone-600/80 text-sm font-medium mb-10 tracking-widest uppercase"
          style={{ animation: "splash-fade-up 0.8s ease-out 0.5s both" }}
        >
          Where love blooms
        </p>

        {/* Progress Bar */}
        <div 
          className="w-52 h-1.5 bg-white/60 rounded-full overflow-hidden backdrop-blur-sm shadow-inner"
          style={{ animation: "splash-fade-up 0.8s ease-out 0.6s both" }}
        >
          <div
            className="h-full rounded-full transition-all duration-200 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #f472b6, #fbbf24, #22c55e)",
              boxShadow: "0 0 10px rgba(251, 191, 36, 0.5)",
            }}
          />
        </div>

        {/* Loading text */}
        <p 
          className="text-stone-500/70 text-xs mt-4 tracking-wider font-medium"
          style={{ animation: "splash-fade-up 0.8s ease-out 0.7s both" }}
        >
          {progress < 100 ? "Preparing your garden..." : "Welcome back ✨"}
        </p>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes splash-petal-bloom {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(0);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-32px) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes splash-center-pulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 4px 20px rgba(251, 191, 36, 0.5), inset 0 -4px 12px rgba(245, 158, 11, 0.3);
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.08);
            box-shadow: 0 4px 30px rgba(251, 191, 36, 0.7), inset 0 -4px 12px rgba(245, 158, 11, 0.3);
          }
        }

        @keyframes splash-float {
          0%, 100% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 0.3; 
          }
          50% { 
            transform: translateY(-25px) rotate(180deg); 
            opacity: 0.5; 
          }
        }

        @keyframes splash-glow {
          0%, 100% { opacity: 0.5; transform: scale(2.5); }
          50% { opacity: 0.8; transform: scale(2.8); }
        }

        @keyframes splash-fade-up {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
