/**
 * Server-only OpenWeatherMap client.
 *
 * Everything here runs inside a server function handler, so the API key is
 * never shipped to the browser. Two data paths are supported:
 *  - One Call 3.0 (richest: 8-day daily, 48h hourly, UV index, alerts)
 *  - Classic 2.5 endpoints (fallback when the key has no One Call subscription)
 */
import type {
  AirQuality,
  CitySuggestion,
  CurrentWeather,
  DailyPoint,
  HourlyPoint,
  WeatherAlert,
  WeatherBundle,
  WeatherLocation,
} from "./weather-types";

const GEO = "https://api.openweathermap.org/geo/1.0";
const DATA = "https://api.openweathermap.org/data";

function apiKey() {
  const key = process.env.OPENWEATHER_API_KEY;

  if (!key) {
    throw new Error("Weather service is not configured.");
  }

  return key;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) throw new Error("Weather API key was rejected.");
    if (res.status === 404) throw new Error("Location not found.");
    if (res.status === 429) throw new Error("Too many requests — try again in a moment.");
    throw new Error(`Weather service error (${res.status}).`);
  }
  return (await res.json()) as T;
}

/** City autocomplete via the geocoding API. */
export async function geocode(query: string, limit = 5): Promise<CitySuggestion[]> {
  const q = query.trim();
  if (!q) return [];
  const rows = await getJson<any[]>(
    `${GEO}/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${apiKey()}`,
  );
  return rows.map((r) => ({
    name: r.name,
    country: r.country,
    state: r.state,
    lat: r.lat,
    lon: r.lon,
  }));
}

async function reverseGeocode(lat: number, lon: number): Promise<CitySuggestion | null> {
  const rows = await getJson<any[]>(
    `${GEO}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey()}`,
  );
  const r = rows[0];
  return r ? { name: r.name, country: r.country, state: r.state, lat, lon } : null;
}

async function airQuality(lat: number, lon: number): Promise<AirQuality | null> {
  try {
    const data = await getJson<any>(
      `${DATA}/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey()}`,
    );
    const row = data?.list?.[0];
    if (!row) return null;
    return { index: row.main.aqi, components: row.components ?? {} };
  } catch {
    return null; // AQI is optional — never fail the whole request for it
  }
}

function condition(w: any): string {
  return w?.[0]?.main ?? "Clear";
}

/** One Call 3.0 shape -> normalized bundle. */
async function viaOneCall(place: CitySuggestion): Promise<WeatherBundle> {
  const d = await getJson<any>(
    `${DATA}/3.0/onecall?lat=${place.lat}&lon=${place.lon}&units=metric&exclude=minutely&appid=${apiKey()}`,
  );

  const current: CurrentWeather = {
    dt: d.current.dt,
    temp: d.current.temp,
    feelsLike: d.current.feels_like,
    humidity: d.current.humidity,
    pressure: d.current.pressure,
    visibility: d.current.visibility ?? 10000,
    windSpeed: d.current.wind_speed,
    windDeg: d.current.wind_deg,
    windGust: d.current.wind_gust,
    uvi: d.current.uvi ?? 0,
    clouds: d.current.clouds,
    sunrise: d.current.sunrise,
    sunset: d.current.sunset,
    condition: condition(d.current.weather),
    description: d.current.weather?.[0]?.description ?? "",
    icon: d.current.weather?.[0]?.icon ?? "01d",
  };

  const hourly: HourlyPoint[] = (d.hourly ?? []).slice(0, 24).map((h: any) => ({
    dt: h.dt,
    temp: h.temp,
    feelsLike: h.feels_like,
    humidity: h.humidity,
    windSpeed: h.wind_speed,
    pop: h.pop ?? 0,
    icon: h.weather?.[0]?.icon ?? "01d",
    description: h.weather?.[0]?.description ?? "",
  }));

  const daily: DailyPoint[] = (d.daily ?? []).slice(0, 7).map((x: any) => ({
    dt: x.dt,
    min: x.temp.min,
    max: x.temp.max,
    humidity: x.humidity,
    windSpeed: x.wind_speed,
    pop: x.pop ?? 0,
    icon: x.weather?.[0]?.icon ?? "01d",
    description: x.weather?.[0]?.description ?? "",
    condition: condition(x.weather),
  }));

  const alerts: WeatherAlert[] = (d.alerts ?? []).map((a: any) => ({
    event: a.event,
    description: a.description,
    start: a.start,
    end: a.end,
    sender: a.sender_name,
  }));

  return {
    location: {
      name: place.name,
      country: place.country,
      state: place.state,
      lat: place.lat,
      lon: place.lon,
      timezoneOffset: d.timezone_offset ?? 0,
    },
    current,
    hourly,
    daily,
    air: await airQuality(place.lat, place.lon),
    alerts,
    source: "onecall",
    fetchedAt: Date.now(),
  };
}

/** Classic 2.5 endpoints -> normalized bundle (daily aggregated from 3-hourly). */
async function viaClassic(place: CitySuggestion): Promise<WeatherBundle> {
  const base = `lat=${place.lat}&lon=${place.lon}&units=metric&appid=${apiKey()}`;
  const [now, fc] = await Promise.all([
    getJson<any>(`${DATA}/2.5/weather?${base}`),
    getJson<any>(`${DATA}/2.5/forecast?${base}`),
  ]);

  const tzOffset = now.timezone ?? 0;

  const current: CurrentWeather = {
    dt: now.dt,
    temp: now.main.temp,
    feelsLike: now.main.feels_like,
    humidity: now.main.humidity,
    pressure: now.main.pressure,
    visibility: now.visibility ?? 10000,
    windSpeed: now.wind?.speed ?? 0,
    windDeg: now.wind?.deg ?? 0,
    windGust: now.wind?.gust,
    uvi: 0, // not available on 2.5; UV card shows "n/a"
    clouds: now.clouds?.all ?? 0,
    sunrise: now.sys?.sunrise ?? 0,
    sunset: now.sys?.sunset ?? 0,
    condition: condition(now.weather),
    description: now.weather?.[0]?.description ?? "",
    icon: now.weather?.[0]?.icon ?? "01d",
  };

  // Interpolate 3-hourly steps into 24 hourly-ish points (first 8 slots).
  const hourly: HourlyPoint[] = (fc.list ?? []).slice(0, 8).map((h: any) => ({
    dt: h.dt,
    temp: h.main.temp,
    feelsLike: h.main.feels_like,
    humidity: h.main.humidity,
    windSpeed: h.wind?.speed ?? 0,
    pop: h.pop ?? 0,
    icon: h.weather?.[0]?.icon ?? "01d",
    description: h.weather?.[0]?.description ?? "",
  }));

  // Group 3-hourly rows by local calendar day.
  const buckets = new Map<string, any[]>();
  for (const row of fc.list ?? []) {
    const key = new Date((row.dt + tzOffset) * 1000).toISOString().slice(0, 10);
    const list = buckets.get(key) ?? [];
    list.push(row);
    buckets.set(key, list);
  }
  const daily: DailyPoint[] = [...buckets.values()].slice(0, 7).map((rows) => {
    const mid = rows[Math.floor(rows.length / 2)];
    return {
      dt: rows[0].dt,
      min: Math.min(...rows.map((r: any) => r.main.temp_min)),
      max: Math.max(...rows.map((r: any) => r.main.temp_max)),
      humidity: Math.round(
        rows.reduce((s: number, r: any) => s + r.main.humidity, 0) / rows.length,
      ),
      windSpeed: Math.max(...rows.map((r: any) => r.wind?.speed ?? 0)),
      pop: Math.max(...rows.map((r: any) => r.pop ?? 0)),
      icon: mid.weather?.[0]?.icon ?? "01d",
      description: mid.weather?.[0]?.description ?? "",
      condition: condition(mid.weather),
    };
  });

  return {
    location: {
      name: place.name || now.name,
      country: place.country || now.sys?.country || "",
      state: place.state,
      lat: place.lat,
      lon: place.lon,
      timezoneOffset: tzOffset,
    },
    current,
    hourly,
    daily,
    air: await airQuality(place.lat, place.lon),
    alerts: [],
    source: "classic",
    fetchedAt: Date.now(),
  };
}

async function resolvePlace(input: {
  city?: string | undefined;
  lat?: number | undefined;
  lon?: number | undefined;
}): Promise<CitySuggestion> {
  if (typeof input.lat === "number" && typeof input.lon === "number") {
    const found = await reverseGeocode(input.lat, input.lon);
    return found ?? { name: "My location", country: "", lat: input.lat, lon: input.lon };
  }
  const [first] = await geocode(input.city ?? "", 1);
  if (!first) throw new Error(`Couldn't find "${input.city}". Check the spelling and try again.`);
  return first;
}

/** Fetch a full weather bundle by city name or coordinates. */
export async function loadWeather(input: {
  city?: string | undefined;
  lat?: number | undefined;
  lon?: number | undefined;
}): Promise<WeatherBundle> {
  const place = await resolvePlace(input);
  try {
    return await viaOneCall(place);
  } catch {
    // Most free keys have no One Call 3.0 subscription — fall back silently.
    return await viaClassic(place);
  }
}

export type { WeatherBundle, WeatherLocation };