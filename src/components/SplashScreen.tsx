"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface SplashScreenProps {
  isLoading: boolean;
  minDisplayTime?: number;
}

export default function SplashScreen({ 
  isLoading, 
  minDisplayTime = 1500 
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Ensure minimum display time for smooth experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  // Start fade out when loading is done AND min time has elapsed
  useEffect(() => {
    if (!isLoading && minTimeElapsed) {
      setIsFading(true);
      // Remove from DOM after fade animation
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLoading, minTimeElapsed]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-600 transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              width: 40 + i * 20,
              height: 40 + i * 20,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main splash content */}
      <div className={`relative z-10 flex flex-col items-center transition-transform duration-500 ${
        isFading ? "scale-110" : "scale-100"
      }`}>
        {/* Logo/Image */}
        <div className="relative w-40 h-40 mb-8 animate-pulse-slow">
          <Image
            src="/splash.png"
            alt="Ayda's Garden"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-bold text-white mb-2 tracking-wide drop-shadow-lg">
          Ayda's Garden
        </h1>
        
        {/* Subtitle */}
        <p className="text-white/80 text-sm font-medium tracking-wider mb-8">
          Where love blooms
        </p>

        {/* Loading indicator */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white/80 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="rgba(255,255,255,0.1)"
          />
        </svg>
      </div>

      {/* Inline animation styles */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
