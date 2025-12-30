"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Seed, Plant, Memory, GardenSettings, Comment } from "@/types/garden";

export function useGarden() {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [settings, setSettings] = useState<GardenSettings>({ weather: "sunny", lastUpdated: Timestamp.now() });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seeds
    const unsubSeeds = onSnapshot(query(collection(db, "seeds"), orderBy("createdAt", "desc")), (snapshot) => {
      setSeeds(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Seed[]);
    });

    // Plants
    const unsubPlants = onSnapshot(query(collection(db, "plants"), orderBy("plantedAt", "asc")), (snapshot) => {
      setPlants(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Plant[]);
      setLoading(false);
    });

    // Memories
    const unsubMemories = onSnapshot(query(collection(db, "memories"), orderBy("harvestedAt", "desc")), (snapshot) => {
      setMemories(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Memory[]);
    });

    // Global Settings (Weather)
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as GardenSettings);
      }
    });

    return () => {
      unsubSeeds();
      unsubPlants();
      unsubMemories();
      unsubSettings();
    };
  }, []);

  const plantSeed = useCallback(async (seed: Seed, position: { x: number; y: number }) => {
    const now = Timestamp.now();
    await addDoc(collection(db, "plants"), {
      seedId: seed.id,
      message: seed.message,
      color: seed.color,
      durationMinutes: seed.durationMinutes,
      position,
      plantedAt: now,
      lastWateredAt: now,
      waterStreak: 1,
    });
    await deleteDoc(doc(db, "seeds", seed.id));
  }, []);

  const waterPlant = useCallback(async (plantId: string) => {
    await updateDoc(doc(db, "plants", plantId), {
      lastWateredAt: Timestamp.now(),
    });
  }, []);

  const updateWeather = useCallback(async (weather: "sunny" | "rainy" | "misty") => {
    await setDoc(doc(db, "settings", "global"), {
      weather,
      lastUpdated: Timestamp.now(),
    });
  }, []);

  /**
   * Uproot (delete) a plant from the garden
   * This permanently removes it without creating a memory
   */
  const uprootPlant = useCallback(async (plantId: string) => {
    await deleteDoc(doc(db, "plants", plantId));
  }, []);

  const harvestPlant = useCallback(async (plant: Plant) => {
    const now = Timestamp.now();
    const memoryData = {
      message: plant.message,
      color: plant.color,
      plantedAt: plant.plantedAt,
      harvestedAt: now,
      durationMinutes: plant.durationMinutes,
      position: plant.position,
    };
    await addDoc(collection(db, "memories"), memoryData);
    await deleteDoc(doc(db, "plants", plant.id));
    return memoryData;
  }, []);

  /**
   * Fetch comments for a specific memory
   */
  const fetchComments = useCallback(async (memoryId: string): Promise<Comment[]> => {
    const commentsRef = collection(db, "memories", memoryId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      memoryId,
      ...d.data(),
    })) as Comment[];
  }, []);

  /**
   * Add a comment to a memory
   */
  const addComment = useCallback(async (memoryId: string, text: string): Promise<Comment> => {
    const commentsRef = collection(db, "memories", memoryId, "comments");
    const commentData = {
      text: text.trim(),
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(commentsRef, commentData);
    return {
      id: docRef.id,
      memoryId,
      text: text.trim(),
      createdAt: commentData.createdAt,
    };
  }, []);

  /**
   * Delete a comment from a memory
   */
  const deleteComment = useCallback(async (memoryId: string, commentId: string) => {
    await deleteDoc(doc(db, "memories", memoryId, "comments", commentId));
  }, []);

  return {
    seeds,
    plants,
    memories,
    settings,
    loading,
    plantSeed,
    waterPlant,
    updateWeather,
    uprootPlant,
    harvestPlant,
    fetchComments,
    addComment,
    deleteComment,
  };
}