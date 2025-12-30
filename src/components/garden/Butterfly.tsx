"use client";

import { useEffect, useState, useMemo } from "react";

interface ButterflyProps {
  color: string;
  x: number;
  y: number;
  scale?: number;
  /** When true, x/y are canvas coordinates (pixels). When false, percentages. */
  useCanvasCoords?: boolean;
}

export default function Butterfly({ color, x, y, scale = 1, useCanvasCoords = false }: ButterflyProps) {
  const [mounted, setMounted] = useState(false);
  
  // Randomize flight path and delay
  const animation = useMemo(() => {
    const paths = ["animate-fly-1", "animate-fly-2", "animate-fly-3"];
    return paths[Math.floor(Math.random() * paths.length)];
  }, []);

  const delay = useMemo(() => Math.random() * 2, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className={`absolute z-20 pointer-events-none transition-all duration-[3000ms] ease-in-out ${animation}`}
      style={{ 
        left: useCanvasCoords ? x : `${x}%`, 
        top: useCanvasCoords ? y : `${y}%`,
        animationDelay: `${delay}s`
      }}
    >
      <div 
        className="relative filter drop-shadow-sm" 
        style={{ transform: `scale(${scale})` }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left Wing Group */}
          <g className="animate-flutter-left" style={{ transformOrigin: "16px 16px" }}>
            <path 
              d="M16 16C16 16 6 10 6 6C6 2 13 2 16 10C16 10 9 16 8 22C6 28 15 24 16 16Z" 
              fill={color} 
              fillOpacity="0.9"
            />
            <path 
              d="M16 16C16 16 6 10 6 6C6 2 13 2 16 10" 
              stroke="white" 
              strokeOpacity="0.4" 
              strokeWidth="0.5"
            />
          </g>
          
          {/* Right Wing Group */}
          <g className="animate-flutter-right" style={{ transformOrigin: "16px 16px" }}>
            <path 
              d="M16 16C16 16 26 10 26 6C26 2 19 2 16 10C16 10 23 16 24 22C26 28 17 24 16 16Z" 
              fill={color} 
              fillOpacity="0.9"
            />
            <path 
              d="M16 16C16 16 26 10 26 6C26 2 19 2 16 10" 
              stroke="white" 
              strokeOpacity="0.4" 
              strokeWidth="0.5"
            />
          </g>

          {/* Body */}
          <path 
            d="M16 10C16.8284 10 17.5 10.6716 17.5 11.5V20.5C17.5 21.3284 16.8284 22 16 22C15.1716 22 14.5 21.3284 14.5 20.5V11.5C14.5 10.6716 15.1716 10 16 10Z" 
            fill="#3e2723"
          />
          
          {/* Antennae */}
          <path d="M15 10L12 6" stroke="#3e2723" strokeWidth="1" strokeLinecap="round"/>
          <path d="M17 10L20 6" stroke="#3e2723" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}