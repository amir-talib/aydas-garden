import { Timestamp } from "firebase/firestore";

/**
 * ============================================
 * GARDEN CANVAS CONFIGURATION
 * ============================================
 * Fixed canvas size for consistent flower positioning across all devices.
 * All flower positions are stored in these "canvas units" and the entire
 * garden is scaled uniformly to fit the viewport.
 */
export const GARDEN_CANVAS = {
  /** Fixed width of the garden canvas in logical pixels */
  WIDTH: 1000,
  /** Fixed height of the garden canvas in logical pixels */
  HEIGHT: 700,
  /** Minimum Y position (top boundary - sky area) as percentage */
  MIN_Y_PERCENT: 0.35,
} as const;

/**
 * ============================================
 * LIFECYCLE STAGES
 * ============================================
 */

export interface Seed {
  id: string;
  message: string;
  /** Duration in minutes until harvest */
  durationMinutes: number;
  color: SeedColor;
  createdAt: Timestamp;
}

export interface Plant {
  id: string;
  seedId: string;
  message: string;
  color: SeedColor;
  /** Duration in minutes until harvest */
  durationMinutes: number;
  position: { x: number; y: number };
  plantedAt: Timestamp;
  lastWateredAt: Timestamp;
  waterStreak: number;
}

export interface GardenSettings {
  weather: "sunny" | "rainy" | "misty";
  lastUpdated: Timestamp;
}

export type GrowthStage = "sprout" | "seedling" | "budding" | "blooming" | "ready";

export interface Memory {
  id: string;
  message: string;
  color: SeedColor;
  plantedAt: Timestamp;
  harvestedAt: Timestamp;
  durationMinutes: number;
  position: { x: number; y: number };
}

export interface Comment {
  id: string;
  memoryId: string;
  text: string;
  createdAt: Timestamp;
}

export const SEED_PALETTE = {
  sunset: { hex: "#e8a87c", name: "Sunset Rose", meaning: "Warmth & comfort" },
  blush: { hex: "#f4a4b8", name: "Blush Peony", meaning: "Tender affection" },
  golden: { hex: "#f5d76e", name: "Golden Dahlia", meaning: "Joy & celebration" },
  sapphire: { hex: "#7eb8da", name: "Sapphire Orchid", meaning: "Deep devotion" },
  lavender: { hex: "#b8a9c9", name: "Lavender Dream", meaning: "Peaceful love" },
  moonlight: { hex: "#f0e6d3", name: "Moonlight Lily", meaning: "Eternal bond" },
} as const;

export type SeedColor = keyof typeof SEED_PALETTE;

/** Maximum duration: 7 days in minutes */
export const MAX_DURATION_MINUTES = 7 * 24 * 60; // 10080 minutes

/**
 * Calculate the hydration level (0-100)
 * Drains fully in 24 hours
 */
export function calculateHydration(lastWateredAt: Timestamp): number {
  const now = Date.now();
  const lastWatered = lastWateredAt.toMillis();
  const msInDay = 24 * 60 * 60 * 1000;
  const elapsed = now - lastWatered;
  
  const hydration = 100 - (elapsed / msInDay) * 100;
  return Math.max(0, Math.min(100, Math.round(hydration)));
}

export function calculateGrowthStage(plant: Plant): GrowthStage {
  const now = Date.now();
  const plantedAt = plant.plantedAt.toMillis();
  const totalGrowthTime = plant.durationMinutes * 60 * 1000; // Convert minutes to ms
  const elapsed = now - plantedAt;
  const progress = Math.min(elapsed / totalGrowthTime, 1);

  if (progress >= 1) return "ready";
  if (progress >= 0.75) return "blooming";
  if (progress >= 0.5) return "budding";
  if (progress >= 0.25) return "seedling";
  return "sprout";
}

export function calculateProgress(plant: Plant): number {
  const now = Date.now();
  const plantedAt = plant.plantedAt.toMillis();
  const totalGrowthTime = plant.durationMinutes * 60 * 1000; // Convert minutes to ms
  const elapsed = now - plantedAt;
  return Math.min(Math.round((elapsed / totalGrowthTime) * 100), 100);
}

/**
 * Calculate remaining time until harvest
 * Returns { days, hours, minutes, seconds, isReady, isNear }
 */
export function calculateTimeRemaining(plant: Plant): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isReady: boolean;
  isNear: boolean;
} {
  const now = Date.now();
  const plantedAt = plant.plantedAt.toMillis();
  const totalGrowthTime = plant.durationMinutes * 60 * 1000;
  const elapsed = now - plantedAt;
  const remaining = Math.max(0, totalGrowthTime - elapsed);

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

  // "Near" = less than 10% of total time remaining OR less than 1 hour
  const isNear = remaining > 0 && (remaining < totalGrowthTime * 0.1 || remaining < 60 * 60 * 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: remaining,
    isReady: remaining === 0,
    isNear,
  };
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);

  return parts.join(" ");
}

/**
 * Format countdown for display
 */
export function formatCountdown(time: ReturnType<typeof calculateTimeRemaining>): string {
  if (time.isReady) return "Ready!";

  if (time.days > 0) {
    return `${time.days}d ${time.hours}h`;
  }
  if (time.hours > 0) {
    return `${time.hours}h ${time.minutes}m`;
  }
  if (time.minutes > 0) {
    return `${time.minutes}m ${time.seconds}s`;
  }
  return `${time.seconds}s`;
}