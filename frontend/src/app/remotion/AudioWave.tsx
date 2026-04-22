import {
  AbsoluteFill,
  Audio,
  interpolate,
  useCurrentFrame,
  spring,
} from "remotion";

export default function AudioWave() {
  const frame = useCurrentFrame();

  const wave1 = interpolate(
    Math.sin(frame * 0.08) * 0.5 + 0.5,
    [0, 1],
    [40, 160]
  );

  const wave2 = interpolate(
    Math.sin(frame * 0.08 + 1) * 0.5 + 0.5,
    [0, 1],
    [40, 160]
  );

  const wave3 = interpolate(
    Math.sin(frame * 0.08 + 2) * 0.5 + 0.5,
    [0, 1],
    [40, 160]
  );

  const slices = Array.from({ length: 60 }, (_, i) => {
    const offset = (i - 30) * 0.12;
    const phase = frame * 0.08 + offset;
    const amp = Math.sin(phase) * 0.5 + 0.5;
    return amp;
  });

  return (
    <AbsoluteFill className="bg-black items-center justify-center">
      <Audio
        src="https://commondatastorage.googleapis.com/codeskulptor-demos/DKR_3rd_Opening.mp3"
      />
      <div className="flex h-[200px] items-center gap-[2px]">
        {slices.map((amp, i) => {
          const height = 20 + amp * 160;
          const hue = (i * 6) % 360;
          const opacity = 0.3 + amp * 0.7;
          return (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                height: `${height}px`,
                backgroundColor: `hsla(${hue}, 60%, ${40 + amp * 30}%, ${opacity})`,
              }}
            />
          );
        })}
      </div>
      <div className="mt-16 flex items-center gap-4">
        <div
          className="h-1 w-24 rounded-full"
          style={{
            backgroundColor: `hsl(0, 70%, 50%)`,
            height: `${wave1}px`,
            width: "100px",
          }}
        />
        <div
          className="h-1 w-24 rounded-full"
          style={{
            backgroundColor: `hsl(120, 70%, 50%)`,
            height: `${wave2}px`,
            width: "100px",
          }}
        />
        <div
          className="h-1 w-24 rounded-full"
          style={{
            backgroundColor: `hsl(240, 70%, 50%)`,
            height: `${wave3}px`,
            width: "100px",
          }}
        />
      </div>
    </AbsoluteFill>
  );
}