"use client";

import { useEffect, useRef } from "react";

interface VolumeMeterProps {
  audioUrl: string;
  height?: number;
}

export default function VolumeMeter({ audioUrl, height = 8 }: VolumeMeterProps) {
  const containerRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyserRef.current = analyser;

    const canvas = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current || !ctx) return;

      animationRef.current = requestAnimationFrame(draw);

      analyserRef.current.getByteFrequencyData(dataArray);

      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      const normalized = avg / 255;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 24;
      const barWidth = (canvas.width / barCount) - 2;
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex] / 255;
        const barHeight = value * canvas.height;
        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        const hue = normalized > 0.7 ? 0 : normalized > 0.4 ? 45 : 120;
        ctx.fillStyle = `hsl(${hue}, 70%, ${50 + normalized * 20}%)`;
        
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    };

    draw();

    audio.play().catch(() => {});

    return () => {
      cancelAnimationFrame(animationRef.current);
      audio.pause();
      audioContext.close();
    };
  }, [audioUrl]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500 font-mono">LEVEL</span>
      </div>
      <canvas
        ref={containerRef}
        width={280}
        height={height}
        className="w-full rounded"
      />
    </div>
  );
}