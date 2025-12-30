"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useGarden } from "@/hooks/useGarden";
import { Seed, Memory, GARDEN_CANVAS } from "@/types/garden";
import SeedPouch from "./SeedPouch";
import Flower from "./Flower";
import HarvestModal from "./HarvestModal";
import ControlBar from "./ControlBar";
import Butterfly from "./Butterfly";
import SplashScreen from "./SplashScreen";

type Season = "spring" | "summer" | "fall" | "winter";

/**
 * Custom hook to calculate the scale and offset needed to fit
 * the fixed canvas into the viewport while maintaining aspect ratio
 */
function useCanvasScale() {
  const [dimensions, setDimensions] = useState({ 
    scale: 1, 
    offsetX: 0, 
    offsetY: 0 
  });

  useEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate scale to fit canvas in viewport (cover mode - fills viewport)
      const scaleX = viewportWidth / GARDEN_CANVAS.WIDTH;
      const scaleY = viewportHeight / GARDEN_CANVAS.HEIGHT;
      
      // Use the larger scale to ensure the canvas covers the entire viewport
      // This means some parts might be cropped, but the garden fills the screen
      const scale = Math.max(scaleX, scaleY);
      
      // Calculate offset to center the scaled canvas
      const scaledWidth = GARDEN_CANVAS.WIDTH * scale;
      const scaledHeight = GARDEN_CANVAS.HEIGHT * scale;
      const offsetX = (viewportWidth - scaledWidth) / 2;
      const offsetY = (viewportHeight - scaledHeight) / 2;
      
      setDimensions({ scale, offsetX, offsetY });
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return dimensions;
}

export default function GardenCanvas() {
  const {
    seeds,
    plants,
    memories,
    settings,
    loading,
    plantSeed,
    waterPlant,
    uprootPlant,
    harvestPlant,
  } = useGarden();

  const canvasRef = useRef<HTMLDivElement>(null);
  const { scale, offsetX, offsetY } = useCanvasScale();

  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const [harvestedMemory, setHarvestedMemory] = useState<Memory | null>(null);
  const [isPlanting, setIsPlanting] = useState(false);
  
  const [wateringMode, setWateringMode] = useState(false);
  const [uprootMode, setUprootMode] = useState(false);
  const [season, setSeason] = useState<Season>("summer");
  const [isNight, setIsNight] = useState(false);
  const [rainDrops, setRainDrops] = useState<{ left: string; delay: string }[]>([]);

  // Initialize rain drops only on client to avoid hydration mismatch
  useEffect(() => {
    if (settings.weather === "rainy") {
      setRainDrops(
        Array.from({ length: 40 }).map(() => ({
          left: `${Math.random() * 100}%`,
          delay: `${Math.random() * 2}s`,
        }))
      );
    }
  }, [settings.weather]);

  // Background butterfly positions (stored as canvas coordinates)
  const [butterflies, setButterflies] = useState<{id: number, x: number, y: number, color: string, scale: number}[]>([]);

  useEffect(() => {
    // Spawn butterflies based on how many healthy plants are in the garden
    const interval = setInterval(() => {
      const targetCount = Math.min(3 + Math.ceil(plants.length * 0.8), 12);
      
      setButterflies(prev => {
        if (prev.length === targetCount) return prev;
        
        if (prev.length < targetCount) {
          const newButterflies = [...prev];
          while (newButterflies.length < targetCount) {
            // Butterflies in canvas coordinates (Portrait-first: 500x900)
            newButterflies.push({
              id: Date.now() + Math.random(),
              x: 50 + (Math.random() * 400), // 50-450 in canvas coords
              y: 100 + (Math.random() * 250), // 100-350 in canvas coords (sky area)
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

  /**
   * Convert viewport click coordinates to canvas coordinates
   */
  const handleGardenClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (!selectedSeed || isPlanting) return;
      
      // Get click position relative to viewport
      const viewportX = e.clientX;
      const viewportY = e.clientY;
      
      // Convert to canvas coordinates:
      // 1. Subtract the offset (where the scaled canvas starts)
      // 2. Divide by scale to get canvas coordinates
      let canvasX = (viewportX - offsetX) / scale;
      let canvasY = (viewportY - offsetY) / scale;
      
      // Enforce Safe Zones for planting
      // Horizontal padding
      const minX = GARDEN_CANVAS.WIDTH * GARDEN_CANVAS.SAFE_X_PERCENT;
      const maxX = GARDEN_CANVAS.WIDTH * (1 - GARDEN_CANVAS.SAFE_X_PERCENT);
      canvasX = Math.max(minX, Math.min(maxX, canvasX));

      // Vertical padding (Sky boundary and Bottom UI boundary)
      const minY = GARDEN_CANVAS.HEIGHT * GARDEN_CANVAS.MIN_Y_PERCENT;
      const maxY = GARDEN_CANVAS.HEIGHT * GARDEN_CANVAS.MAX_Y_PERCENT;
      canvasY = Math.max(minY, Math.min(maxY, canvasY));

      setIsPlanting(true);
      try {
        // Store position in canvas coordinates (not percentages, not pixels)
        await plantSeed(selectedSeed, { x: canvasX, y: canvasY });
        setSelectedSeed(null);
      } finally {
        setIsPlanting(false);
      }
    },
    [selectedSeed, plantSeed, isPlanting, scale, offsetX, offsetY]
  );

  const seasonConfig = {
    spring: { sky: "from-sky-200 to-pink-50", ground: "from-green-300 to-green-500" },
    summer: { sky: "from-sky-300 to-blue-100", ground: "from-green-400 to-emerald-600" },
    fall: { sky: "from-amber-100 to-orange-50", ground: "from-orange-400 to-amber-700" },
    winter: { sky: "from-slate-200 to-white", ground: "from-slate-100 to-stone-200" },
  };

  const config = seasonConfig[season];

  return (
    <>
      {/* Splash Screen */}
      <SplashScreen isLoading={loading} minDisplayTime={1800} />
      
      {/* Viewport container - clips the scaled canvas */}
      <div 
        className={`fixed inset-0 w-full h-full overflow-hidden touch-none ${isNight ? "brightness-50" : ""}`}
        style={{ transition: "filter 1s ease" }}
        onClick={handleGardenClick}
      >
        {/* 
          Fixed-size Garden Canvas
          This div is always GARDEN_CANVAS.WIDTH x GARDEN_CANVAS.HEIGHT
          and is scaled/positioned to fill the viewport
        */}
        <div
          ref={canvasRef}
          className="absolute origin-top-left"
          style={{
            width: GARDEN_CANVAS.WIDTH,
            height: GARDEN_CANVAS.HEIGHT,
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
          }}
        >
          {/* Dynamic Background */}
          <div 
            className={`absolute inset-0 bg-gradient-to-b ${config.sky} transition-colors duration-1000`}
            style={{ height: '35%' }}
          />
          <div 
            className={`absolute bottom-0 w-full bg-gradient-to-b ${config.ground} transition-colors duration-1000`}
            style={{ height: '65%' }}
          />

          {/* Weather Overlay from Admin Settings */}
          {settings.weather === "rainy" && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
              {rainDrops.map((drop, i) => (
                <div 
                  key={i} 
                  className="absolute w-px h-6 bg-blue-200/40 animate-rain" 
                  style={{ 
                    left: drop.left, 
                    animationDelay: drop.delay 
                  }} 
                />
              ))}
            </div>
          )}

          {settings.weather === "misty" && (
            <div className="absolute inset-0 z-10 bg-white/10 backdrop-blur-[1px] pointer-events-none" />
          )}

          {/* Butterflies - positioned in canvas coordinates */}
          {butterflies.map(b => (
            <Butterfly 
              key={b.id} 
              color={b.color} 
              x={b.x} 
              y={b.y} 
              scale={b.scale}
              useCanvasCoords={true}
            />
          ))}

          {/* Plants - positioned in canvas coordinates */}
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
        </div>

        {/* UI Overlays - these stay fixed to viewport, not scaled with canvas */}
        <SeedPouch 
          seeds={seeds} 
          selectedSeed={selectedSeed} 
          onSelect={setSelectedSeed} 
          isPlantingMode={!!selectedSeed} 
        />

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
    </>
  );
}
