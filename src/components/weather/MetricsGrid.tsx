/**
 * Detail metrics with animated progress bars for humidity, wind, UV and AQI,
 * plus plain readouts for pressure and visibility.
 */
import { Droplets, Eye, Gauge, Sun, Wind, Waves } from "lucide-react";
import type { WeatherBundle } from "@/lib/weather-types";
import {
  AQI_LABELS,
  compass,
  uvLabel,
  windLabel,
  windSpeedLabel,
  type Unit,
} from "@/lib/weather-utils";

function Meter({
  icon,
  title,
  value,
  caption,
  percent,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  caption: string;
  percent: number;
  tone: string;
}) {
  return (
    <div className="glass glass-hover p-5">
      <div className="flex items-center gap-2 text-sm scene-muted">
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
        <span className="truncate">{title}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold scene-text">{value}</p>
      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10"
        role="progressbar"
        aria-label={title}
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone}`}
          style={{
            width: `${Math.min(100, Math.max(2, percent))}%`,
            transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
      <p className="mt-2 text-xs scene-muted">{caption}</p>
    </div>
  );
}

function Stat({
  icon,
  title,
  value,
  caption,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="glass glass-hover p-5">
      <div className="flex items-center gap-2 text-sm scene-muted">
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
        <span className="truncate">{title}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold scene-text">{value}</p>
      <p className="mt-4 text-xs scene-muted">{caption}</p>
    </div>
  );
}

export function MetricsGrid({ data, unit }: { data: WeatherBundle; unit: Unit }) {
  const { current, air } = data;
  const uvKnown = data.source === "onecall";

  return (
    <section aria-label="Weather details" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Meter
        icon={<Droplets className="h-4 w-4" />}
        title="Humidity"
        value={`${current.humidity}%`}
        caption={current.humidity > 70 ? "Muggy air" : current.humidity < 30 ? "Very dry" : "Comfortable"}
        percent={current.humidity}
        tone="from-sky-400 to-cyan-300"
      />
      <Meter
        icon={<Wind className="h-4 w-4" />}
        title="Wind"
        value={windSpeedLabel(current.windSpeed, unit)}
        caption={`${windLabel(current.windSpeed)} · from ${compass(current.windDeg)}`}
        percent={(current.windSpeed / 25) * 100}
        tone="from-teal-400 to-emerald-300"
      />
      <Meter
        icon={<Sun className="h-4 w-4" />}
        title="UV index"
        value={uvKnown ? current.uvi.toFixed(1) : "n/a"}
        caption={uvKnown ? uvLabel(current.uvi) : "Needs One Call API access"}
        percent={uvKnown ? (current.uvi / 12) * 100 : 0}
        tone="from-amber-400 to-orange-400"
      />
      <Meter
        icon={<Waves className="h-4 w-4" />}
        title="Air quality"
        value={air ? (AQI_LABELS[air.index] ?? "—") : "—"}
        caption={air ? `AQI ${air.index}/5 · PM2.5 ${Math.round(air.components["pm2_5"] ?? 0)} µg/m³` : "Unavailable"}
        percent={air ? (air.index / 5) * 100 : 0}
        tone="from-lime-400 to-yellow-400"
      />
      <Stat
        icon={<Gauge className="h-4 w-4" />}
        title="Pressure"
        value={`${current.pressure} hPa`}
        caption={current.pressure > 1015 ? "High pressure — settled" : "Low pressure — changeable"}
      />
      <Stat
        icon={<Eye className="h-4 w-4" />}
        title="Visibility"
        value={`${(current.visibility / 1000).toFixed(1)} km`}
        caption={current.visibility >= 10000 ? "Clear and far-reaching" : "Reduced visibility"}
      />
    </section>
  );
}