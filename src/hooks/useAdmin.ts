"use client";

import { useState, useCallback } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SeedColor } from "@/types/garden";
import { MAX_DURATION_MINUTES } from "@/types/garden";

interface CreateSeedParams {
  message: string;
  /** Duration in minutes until harvest */
  durationMinutes: number;
  color: SeedColor;
}

export function useAdmin() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSeed = useCallback(async (params: CreateSeedParams) => {
    setIsCreating(true);
    setError(null);

    // Validate duration
    if (params.durationMinutes < 1) {
      setError("Duration must be at least 1 minute");
      setIsCreating(false);
      return false;
    }

    if (params.durationMinutes > MAX_DURATION_MINUTES) {
      setError("Duration cannot exceed 7 days");
      setIsCreating(false);
      return false;
    }

    try {
      await addDoc(collection(db, "seeds"), {
        message: params.message,
        durationMinutes: params.durationMinutes,
        color: params.color,
        createdAt: Timestamp.now(),
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create seed");
      return false;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    createSeed,
    isCreating,
    error,
  };
}