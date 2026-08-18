/**
 * Skyglass — glassmorphic weather dashboard.
 *
 * Data flows one way: a query keyed by city/coords calls the `fetchWeather`
 * server function (which hides the OpenWeatherMap key), and every panel reads
 * from that single normalized bundle.
 */
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CloudSun, Loader2, RefreshCw, TriangleAlert } from "lucide-react";

import { NearbyPlaces } from "@/components/NearbyPlaces";
import { TripPlanner } from "@/components/TripPlanner";

import { fetchWeather } from "@/lib/weather.functions";
import type { WeatherBundle } from "@/lib/weather-types";
import { sceneFor, type Unit } from "@/lib/weather-utils";
import {
  clearRecents,
  getFavorites,
  getPrefs,
  getRecents,
  isFavorite,
  pushRecent,
  savePrefs,
  toggleFavorite,
  type SavedCity,
} from "@/lib/weather-storage";
import { AnimatedBackground } from "@/components/weather/AnimatedBackground";
import { SearchBar } from "@/components/weather/SearchBar";
import { CurrentPanel } from "@/components/weather/CurrentPanel";
import { MetricsGrid } from "@/components/weather/MetricsGrid";
import { DailyForecast, HourlyForecast } from "@/components/weather/ForecastPanels";
import { AdvicePanel } from "@/components/weather/AdvicePanel";

// Canvas + Leaflet are browser-only: load them after hydration.
const TrendCharts = lazy(() => import("@/components/weather/TrendCharts"));
const WeatherMap = lazy(() => import("@/components/weather/WeatherMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skyglass — Live Weather Forecast, Hourly & 7-Day Outlook" },
      {
        name: "description",
        content:
          "Search any city for live conditions, hourly and 7-day forecasts, air quality, UV, trends and an interactive map in one glassmorphic dashboard.",
      },
      { property: "og:title", content: "Skyglass — Live Weather Forecast, Hourly & 7-Day Outlook" },
      {
        property: "og:description",
        content:
          "Search any city for live conditions, hourly and 7-day forecasts, air quality, UV, trends and an interactive map in one glassmorphic dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WeatherPage,
});

type Target = { city: string } | { lat: number; lon: number };

function WeatherPage() {
  const load = useServerFn(fetchWeather);
  const [target, setTarget] = useState<Target>({ city: "London" });
  const [unit, setUnit] = useState<Unit>("C");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<SavedCity[]>([]);
  const [recents, setRecents] = useState<SavedCity[]>([]);

  // Restore saved preferences and lists after hydration.
  useEffect(() => {
    const prefs = getPrefs();
    setUnit(prefs.unit);
    setTheme(prefs.theme);
    setFavorites(getFavorites());
    setRecents(getRecents());
    if (prefs.lastCity) setTarget({ lat: prefs.lastCity.lat, lon: prefs.lastCity.lon });
  }, []);

  // Apply the theme class to <html>.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const key = "city" in target ? `city:${target.city}` : `geo:${target.lat},${target.lon}`;

  const query = useQuery<WeatherBundle>({
    queryKey: ["weather", key],
    queryFn: () => load({ data: target }),
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000, // auto refresh every 5 minutes
    retry: 1,
  });

  const data = query.data;

  // Persist the resolved place for the next visit and the recents list.
  useEffect(() => {
    if (!data) return;
    const city: SavedCity = {
      name: data.location.name,
      country: data.location.country,
      lat: data.location.lat,
      lon: data.location.lon,
    };
    savePrefs({ lastCity: city });
    setRecents(pushRecent(city));
  }, [data]);

  const setUnitPref = useCallback(() => {
    setUnit((u) => {
      const next: Unit = u === "C" ? "F" : "C";
      savePrefs({ unit: next });
      return next;
    });
  }, []);

  const setThemePref = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      savePrefs({ theme: next });
      return next;
    });
  }, []);

  const useLocation = useCallback(() => {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation isn't supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setTarget({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setGeoError("Location permission denied — search for a city instead.");
      },
      { timeout: 10_000 },
    );
  }, []);

  const currentCity: SavedCity | null = data
    ? {
        name: data.location.name,
        country: data.location.country,
        lat: data.location.lat,
        lon: data.location.lon,
      }
    : null;

  const scene = useMemo(() => (data ? sceneFor(data) : theme === "dark" ? "night" : "sunny"), [data, theme]);
  const errorMessage =
    query.error instanceof Error ? query.error.message : query.error ? "Something went wrong." : null;

  return (
    <>
      {/* Decorative only — rendered after hydration so the randomised
          particle positions never trigger an SSR mismatch. */}
      <ClientOnly fallback={null}>
        <AnimatedBackground scene={scene} />
      </ClientOnly>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="mb-6 flex items-center gap-2">
          <CloudSun className="h-7 w-7 shrink-0 text-sky-500 dark:text-sky-300" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight scene-text">Skyglass</span>
          {query.isFetching && (
            <Loader2 className="ml-auto h-4 w-4 animate-spin scene-muted" aria-label="Loading weather" />
          )}
          {!query.isFetching && data && (
            <button
              type="button"
              onClick={() => query.refetch()}
              aria-label="Refresh weather"
              className="ml-auto rounded-full p-2 scene-muted transition hover:bg-white/30"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </header>

        <SearchBar
          onSelectCity={(city) => setTarget({ city })}
          onSelectCoords={(lat, lon) => setTarget({ lat, lon })}
          onUseLocation={useLocation}
          locating={locating}
          unit={unit}
          onToggleUnit={setUnitPref}
          theme={theme}
          onToggleTheme={setThemePref}
          recents={recents}
          favorites={favorites}
          onClearRecents={() => setRecents(clearRecents())}
        />

        {(geoError || errorMessage) && (
          <div
            role="alert"
            className="glass mt-4 flex items-start gap-3 border-destructive/40 p-4 text-sm scene-text"
          >
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <p>{geoError ?? errorMessage}</p>
          </div>
        )}

        {query.isPending && (
          <div className="glass mt-6 flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" aria-hidden="true" />
            <p className="text-sm scene-muted">Fetching the latest conditions…</p>
          </div>
        )}

        {data && (
          <div className="mt-6 space-y-4">
            <CurrentPanel
              data={data}
              unit={unit}
              favorite={!!currentCity && isFavorite(currentCity, favorites)}
              onToggleFavorite={() => currentCity && setFavorites(toggleFavorite(currentCity))}
            />

            <MetricsGrid data={data} unit={unit} />
            <HourlyForecast data={data} unit={unit} />

            <div className="grid gap-4 lg:grid-cols-2">
              <DailyForecast data={data} unit={unit} />
              <section className="glass p-5" aria-labelledby="map-heading">
                <h2 id="map-heading" className="text-sm font-semibold uppercase tracking-widest scene-muted">
                  On the map
                </h2>
                <div className="mt-4 overflow-hidden rounded-2xl">
                  <ClientOnly fallback={<div className="h-72 w-full animate-pulse rounded-2xl bg-white/20" />}>
                    <Suspense fallback={<div className="h-72 w-full animate-pulse rounded-2xl bg-white/20" />}>
                      <WeatherMap
                        lat={data.location.lat}
                        lon={data.location.lon}
                        label={`${data.location.name}${data.location.country ? `, ${data.location.country}` : ""}`}
                      />
                    </Suspense>
                  </ClientOnly>
                </div>
              </section>
            </div>

            <ClientOnly fallback={<div className="glass h-64 animate-pulse" />}>
              <Suspense fallback={<div className="glass h-64 animate-pulse" />}>
                <TrendCharts data={data} unit={unit} />
              </Suspense>
            </ClientOnly>

            <AdvicePanel data={data} />

            <TripPlanner data={data} />

            <NearbyPlaces data={data} />

            <footer className="py-6 text-center text-xs scene-muted">
              Data from OpenWeatherMap · refreshed automatically every 5 minutes
              {data.source === "classic" && " · UV index and alerts need One Call 3.0 access"}
            </footer>
          </div>
        )}
      </main>
    </>
  );
}
