"use client";

import { useEffect, useRef, useState } from "react";

interface SilenceRegion {
  start: number;
  end: number;
  duration: number;
}

interface SilenceAnalyzerProps {
  audioUrl: string;
  threshold?: number;
  minLen?: number;
}

export default function SilenceAnalyzer({ 
  audioUrl, 
  threshold = -40, 
  minLen = 500 
}: SilenceAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyzing, setAnalyzing] = useState(true);
  const [regions, setRegions] = useState<SilenceRegion[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sampleRate = audioContext.sampleRate;
    const detectedRegions: { start: number; end: number }[] = [];
    
    let isSilent = false;
    let silenceStart = 0;
    const dbThreshold = Math.pow(10, threshold / 20);
    
    const analyze = () => {
      if (!audio.paused) return;
      
      const checkFrame = () => {
        analyser.getByteTimeDomainData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const normalized = (dataArray[i] - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / bufferLength);
        
        if (rms < dbThreshold) {
          if (!isSilent) {
            isSilent = true;
            silenceStart = audio.currentTime;
          }
        } else {
          if (isSilent) {
            const duration = (audio.currentTime - silenceStart) * 1000;
            if (duration >= minLen) {
              detectedRegions.push({
                start: silenceStart,
                end: audio.currentTime,
              });
            }
            isSilent = false;
          }
        }
        
        if (!audio.paused || audio.currentTime < audio.duration) {
          requestAnimationFrame(checkFrame);
        } else {
          setRegions(detectedRegions.map(r => ({
            start: r.start * 1000,
            end: r.end * 1000,
            duration: (r.end - r.start) * 1000,
          })));
          setAnalyzing(false);
          audioContext.close();
        }
      };
      
      audio.play().then(() => {
        checkFrame();
      });
    };

    audio.addEventListener("loadedmetadata", () => {
      analyze();
    });

    return () => {
      audio.pause();
      audioContext.close();
    };
  }, [audioUrl, threshold, minLen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || regions.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const duration = regions[regions.length - 1]?.end || 0;
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(0, 0, width, height);
    
    regions.forEach((region, i) => {
      const startX = (region.start / duration) * width;
      const regionWidth = (region.duration / duration) * width;
      
      const hue = 45;
      const alpha = 0.15 + (i % 3) * 0.05;
      ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
      ctx.fillRect(startX, 0, regionWidth, height);
      
      ctx.strokeStyle = `hsla(${hue}, 70%, 50%, 0.3)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, 0, regionWidth, height);
    });
  }, [regions]);

  const totalSilence = regions.reduce((sum, r) => sum + r.duration, 0);
  const avgDuration = regions.length > 0 ? totalSilence / regions.length : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500 font-mono">SILENCE MAP</span>
        {analyzing && <span className="text-xs text-yellow-500">Analyzing...</span>}
      </div>
      
      <canvas
        ref={canvasRef}
        width={320}
        height={24}
        className="w-full rounded"
      />
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded bg-neutral-800/50 p-2">
          <div className="text-lg font-mono text-neutral-300">{regions.length}</div>
          <div className="text-xs text-neutral-500">Regions</div>
        </div>
        <div className="rounded bg-neutral-800/50 p-2">
          <div className="text-lg font-mono text-neutral-300">{(totalSilence / 1000).toFixed(1)}s</div>
          <div className="text-xs text-neutral-500">Total</div>
        </div>
        <div className="rounded bg-neutral-800/50 p-2">
          <div className="text-lg font-mono text-neutral-300">{(avgDuration / 1000).toFixed(1)}s</div>
          <div className="text-xs text-neutral-500">Average</div>
        </div>
      </div>
    </div>
  );
}