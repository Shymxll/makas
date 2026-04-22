import { AbsoluteFill, Audio, interpolate, useCurrentFrame } from "remotion";

export default function AudioVisualizer() {
  const frame = useCurrentFrame();

  const bars = Array.from({ length: 40 }, (_, i) => {
    const seed = Math.sin(i * 0.5 + frame * 0.1) * 0.5 + 0.5;
    const height = interpolate(seed, [0, 1], [20, 140]);
    return height;
  });

  return (
    <AbsoluteFill className="bg-neutral-950 items-center justify-center">
      <Audio src="https://commondatastorage.googleapis.com/codeskulptor-demos/DKR_3rd_Opening.mp3" />
      <div className="flex items-end gap-1">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-3 rounded-full"
            style={{
              height: `${height}px`,
              backgroundColor: `hsl(${(i * 9) % 360}, 70%, 60%)`,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}