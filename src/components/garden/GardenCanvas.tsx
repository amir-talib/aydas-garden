"use client";

import { useState, useCallback, useEffect } from "react";
import { useGarden } from "@/hooks/useGarden";
import { Seed, Memory } from "@/types/garden";
import SeedPouch from "./SeedPouch";
import Flower from "./Flower";
import HarvestModal from "./HarvestModal";
import ControlBar from "./ControlBar";
import Butterfly from "./Butterfly";

type Season = "spring" | "summer" | "fall" | "winter";

export default function GardenCanvas() {
  const {
    seeds,
    plants,
    memories,
    settings,
    plantSeed,
    waterPlant,
    uprootPlant,
    harvestPlant,
  } = useGarden();

  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [harvestedMemory, setHarvestedMemory] = useState<Memory | null>(null);
  const [isPlanting, setIsPlanting] = useState(false);
  
  const [wateringMode, setWateringMode] = useState(false);
  const [uprootMode, setUprootMode] = useState(false);
  const [season, setSeason] = useState<Season>("summer");
  const [isNight, setIsNight] = useState(false);

  // Background butterfly positions
  const [butterflies, setButterflies] = useState<{id: number, x: number, y: number, color: string, scale: number}[]>([]);

  useEffect(() => {
    // Spawn butterflies based on how many healthy plants are in the garden
    const interval = setInterval(() => {
      // Base number of butterflies + more for each plant, capped at 12
      const targetCount = Math.min(3 + Math.ceil(plants.length * 0.8), 12);
      
      setButterflies(prev => {
        if (prev.length === targetCount) return prev;
        
        if (prev.length < targetCount) {
          const newButterflies = [...prev];
          while (newButterflies.length < targetCount) {
            newButterflies.push({
              id: Date.now() + Math.random(),
              x: Math.random() * 90 + 5,
              y: 30 + Math.random() * 35,
              color: ["#f472b6", "#60a5fa", "#facc15", "#a78bfa", "#fb7185", "#2dd4bf"][Math.floor(Math.random() * 6)],
              scale: 0.6 + Math.random() * 0.4
            });
          }
          return newButterflies;
        } else {
          return prev.slice(0, targetCount);
        }
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [plants.length]);

  // Disable other modes when one is active
  const handleWateringToggle = useCallback(() => {
    setWateringMode(prev => !prev);
    setUprootMode(false);
  }, []);

  const handleUprootToggle = useCallback(() => {
    setUprootMode(prev => !prev);
    setWateringMode(false);
  }, []);

  const handleGardenClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (!selectedSeed || isPlanting) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (y < rect.height * 0.35) return;

      setIsPlanting(true);
      try {
        await plantSeed(selectedSeed, { x, y });
        setSelectedSeed(null);
      } finally {
        setIsPlanting(false);
      }
    },
    [selectedSeed, plantSeed, isPlanting]
  );

  const seasonConfig = {
    spring: { sky: "from-sky-200 to-pink-50", ground: "from-green-300 to-green-500" },
    summer: { sky: "from-sky-300 to-blue-100", ground: "from-green-400 to-emerald-600" },
    fall: { sky: "from-amber-100 to-orange-50", ground: "from-orange-400 to-amber-700" },
    winter: { sky: "from-slate-200 to-white", ground: "from-slate-100 to-stone-200" },
  };

  const config = seasonConfig[season];

  return (
    <div 
      className={`fixed inset-0 w-full h-full overflow-hidden touch-none ${isNight ? "brightness-50" : ""}`}
      style={{ transition: "filter 1s ease" }}
      onClick={handleGardenClick}
    >
      {/* Dynamic Background */}
      <div className={`absolute inset-0 h-[35%] bg-gradient-to-b ${config.sky} transition-colors duration-1000`} />
      <div className={`absolute bottom-0 w-full h-[65%] bg-gradient-to-b ${config.ground} transition-colors duration-1000`} />

      {/* Weather Overlay from Admin Settings */}
      {settings.weather === "rainy" && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="absolute w-px h-6 bg-blue-200/40 animate-rain" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }} />
          ))}
        </div>
      )}

      {settings.weather === "misty" && (
        <div className="absolute inset-0 z-10 bg-white/10 backdrop-blur-[1px] pointer-events-none" />
      )}

      {/* Butterflies */}
      {butterflies.map(b => (
        <Butterfly 
          key={b.id} 
          color={b.color} 
          x={b.x} 
          y={b.y} 
          scale={b.scale}
        />
      ))}

      {/* Plants */}
      {plants.map((plant) => (
        <Flower
          key={plant.id}
          plant={plant}
          onWater={() => waterPlant(plant.id)}
          onHarvest={() => harvestPlant(plant).then(m => setHarvestedMemory(m as Memory))}
          onUproot={() => uprootPlant(plant.id)}
          wateringMode={wateringMode}
          uprootMode={uprootMode}
        />
      ))}

      <SeedPouch seeds={seeds} selectedSeed={selectedSeed} onSelect={setSelectedSeed} isPlantingMode={!!selectedSeed} />

      <ControlBar
        wateringMode={wateringMode}
        onWateringToggle={handleWateringToggle}
        uprootMode={uprootMode}
        onUprootToggle={handleUprootToggle}
        season={season}
        onSeasonChange={() => {
          const s: Season[] = ["spring", "summer", "fall", "winter"];
          setSeason(s[(s.indexOf(season) + 1) % 4]);
        }}
        isNight={isNight}
        onNightToggle={() => setIsNight(!isNight)}
        memoryCount={memories.length}
      />

      <HarvestModal memory={harvestedMemory} onClose={() => setHarvestedMemory(null)} />
      
      {/* Audio */}
      <audio id="bg-music" loop src="/wii-theme.mp3" />
    </div>
  );
}