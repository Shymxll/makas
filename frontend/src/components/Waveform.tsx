"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import { Play, Pause } from "lucide-react";

interface Region {
  start: number;
  end: number;
  type: "silence" | "removed";
}

interface WaveformProps {
  audioUrl: string;
  color?: string;
  height?: number;
  regions?: Region[];
  showRegions?: boolean;
}

export default function Waveform({ 
  audioUrl, 
  color = "#4F46E5", 
  height = 140,
  regions = [],
  showRegions = false
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const regionsPlugin = RegionsPlugin.create();
    regionsPluginRef.current = regionsPlugin;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: color,
      progressColor: "#818CF8",
      height,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      fillParent: true,
      plugins: [regionsPlugin],
    });

    wavesurferRef.current = wavesurfer;
    wavesurfer.load(audioUrl);

    wavesurfer.on("play", () => setIsPlaying(true));
    wavesurfer.on("pause", () => setIsPlaying(false));
    wavesurfer.on("finish", () => setIsPlaying(false));

    return () => {
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch {}
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl, color, height]);

  const togglePlayback = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  useEffect(() => {
    if (!regionsPluginRef.current || !showRegions) return;

    regionsPluginRef.current.clearRegions();

    regions.forEach((region) => {
      regionsPluginRef.current?.addRegion({
        start: region.start / 1000,
        end: region.end / 1000,
        color: region.type === "removed" 
          ? "rgba(239, 68, 68, 0.3)" 
          : "rgba(251, 191, 36, 0.3)",
        drag: false,
      });
    });
  }, [regions, showRegions]);

  return (
    <div className="flex w-full items-center gap-2">
      <button
        onClick={togglePlayback}
        className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-neutral-700 text-neutral-200 hover:bg-neutral-600 transition-colors"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>
      <div ref={containerRef} className="flex-1 min-h-[140px]" />
    </div>
  );
}