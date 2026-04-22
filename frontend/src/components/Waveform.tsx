"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";

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
  height = 100,
  regions = [],
  showRegions = false
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<RegionsPlugin | null>(null);

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
      plugins: [regionsPlugin],
    });

    wavesurferRef.current = wavesurfer;
    wavesurfer.load(audioUrl);

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl, color, height]);

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

  return <div ref={containerRef} className="w-full" />;
}