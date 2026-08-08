/**
 * Hourly strip (next 24h) and the multi-day outlook with min/max bars.
 */
import type { WeatherBundle } from "@/lib/weather-types";
import { formatTemp, iconUrl, localDay, localHour, type Unit } from "@/lib/weather-utils";

export function HourlyForecast({ data, unit }: { data: WeatherBundle; unit: Unit }) {
  const tz = data.location.timezoneOffset;
  return (
    <section className="glass p-5" aria-labelledby="hourly-heading">
      <h2 id="hourly-heading" className="text-sm font-semibold uppercase tracking-widest scene-muted">
        Next hours
      </h2>
      <ul className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {data.hourly.map((h) => (
          <li
            key={h.dt}
            className="flex w-20 shrink-0 flex-col items-center gap-1 rounded-2xl bg-white/20 px-2 py-3 transition hover:bg-white/40 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <span className="text-xs scene-muted">{localHour(h.dt, tz)}</span>
            <img src={iconUrl(h.icon, 2)} alt={h.description} loading="lazy" width={48} height={48} className="h-12 w-12" />
            <span className="text-sm font-semibold scene-text">{formatTemp(h.temp, unit)}</span>
            <span className="text-[11px] text-sky-600 dark:text-sky-300">{Math.round(h.pop * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DailyForecast({ data, unit }: { data: WeatherBundle; unit: Unit }) {
  const tz = data.location.timezoneOffset;
  const lo = Math.min(...data.daily.map((d) => d.min));
  const hi = Math.max(...data.daily.map((d) => d.max));
  const span = Math.max(1, hi - lo);

  return (
    <section className="glass p-5" aria-labelledby="daily-heading">
      <h2 id="daily-heading" className="text-sm font-semibold uppercase tracking-widest scene-muted">
        {data.daily.length}-day outlook
      </h2>
      <ul className="mt-3 divide-y divide-white/20 dark:divide-white/10">
        {data.daily.map((d, i) => (
          <li key={d.dt} className="grid grid-cols-[3.2rem_2.5rem_minmax(0,1fr)] items-center gap-3 py-2.5">
            <span className="text-sm font-medium scene-text">{i === 0 ? "Today" : localDay(d.dt, tz)}</span>
            <img src={iconUrl(d.icon, 2)} alt={d.description} loading="lazy" width={40} height={40} className="h-10 w-10" />
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-10 shrink-0 text-right text-sm scene-muted">{formatTemp(d.min, unit)}</span>
              <div className="h-1.5 min-w-0 flex-1 rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-400"
                  style={{
                    marginLeft: `${((d.min - lo) / span) * 100}%`,
                    width: `${Math.max(6, ((d.max - d.min) / span) * 100)}%`,
                    transition: "width 0.8s ease, margin-left 0.8s ease",
                  }}
                />
              </div>
              <span className="w-10 shrink-0 text-sm font-semibold scene-text">{formatTemp(d.max, unit)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}