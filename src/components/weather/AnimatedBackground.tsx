/**
 * Full-screen animated background driven by the current weather scene.
 * Purely decorative: hidden from assistive tech and cheap to render
 * (transforms only, elements generated once per scene).
 */
import { useMemo } from "react";
import type { Scene } from "@/lib/weather-utils";

const GRADIENTS: Record<Scene, string> = {
  sunny: "from-Sky-300 via-cyan-200 to-amber-100 dark:from-Sky-900 dark:via-slate-800 dark:to-indigo-950",
  cloudy: "from-slate-300 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950",
  rain: "from-slate-400 via-Sky-300 to-slate-200 dark:from-slate-900 dark:via-Sky-950 dark:to-slate-950",
  snow: "from-slate-200 via-Sky-100 to-white dark:from-slate-800 dark:via-slate-900 dark:to-indigo-950",
  thunder: "from-slate-500 via-indigo-300 to-slate-300 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900",
  night: "from-indigo-900 via-slate-900 to-black",
  mist: "from-slate-300 via-slate-200 to-stone-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950",
};

/** Deterministic pseudo-random so SSR and hydration agree. */
function seeded(i: number, salt = 1) {
  const x = Math.sin((i + 1) * 12.9898 * salt) * 43758.5453;
  return x - Math.floor(x);
}

export function AnimatedBackground({ scene }: { scene: Scene }) {
  const drops = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: seeded(i) * 100,
        delay: seeded(i, 2) * 4,
        duration: 0.7 + seeded(i, 3) * 0.9,
        height: 12 + seeded(i, 4) * 22,
      })),
    [],
  );

  const flakes = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        left: seeded(i, 5) * 100,
        delay: seeded(i, 6) * 8,
        duration: 6 + seeded(i, 7) * 8,
        size: 3 + seeded(i, 8) * 6,
      })),
    [],
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: seeded(i, 9) * 100,
        top: seeded(i, 10) * 70,
        delay: seeded(i, 11) * 4,
        size: 1 + seeded(i, 12) * 2.2,
      })),
    [],
  );

  const clouds = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        top: 6 + seeded(i, 13) * 45,
        delay: -seeded(i, 14) * 60,
        duration: 55 + seeded(i, 15) * 60,
        scale: 0.6 + seeded(i, 16) * 0.9,
      })),
    [],
  );

  const showClouds = scene === "cloudy" || scene === "rain" || scene === "thunder" || scene === "mist";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${GRADIENTS[scene]}`} />

      {/* Sun */}
      {scene === "sunny" && (
        <div className="absolute -right-16 -top-16 h-80 w-80">
          <div
            className="absolute inset-0 rounded-full bg-amber-300/70 blur-2xl"
            style={{ animation: "wx-pulse-sun 6s ease-in-out infinite" }}
          />
          <div
            className="absolute inset-10 rounded-full bg-gradient-to-br from-yellow-200 to-amber-400 shadow-[0_0_120px_40px_rgba(251,191,36,0.45)]"
            style={{ animation: "wx-spin 90s linear infinite" }}
          />
        </div>
      )}

      {/* Moon + stars */}
      {scene === "night" && (
        <>
          {stars.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                height: s.size,
                animation: `wx-twinkle ${2 + (i % 4)}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
          <div
            className="absolute right-16 top-14 h-32 w-32 rounded-full bg-gradient-to-br from-slate-100 to-slate-300 shadow-[0_0_90px_25px_rgba(226,232,240,0.35)]"
            style={{ animation: "wx-pulse-sun 10s ease-in-out infinite" }}
          >
            <span className="absolute left-6 top-8 h-5 w-5 rounded-full bg-slate-400/40" />
            <span className="absolute left-16 top-16 h-8 w-8 rounded-full bg-slate-400/30" />
            <span className="absolute left-9 top-20 h-3 w-3 rounded-full bg-slate-400/40" />
          </div>
        </>
      )}

      {/* Drifting clouds */}
      {showClouds &&
        clouds.map((c, i) => (
          <div
            key={i}
            className="absolute h-24 w-64 rounded-full bg-white/50 blur-2xl dark:bg-white/10"
            style={{
              top: `${c.top}%`,
              transform: `scale(${c.scale})`,
              animation: `wx-drift ${c.duration}s linear ${c.delay}s infinite`,
            }}
          />
        ))}

      {/* Rain */}
      {(scene === "rain" || scene === "thunder") &&
        drops.map((d, i) => (
          <span
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-sky-100/80 to-sky-200/90"
            style={{
              left: `${d.left}%`,
              height: d.height,
              animation: `wx-fall ${d.duration}s linear ${d.delay}s infinite`,
            }}
          />
        ))}

      {/* Lightning flash */}
      {scene === "thunder" && (
        <div
          className="absolute inset-0 bg-white"
          style={{ animation: "wx-flash 9s linear infinite" }}
        />
      )}

      {/* Snow */}
      {scene === "snow" &&
        flakes.map((f, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/90"
            style={{
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              animation: `wx-snow ${f.duration}s linear ${f.delay}s infinite`,
            }}
          />
        ))}

      {/* Mist veil */}
      {scene === "mist" && (
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/20 to-transparent dark:from-slate-900/70" />
      )}
    </div>
  );
}