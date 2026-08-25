/**
 * SkyGlass — glassmorphic weather dashboard.
 *
 * Data flows one way: a query keyed by city/coords calls the
 * fetchWeather server function, and every panel reads from
 * that normalized weather bundle.
 */

import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  CloudSun,
  Loader2,
  Menu,
  RefreshCw,
  TriangleAlert,
  X,
} from "lucide-react";

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
import {
  DailyForecast,
  HourlyForecast,
} from "@/components/weather/ForecastPanels";
import { AdvicePanel } from "@/components/weather/AdvicePanel";

// Browser-only components
const TrendCharts = lazy(
  () => import("@/components/weather/TrendCharts"),
);

const WeatherMap = lazy(
  () => import("@/components/weather/WeatherMap"),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "SkyGlass — Live Weather Forecast, Hourly & 7-Day Outlook",
      },
      {
        name: "description",
        content:
          "Search any city for live conditions, hourly and 7-day forecasts, air quality, UV, trends and an interactive map in one glassmorphic dashboard.",
      },
      {
        property: "og:title",
        content:
          "SkyGlass — Live Weather Forecast, Hourly & 7-Day Outlook",
      },
      {
        property: "og:description",
        content:
          "Search any city for live conditions, hourly and 7-day forecasts, air quality, UV, trends and an interactive map in one glassmorphic dashboard.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),

  component: WeatherPage,
});

type Target =
  | { city: string }
  | { lat: number; lon: number };

function WeatherPage() {
  /*
   * ============================================================
   * MENU / PANEL STATES
   * ============================================================
   */

  const [menuOpen, setMenuOpen] = useState(false);

  const [historyOpen, setHistoryOpen] =
    useState(false);

  const [tripPlannerOpen, setTripPlannerOpen] =
    useState(false);

  const [showNearbyPlaces, setShowNearbyPlaces] =
    useState(false);

  /*
   * ============================================================
   * WEATHER
   * ============================================================
   */

  const load = useServerFn(fetchWeather);

  const [target, setTarget] = useState<Target>({
    city: "London",
  });

  const [unit, setUnit] = useState<Unit>("C");

  const [theme, setTheme] =
    useState<"light" | "dark">("dark");

  const [locating, setLocating] =
    useState(false);

  const [geoError, setGeoError] =
    useState<string | null>(null);

  /*
   * ============================================================
   * SAVED DATA
   * ============================================================
   */

  const [favorites, setFavorites] =
    useState<SavedCity[]>([]);

  const [recents, setRecents] =
    useState<SavedCity[]>([]);

  /*
   * ============================================================
   * RESTORE SAVED PREFERENCES
   * ============================================================
   */

  useEffect(() => {
    const prefs = getPrefs();

    setUnit(prefs.unit);
    setTheme(prefs.theme);

    setFavorites(getFavorites());
    setRecents(getRecents());

    if (prefs.lastCity) {
      setTarget({
        lat: prefs.lastCity.lat,
        lon: prefs.lastCity.lon,
      });
    }
  }, []);

  /*
   * ============================================================
   * APPLY DARK / LIGHT THEME
   * ============================================================
   */

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark",
    );
  }, [theme]);

  /*
   * ============================================================
   * WEATHER QUERY
   * ============================================================
   */

  const key =
    "city" in target
      ? `city:${target.city}`
      : `geo:${target.lat},${target.lon}`;

  const query = useQuery<WeatherBundle>({
    queryKey: ["weather", key],

    queryFn: () =>
      load({
        data: target,
      }),

    staleTime: 5 * 60_000,

    refetchInterval: 5 * 60_000,

    retry: 1,
  });

  const data = query.data;

  /*
   * ============================================================
   * SAVE CURRENT CITY TO HISTORY
   * ============================================================
   */

  useEffect(() => {
    if (!data) return;

    const city: SavedCity = {
      name: data.location.name,
      country: data.location.country,
      lat: data.location.lat,
      lon: data.location.lon,
    };

    savePrefs({
      lastCity: city,
    });

    setRecents(
      pushRecent(city),
    );
  }, [data]);

  /*
   * ============================================================
   * TEMPERATURE UNIT
   * ============================================================
   */

  const setUnitPref = useCallback(() => {
    setUnit((current) => {
      const next: Unit =
        current === "C"
          ? "F"
          : "C";

      savePrefs({
        unit: next,
      });

      return next;
    });
  }, []);

  /*
   * ============================================================
   * THEME
   * ============================================================
   */

  const setThemePref = useCallback(() => {
    setTheme((current) => {
      const next =
        current === "dark"
          ? "light"
          : "dark";

      savePrefs({
        theme: next,
      });

      return next;
    });
  }, []);

  /*
   * ============================================================
   * GEOLOCATION
   * ============================================================
   */

  const useLocation = useCallback(() => {
    setGeoError(null);

    if (!("geolocation" in navigator)) {
      setGeoError(
        "Geolocation isn't supported in this browser.",
      );

      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);

        setTarget({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },

      () => {
        setLocating(false);

        setGeoError(
          "Location permission denied — search for a city instead.",
        );
      },

      {
        timeout: 10_000,
      },
    );
  }, []);

  /*
   * ============================================================
   * CURRENT CITY
   * ============================================================
   */

  const currentCity: SavedCity | null =
    data
      ? {
          name: data.location.name,
          country: data.location.country,
          lat: data.location.lat,
          lon: data.location.lon,
        }
      : null;

  /*
   * ============================================================
   * BACKGROUND SCENE
   * ============================================================
   */

  const scene = useMemo(
    () =>
      data
        ? sceneFor(data)
        : theme === "dark"
          ? "night"
          : "sunny",

    [data, theme],
  );

  /*
   * ============================================================
   * ERROR MESSAGE
   * ============================================================
   */

  const errorMessage =
    query.error instanceof Error
      ? query.error.message
      : query.error
        ? "Something went wrong."
        : null;

  /*
   * ============================================================
   * OPEN HISTORY
   * ============================================================
   */

  const openHistory = () => {
    setMenuOpen(false);

    setHistoryOpen(true);

    setTripPlannerOpen(false);

    setShowNearbyPlaces(false);

    setTimeout(() => {
      document
        .getElementById("search-history")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /*
   * ============================================================
   * OPEN SMART TRIP PLANNER
   * ============================================================
   */

  const openTripPlanner = () => {
    setMenuOpen(false);

    setTripPlannerOpen(true);

    setHistoryOpen(false);

    setShowNearbyPlaces(false);

    setTimeout(() => {
      document
        .getElementById("smart-trip-planner")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /*
   * ============================================================
   * OPEN NEARBY TOURIST PLACES
   * ============================================================
   */

  const openNearbyPlaces = () => {
    setMenuOpen(false);

    setShowNearbyPlaces(true);

    setHistoryOpen(false);

    setTripPlannerOpen(false);

    setTimeout(() => {
      document
        .getElementById("nearby-tourist-places")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <>
      <ClientOnly fallback={null}>
        <AnimatedBackground scene={scene} />
      </ClientOnly>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">

        {/* ====================================================
            HEADER
            ==================================================== */}

        <header className="sticky top-0 z-50 -mx-4 mb-6 flex items-center gap-2 bg-transparent px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">

          <CloudSun
            className="h-7 w-7 shrink-0 text-sky-500 dark:text-sky-300"
            aria-hidden="true"
          />

          <div className="flex w-full items-center justify-between">

            {/* SkyGlass logo */}
            <span className="text-lg font-semibold tracking-tight scene-text">
              SkyGlass
            </span>

            {/* =================================================
                RIGHT SIDE CONTROLS
                ================================================= */}

            <div className="flex items-center gap-2">

              {/* Temperature */}
              <button
                type="button"
                onClick={setUnitPref}
                className="glass glass-hover rounded-lg px-2.5 py-1.5 text-xs font-medium scene-text"
                title="Change temperature unit"
                aria-label="Change temperature unit"
              >
                °{unit}
              </button>

              {/* Theme */}
              <button
                type="button"
                onClick={setThemePref}
                className="glass glass-hover rounded-lg px-2.5 py-1.5 text-xs scene-text"
                title="Change theme"
                aria-label="Change theme"
              >
                {theme === "dark"
                  ? "☀️"
                  : "🌙"}
              </button>

              {/* =================================================
                  HAMBURGER
                  ================================================= */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setMenuOpen(
                      (open) => !open,
                    )
                  }
                  className="glass glass-hover rounded-xl p-2.5 scene-text"
                  aria-label={
                    menuOpen
                      ? "Close menu"
                      : "Open menu"
                  }
                >
                  {menuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>

                {/* =================================================
                    HAMBURGER DROPDOWN
                    ================================================= */}

                {menuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 glass p-2">

                    {/* History */}
                    <button
                      type="button"
                      onClick={openHistory}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left scene-text transition hover:bg-white/10"
                    >
                      <span>🕘</span>

                      <span>
                        History
                      </span>
                    </button>

                    {/* Smart Trip Planner */}
                    <button
                      type="button"
                      onClick={openTripPlanner}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left scene-text transition hover:bg-white/10"
                    >
                      <span>✈️</span>

                      <span>
                        Smart Trip Planner
                      </span>
                    </button>

                    {/* Nearby Tourist Places */}
                    <button
                      type="button"
                      onClick={openNearbyPlaces}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left scene-text transition hover:bg-white/10"
                    >
                      <span>📍</span>

                      <span>
                        Nearby Tourist Places
                      </span>
                    </button>

                  </div>
                )}

              </div>
            </div>

          </div>

          {/* ==================================================
              WEATHER LOADING / REFRESH
              ================================================== */}

          {query.isFetching && (
            <Loader2
              className="ml-auto h-4 w-4 animate-spin scene-muted"
              aria-label="Loading weather"
            />
          )}

          {!query.isFetching && data && (
            <button
              type="button"
              onClick={() =>
                query.refetch()
              }
              aria-label="Refresh weather"
              className="ml-auto rounded-full p-2 scene-muted transition hover:bg-white/30"
            >
              <RefreshCw
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          )}

        </header>

        {/* ====================================================
            SEARCH BAR
            ==================================================== */}

        <SearchBar
          onSelectCity={(city) =>
            setTarget({ city })
          }

          onSelectCoords={(lat, lon) =>
            setTarget({
              lat,
              lon,
            })
          }

          onUseLocation={useLocation}

          locating={locating}

          recents={recents}

          favorites={favorites}

          onClearRecents={() =>
            setRecents(
              clearRecents(),
            )
          }
        />

        {/* ====================================================
            SEARCH HISTORY
            ==================================================== */}

        {historyOpen && (
          <section
            id="search-history"
            className="mt-4 glass p-5"
          >

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-semibold scene-text">
                Search History
              </h2>

              <button
                type="button"
                onClick={() =>
                  setHistoryOpen(false)
                }
                className="glass glass-hover rounded-lg p-2 scene-text"
                aria-label="Close history"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {recents.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">

                {recents
                  .slice(0, 20)
                  .map((city) => (
                    <button
                      key={`history-${city.lat}-${city.lon}`}
                      type="button"
                      onClick={() => {
                        setTarget({
                          lat: city.lat,
                          lon: city.lon,
                        });

                        setHistoryOpen(
                          false,
                        );
                      }}
                      className="glass glass-hover rounded-lg px-3 py-2 text-sm scene-text"
                    >
                      {city.name}
                    </button>
                  ))}

              </div>
            ) : (
              <p className="mt-4 text-sm scene-muted">
                No search history yet.
              </p>
            )}

            {recents.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setRecents(
                    clearRecents(),
                  )
                }
                className="mt-4 text-sm scene-muted underline-offset-4 hover:underline"
              >
                Clear history
              </button>
            )}

          </section>
        )}

        {/* ====================================================
            ERRORS
            ==================================================== */}

        {(geoError || errorMessage) && (
          <div
            role="alert"
            className="glass mt-4 flex items-start gap-3 border-destructive/40 p-4 text-sm scene-text"
          >
            <TriangleAlert
              className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              aria-hidden="true"
            />

            <p>
              {geoError ??
                errorMessage}
            </p>
          </div>
        )}

        {/* ====================================================
            LOADING
            ==================================================== */}

        {query.isPending && (
          <div className="glass mt-6 flex h-64 flex-col items-center justify-center gap-3">

            <Loader2
              className="h-8 w-8 animate-spin text-sky-500"
              aria-hidden="true"
            />

            <p className="text-sm scene-muted">
              Fetching the latest conditions…
            </p>

          </div>
        )}

        {/* ====================================================
            WEATHER CONTENT
            ==================================================== */}

        {data && (
          <div className="mt-6 space-y-4">

            {/* Current weather */}
            <CurrentPanel
              data={data}
              unit={unit}
              favorite={
                !!currentCity &&
                isFavorite(
                  currentCity,
                  favorites,
                )
              }
              onToggleFavorite={() =>
                currentCity &&
                setFavorites(
                  toggleFavorite(
                    currentCity,
                  ),
                )
              }
            />

            {/* Metrics */}
            <MetricsGrid
              data={data}
              unit={unit}
            />

            {/* Hourly */}
            <HourlyForecast
              data={data}
              unit={unit}
            />

            {/* =================================================
                DAILY + MAP
                ================================================= */}

            <div className="grid gap-4 lg:grid-cols-2">

              <DailyForecast
                data={data}
                unit={unit}
              />

              <section
                className="glass p-5"
                aria-labelledby="map-heading"
              >

                <h2
                  id="map-heading"
                  className="text-sm font-semibold uppercase tracking-widest scene-muted"
                >
                  On the map
                </h2>

                <div className="mt-4 overflow-hidden rounded-2xl">

                  <ClientOnly
                    fallback={
                      <div className="h-72 w-full animate-pulse rounded-2xl bg-white/20" />
                    }
                  >

                    <Suspense
                      fallback={
                        <div className="h-72 w-full animate-pulse rounded-2xl bg-white/20" />
                      }
                    >

                      <WeatherMap
                        lat={
                          data.location.lat
                        }
                        lon={
                          data.location.lon
                        }
                        label={`${data.location.name}${
                          data.location.country
                            ? `, ${data.location.country}`
                            : ""
                        }`}
                      />

                    </Suspense>

                  </ClientOnly>

                </div>

              </section>

            </div>

            {/* =================================================
                TREND CHARTS
                ================================================= */}

            <ClientOnly
              fallback={
                <div className="glass h-64 animate-pulse" />
              }
            >

              <Suspense
                fallback={
                  <div className="glass h-64 animate-pulse" />
                }
              >

                <TrendCharts
                  data={data}
                  unit={unit}
                />

              </Suspense>

            </ClientOnly>

            {/* =================================================
                ADVICE
                ================================================= */}

            <AdvicePanel data={data} />

            {/* =================================================
                SMART TRIP PLANNER
                Opens only from hamburger menu
                ================================================= */}

            {tripPlannerOpen && (
              <section
                id="smart-trip-planner"
                className="glass mt-4 p-5"
              >

                <div className="mb-4 flex items-center justify-between">

                  <h2 className="text-sm font-semibold uppercase tracking-widest scene-muted">
                    Smart Trip Planner
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      setTripPlannerOpen(
                        false,
                      )
                    }
                    className="glass glass-hover rounded-lg px-3 py-1.5 text-xs font-medium scene-text"
                  >
                    Close
                  </button>

                </div>

                {/* IMPORTANT:
                    TripPlanner only receives data.
                    No onClose prop is passed.
                */}
                <TripPlanner
                  data={data}
                />

              </section>
            )}

            {/* =================================================
                NEARBY TOURIST PLACES
                Opens only from hamburger menu
                ================================================= */}

            {showNearbyPlaces && (
              <section
                id="nearby-tourist-places"
                className="glass mt-4 p-5"
              >

                <div className="mb-4 flex items-center justify-between">

                  <h2 className="text-sm font-semibold uppercase tracking-widest scene-muted">
                    Nearby Tourist Places
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNearbyPlaces(
                        false,
                      )
                    }
                    className="glass glass-hover rounded-lg px-3 py-1.5 text-xs font-medium scene-text"
                  >
                    Close
                  </button>

                </div>

                <NearbyPlaces
                  data={data}
                />

              </section>
            )}

            {/* =================================================
                FOOTER
                ================================================= */}

            <footer className="py-6 text-center text-xs scene-muted">

              Data from OpenWeatherMap ·
              refreshed automatically
              every 5 minutes

              {data.source ===
                "classic" &&
                " · UV index and alerts need One Call 3.0 access"}

            </footer>

          </div>
        )}

      </main>
    </>
  );
}