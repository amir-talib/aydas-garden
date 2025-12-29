"use client";

import { SEED_PALETTE, SeedColor } from "@/types/garden";

interface FlowerIconProps {
  color: SeedColor;
  size?: number;
  className?: string;
}

export default function FlowerIcon({ color, size = 48, className = "" }: FlowerIconProps) {
  const palette = SEED_PALETTE[color];
  const hex = palette.hex;
  
  // Darken the color for depth
  const darken = (hex: string, amount: number) => {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
    const b = Math.max(0, (num & 0x0000FF) - amount);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };
  
  const darkHex = darken(hex, 30);
  const lighterHex = hex + "cc";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stem */}
      <path
        d="M24 48V28"
        stroke="#4ade80"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Left Leaf */}
      <ellipse
        cx="20"
        cy="38"
        rx="4"
        ry="2"
        fill="#4ade80"
        transform="rotate(-30 20 38)"
      />
      
      {/* Right Leaf */}
      <ellipse
        cx="28"
        cy="35"
        rx="4"
        ry="2"
        fill="#4ade80"
        transform="rotate(30 28 35)"
      />

      {/* Petals - 8 petals around center */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <ellipse
          key={i}
          cx="24"
          cy="14"
          rx="6"
          ry="10"
          fill={i % 2 === 0 ? hex : lighterHex}
          stroke={darkHex}
          strokeWidth="0.5"
          transform={`rotate(${angle} 24 20)`}
          style={{
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
          }}
        />
      ))}

      {/* Center */}
      <circle
        cx="24"
        cy="20"
        r="6"
        fill="#fbbf24"
        stroke="#f59e0b"
        strokeWidth="1"
      />
      
      {/* Center detail dots */}
      <circle cx="22" cy="18" r="1" fill="#f59e0b" />
      <circle cx="26" cy="18" r="1" fill="#f59e0b" />
      <circle cx="24" cy="22" r="1" fill="#f59e0b" />
    </svg>
  );
}
