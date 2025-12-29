"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/hooks/useAdmin";
import { useGarden } from "@/hooks/useGarden";
import { SEED_PALETTE, SeedColor, formatDuration, MAX_DURATION_MINUTES } from "@/types/garden";
import FlowerIcon from "@/components/ui/FlowerIcon";

export default function AdminPage() {
  const { createSeed, isCreating, error } = useAdmin();
  const { seeds, plants, memories, settings, updateWeather } = useGarden();

  const [message, setMessage] = useState("");
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [selectedColor, setSelectedColor] = useState<SeedColor>("sunset");
  const [success, setSuccess] = useState(false);

  // Calculate total duration in minutes
  const totalMinutes = days * 24 * 60 + hours * 60 + minutes;
  const isValidDuration = totalMinutes >= 1 && totalMinutes <= MAX_DURATION_MINUTES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidDuration) return;

    const result = await createSeed({ 
      message, 
      durationMinutes: totalMinutes, 
      color: selectedColor 
    });
    
    if (result) {
      setSuccess(true);
      setMessage("");
      setDays(0);
      setHours(1);
      setMinutes(0);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 font-sans allow-scroll">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-stone-400 active:scale-95 transition-transform">← EXIT</Link>
          <h1 className="text-lg font-bold tracking-widest text-stone-800 uppercase">Gardener Console</h1>
          <div className="w-12" />
        </header>

        {/* Garden Atmosphere Control */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Garden Atmosphere</h2>
          <div className="flex gap-2">
            {(["sunny", "rainy", "misty"] as const).map(w => (
              <button
                key={w}
                onClick={() => updateWeather(w)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all active:scale-95 ${
                  settings.weather === w ? "bg-stone-800 text-white" : "bg-stone-50 text-stone-400"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </section>

        {/* Create Seed Form */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Create New Life</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message */}
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block">Hidden Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-24 p-4 bg-stone-50 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 border-none resize-none transition-shadow"
                placeholder="What do you want to say when it blooms?"
                required
              />
            </div>

            {/* Time Picker */}
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase mb-3 block">
                Reveal After: <span className="text-amber-600">{formatDuration(totalMinutes)}</span>
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Days */}
                <div className="bg-stone-50 rounded-xl p-3">
                  <label className="text-[9px] font-bold text-stone-400 uppercase block mb-2 text-center">Days</label>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDays(Math.max(0, days - 1))}
                      className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold active:scale-90 transition-transform"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold text-stone-800 w-8 text-center">{days}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newDays = days + 1;
                        const newTotal = newDays * 24 * 60 + hours * 60 + minutes;
                        if (newTotal <= MAX_DURATION_MINUTES) setDays(newDays);
                      }}
                      className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold active:scale-90 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-stone-50 rounded-xl p-3">
                  <label className="text-[9px] font-bold text-stone-400 uppercase block mb-2 text-center">Hours</label>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHours(Math.max(0, hours - 1))}
                      className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold active:scale-90 transition-transform"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold text-stone-800 w-8 text-center">{hours}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newHours = hours + 1;
                        const newTotal = days * 24 * 60 + newHours * 60 + minutes;
                        if (newTotal <= MAX_DURATION_MINUTES) setHours(newHours);
                      }}
                      className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold active:scale-90 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Minutes */}
                <div className="bg-stone-50 rounded-xl p-3">
                  <label className="text-[9px] font-bold text-stone-400 uppercase block mb-2 text-center">Minutes</label>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMinutes(Math.max(0, minutes - 5))}
                      className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold active:scale-90 transition-transform"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold text-stone-800 w-8 text-center">{minutes}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newMinutes = minutes + 5;
                        const newTotal = days * 24 * 60 + hours * 60 + newMinutes;
                        if (newTotal <= MAX_DURATION_MINUTES) setMinutes(newMinutes);
                      }}
                      className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold active:scale-90 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {[
                  { label: "5m", d: 0, h: 0, m: 5 },
                  { label: "30m", d: 0, h: 0, m: 30 },
                  { label: "1h", d: 0, h: 1, m: 0 },
                  { label: "6h", d: 0, h: 6, m: 0 },
                  { label: "1d", d: 1, h: 0, m: 0 },
                  { label: "3d", d: 3, h: 0, m: 0 },
                  { label: "7d", d: 7, h: 0, m: 0 },
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setDays(preset.d);
                      setHours(preset.h);
                      setMinutes(preset.m);
                    }}
                    className="px-3 py-1.5 bg-stone-100 rounded-lg text-xs font-bold text-stone-500 active:scale-95 transition-transform"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {!isValidDuration && totalMinutes > 0 && (
                <p className="text-rose-500 text-xs mt-2">Maximum duration is 7 days</p>
              )}
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase mb-3 block">Flower Type</label>
              <div className="grid grid-cols-6 gap-2">
                {(Object.entries(SEED_PALETTE) as [SeedColor, typeof SEED_PALETTE[SeedColor]][]).map(([key, data]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedColor(key)}
                    className={`p-2 rounded-xl transition-all active:scale-90 ${
                      selectedColor === key ? "bg-stone-100 ring-2 ring-stone-800 scale-105" : ""
                    }`}
                  >
                    <FlowerIcon color={key} size={32} />
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 mt-2 text-center">
                {SEED_PALETTE[selectedColor].name} — {SEED_PALETTE[selectedColor].meaning}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isCreating || !message.trim() || !isValidDuration}
              className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {isCreating ? "Creating..." : "Plant Seed"}
            </button>

            {success && (
              <p className="text-emerald-600 text-sm text-center font-medium">✓ Seed created successfully!</p>
            )}
            {error && (
              <p className="text-rose-500 text-sm text-center font-medium">{error}</p>
            )}
          </form>
        </section>

        {/* Inventory Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl text-center border border-stone-100">
            <p className="text-xl font-bold">{seeds.length}</p>
            <p className="text-[8px] font-bold text-stone-400 uppercase">Seeds</p>
          </div>
          <div className="bg-white p-4 rounded-2xl text-center border border-stone-100">
            <p className="text-xl font-bold">{plants.length}</p>
            <p className="text-[8px] font-bold text-stone-400 uppercase">Plants</p>
          </div>
          <div className="bg-white p-4 rounded-2xl text-center border border-stone-100">
            <p className="text-xl font-bold">{memories.length}</p>
            <p className="text-[8px] font-bold text-stone-400 uppercase">Memories</p>
          </div>
        </div>
      </div>
    </div>
  );
}