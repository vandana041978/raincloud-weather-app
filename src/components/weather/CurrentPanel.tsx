/**
 * Hero card: place, local date/time, big temperature gauge, condition,
 * sunrise/sunset and the favourite toggle.
 */
import { Star, Sunrise, Sunset } from "lucide-react";
import type { WeatherBundle } from "@/lib/weather-types";
import {
  formatTemp,
  iconUrl,
  localDate,
  localTime,
  toUnit,
  type Unit,
} from "@/lib/weather-utils";

interface Props {
  data: WeatherBundle;
  unit: Unit;
  favorite: boolean;
  onToggleFavorite: () => void;
}

/** Animated radial gauge: -10 °C → 45 °C mapped onto a 270° arc. */
function TempGauge({ celsius, label }: { celsius: number; label: string }) {
  const pct = Math.min(1, Math.max(0, (celsius + 10) / 55));
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75;

  return (
    <div className="relative h-44 w-44 shrink-0">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-[225deg]" aria-hidden="true">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          className="stroke-current opacity-20"
          strokeDasharray={`${arc} ${circumference}`}
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          stroke="url(#tempGrad)"
          strokeDasharray={`${arc * pct} ${circumference}`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
        <defs>
          <linearGradient id="tempGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.7 0.15 230)" />
            <stop offset="55%" stopColor="oklch(0.8 0.15 150)" />
            <stop offset="100%" stopColor="oklch(0.72 0.19 40)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold tracking-tight scene-text">{label}</span>
        <span className="text-xs uppercase tracking-widest scene-muted">now</span>
      </div>
    </div>
  );
}

export function CurrentPanel({ data, unit, favorite, onToggleFavorite }: Props) {
  const { current, location } = data;
  const tz = location.timezoneOffset;

  return (
    <section className="glass animate-rise p-6 sm:p-8" aria-labelledby="current-heading">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 id="current-heading" className="truncate text-3xl font-semibold scene-text sm:text-4xl">
            {location.name}
            {location.country ? (
              <span className="ml-2 text-base font-normal scene-muted">{location.country}</span>
            ) : null}
          </h1>
          <p className="mt-1 text-sm scene-muted">
            {localDate(current.dt, tz)} · {localTime(current.dt, tz)} local time
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={favorite}
          aria-label={favorite ? "Remove from favourites" : "Save to favourites"}
          className="glass glass-hover shrink-0 p-2.5 scene-text"
        >
          <Star
            className={`h-5 w-5 ${favorite ? "fill-amber-400 text-amber-400" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6">
        <TempGauge celsius={current.temp} label={formatTemp(current.temp, unit)} />

        <div className="flex min-w-0 items-center gap-4">
          <img
            src={iconUrl(current.icon)}
            alt=""
            loading="lazy"
            width={112}
            height={112}
            className="h-24 w-24 drop-shadow-lg sm:h-28 sm:w-28"
          />
          <div className="min-w-0">
            <p className="text-xl font-medium capitalize scene-text">{current.description}</p>
            <p className="mt-1 text-sm scene-muted">
              Feels like {formatTemp(current.feelsLike, unit)} ·{" "}
              {Math.round(toUnit(current.temp, unit))}°{unit}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm scene-muted">
              <span className="flex items-center gap-1.5">
                <Sunrise className="h-4 w-4 text-amber-400" aria-hidden="true" />
                {current.sunrise ? localTime(current.sunrise, tz) : "—"}
              </span>
              <span className="flex items-center gap-1.5">
                <Sunset className="h-4 w-4 text-orange-400" aria-hidden="true" />
                {current.sunset ? localTime(current.sunset, tz) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}