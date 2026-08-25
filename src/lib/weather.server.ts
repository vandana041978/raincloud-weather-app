/**
 * Server-only OpenWeatherMap client.
 *
 * Uses OpenWeatherMap for weather data and Open-Meteo for UV index
 * when One Call 3.0 is unavailable.
 */

/// <reference types="node" />

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
const UV_API = "https://api.open-meteo.com/v1/forecast";

console.log(
  "OPENWEATHER_API_KEY:",
  process.env["OPENWEATHER_API_KEY"]
    ? "FOUND"
    : "NOT FOUND",
);

function apiKey() {
  const key = process.env["OPENWEATHER_API_KEY"];

  if (!key) {
    throw new Error("Weather service is not configured.");
  }

  return key;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Weather API key was rejected.");
    }

    if (res.status === 404) {
      throw new Error("Location not found.");
    }

    if (res.status === 429) {
      throw new Error("Too many requests — try again in a moment.");
    }

    throw new Error(`Weather service error (${res.status}).`);
  }

  return (await res.json()) as T;
}

/** City autocomplete via OpenWeatherMap geocoding API. */
export async function geocode(
  query: string,
  limit = 5,
): Promise<CitySuggestion[]> {
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

/** Reverse geocoding for the user's location. */
async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<CitySuggestion | null> {
  const rows = await getJson<any[]>(
    `${GEO}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey()}`,
  );

  const r = rows[0];

  return r
    ? {
        name: r.name,
        country: r.country,
        state: r.state,
        lat,
        lon,
      }
    : null;
}

/** OpenWeatherMap air-quality data. */
async function airQuality(
  lat: number,
  lon: number,
): Promise<AirQuality | null> {
  try {
    const data = await getJson<any>(
      `${DATA}/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey()}`,
    );

    const row = data?.list?.[0];

    if (!row) return null;

    return {
      index: row.main.aqi,
      components: row.components ?? {},
    };
  } catch {
    return null;
  }
}

/**
 * Gets current UV index from Open-Meteo.
 *
 * This is used when OpenWeatherMap One Call 3.0 is unavailable.
 */
async function getUVIndex(
  lat: number,
  lon: number,
): Promise<number | null> {
  try {
    const url =
      `${UV_API}?latitude=${lat}` +
      `&longitude=${lon}` +
      `&current=uv_index` +
      `&timezone=auto`;

    const data = await getJson<any>(url);

    const uv = data?.current?.uv_index;

    if (typeof uv !== "number") {
      return null;
    }

    return uv;
  } catch {
    return null;
  }
}

function condition(w: any): string {
  return w?.[0]?.main ?? "Clear";
}

/**
 * One Call 3.0.
 *
 * Provides UV directly through d.current.uvi.
 */
async function viaOneCall(
  place: CitySuggestion,
): Promise<WeatherBundle> {
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
    windSpeed: d.current.wind_speed ?? 0,
    windDeg: d.current.wind_deg ?? 0,
    windGust: d.current.wind_gust,
    uvi: d.current.uvi ?? 0,
    clouds: d.current.clouds ?? 0,
    sunrise: d.current.sunrise ?? 0,
    sunset: d.current.sunset ?? 0,
    condition: condition(d.current.weather),
    description: d.current.weather?.[0]?.description ?? "",
    icon: d.current.weather?.[0]?.icon ?? "01d",
  };

  async function getPastHourly(
  lat: number,
  lon: number,
  currentDt: number,
): Promise<HourlyPoint[]> {
  const results: HourlyPoint[] = [];

  // Get the previous 12 hours.
  for (let i = 12; i >= 1; i--) {
    const timestamp = currentDt - i * 60 * 60;

    try {
      const data = await getJson<any>(
        `${DATA}/3.0/onecall/timemachine?` +
          `lat=${lat}&lon=${lon}&dt=${timestamp}` +
          `units=metric&appid=${apiKey()}`,
      );

      const h = data?.data?.[0];

      if (h) {
        results.push({
          dt: h.dt,
          temp: h.temp,
          feelsLike: h.feels_like,
          humidity: h.humidity,
          windSpeed: h.wind_speed ?? 0,
          pop: h.pop ?? 0,
          icon: h.weather?.[0]?.icon ?? "01d",
          description: h.weather?.[0]?.description ?? "",
        });
      }
    } catch {
      // Don't break the whole weather page if historical data fails.
    }
  }

  return results;
}

 const futureHourly: HourlyPoint[] = (d.hourly ?? [])
  .slice(0, 12)
  .map((h: any) => ({
    dt: h.dt,
    temp: h.temp,
    feelsLike: h.feels_like,
    humidity: h.humidity,
    windSpeed: h.wind_speed,
    pop: h.pop ?? 0,
    icon: h.weather?.[0]?.icon ?? "01d",
    description: h.weather?.[0]?.description ?? "",
  }));
  const pastHourly = await getPastHourly(
  place.lat,
  place.lon,
  d.current.dt,
);

const hourly: HourlyPoint[] = [
  ...pastHourly,
  ...futureHourly,
];

  const daily: DailyPoint[] = (d.daily ?? [])
    .slice(0, 7)
    .map((x: any) => ({
      dt: x.dt,
      min: x.temp.min,
      max: x.temp.max,
      humidity: x.humidity,
      windSpeed: x.wind_speed ?? 0,
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

/**
 * Classic OpenWeatherMap 2.5 endpoints.
 *
 * UV comes from Open-Meteo because the Classic 2.5 weather endpoint
 * does not provide the current UV index.
 */

function weatherCodeToDescription(code: number | undefined): string {
  switch (code) {
    case 0:
      return "Clear sky";

    case 1:
      return "Mainly clear";

    case 2:
      return "Partly cloudy";

    case 3:
      return "Overcast";

    case 45:
    case 48:
      return "Fog";

    case 51:
    case 53:
    case 55:
      return "Drizzle";

    case 56:
    case 57:
      return "Freezing drizzle";

    case 61:
    case 63:
    case 65:
      return "Rain";

    case 66:
    case 67:
      return "Freezing rain";

    case 71:
    case 73:
    case 75:
      return "Snow";

    case 77:
      return "Snow grains";

    case 80:
    case 81:
    case 82:
      return "Rain showers";

    case 85:
    case 86:
      return "Snow showers";

    case 95:
      return "Thunderstorm";

    case 96:
    case 99:
      return "Thunderstorm with hail";

    default:
      return "Unknown";
  }
}

function weatherCodeToIcon(code: number | undefined): string {
  if (code === undefined) return "01d";

  if (code === 0) return "01d";

  if (code === 1) return "02d";

  if (code === 2) return "03d";

  if (code === 3) return "04d";

  if ([45, 48].includes(code)) return "50d";

  if ([51, 53, 55, 56, 57].includes(code)) return "09d";

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "10d";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "13d";
  }

  if ([95, 96, 99].includes(code)) {
    return "11d";
  }

  return "01d";
}

async function getHourlyHistoryAndForecast(
  lat: number,
  lon: number,
): Promise<HourlyPoint[]> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}` +
      `&longitude=${lon}` +
      `&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code` +
      `&past_hours=12` +
      `&forecast_hours=13` +
      `&timezone=auto` +
      `&timeformat=unixtime`;

    const data = await getJson<any>(url);

    const times = data?.hourly?.time ?? [];
    const temperatures = data?.hourly?.temperature_2m ?? [];
    const apparentTemperatures =
      data?.hourly?.apparent_temperature ?? [];
    const humidity =
      data?.hourly?.relative_humidity_2m ?? [];
    const windSpeed =
      data?.hourly?.wind_speed_10m ?? [];
    const precipitationProbability =
      data?.hourly?.precipitation_probability ?? [];
    const weatherCodes =
      data?.hourly?.weather_code ?? [];

    return times.map((dt: number, index: number) => ({
      dt,
      temp: temperatures[index] ?? 0,
      feelsLike: apparentTemperatures[index] ?? temperatures[index] ?? 0,
      humidity: humidity[index] ?? 0,
      windSpeed: (windSpeed[index] ?? 0) / 3.6,
      pop: (precipitationProbability[index] ?? 0) / 100,
      icon: weatherCodeToIcon(weatherCodes[index]),
      description: weatherCodeToDescription(weatherCodes[index]),
    }));
  } catch (error) {
    console.error("Hourly history/forecast error:", error);
    return [];
  }
}

async function getOpenMeteoDaily(
  lat: number,
  lon: number,
): Promise<DailyPoint[]> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}` +
      `&longitude=${lon}` +
      `&daily=temperature_2m_min,temperature_2m_max,weather_code,relative_humidity_2m_mean,wind_speed_10m_max,precipitation_probability_max` +
      `&forecast_days=6` +
      `&timezone=auto` +
      `&timeformat=unixtime`;

    const data = await getJson<any>(url);

    const times = data?.daily?.time ?? [];
    const mins = data?.daily?.temperature_2m_min ?? [];
    const maxes = data?.daily?.temperature_2m_max ?? [];
    const humidity = data?.daily?.relative_humidity_2m_mean ?? [];
    const wind = data?.daily?.wind_speed_10m_max ?? [];
    const pop = data?.daily?.precipitation_probability_max ?? [];
    const codes = data?.daily?.weather_code ?? [];

    return times.map((dt: number, index: number) => {
      const code = codes[index];

      return {
        dt,
        min: mins[index] ?? 0,
        max: maxes[index] ?? 0,
        humidity: humidity[index] ?? 0,

        // Open-Meteo gives km/h; convert to m/s
        // to stay consistent with your existing WeatherBundle.
        windSpeed: (wind[index] ?? 0) / 3.6,

        pop: (pop[index] ?? 0) / 100,

        icon: weatherCodeToIcon(code),

        description: weatherCodeToDescription(code),

        condition: condition([
          {
            id: code ?? 0,
            main: weatherCodeToDescription(code),
            description: weatherCodeToDescription(code),
            icon: weatherCodeToIcon(code),
          },
        ]),
      };
    });
  } catch (error) {
    console.error("Open-Meteo daily forecast error:", error);
    return [];
  }
}

async function viaClassic(
  place: CitySuggestion,
): Promise<WeatherBundle> {
  const base =
    `lat=${place.lat}` +
    `&lon=${place.lon}` +
    `&units=metric` +
    `&appid=${apiKey()}`;

  const [now, fc, uvIndex] = await Promise.all([
    getJson<any>(`${DATA}/2.5/weather?${base}`),

    getJson<any>(`${DATA}/2.5/forecast?${base}`),

    getUVIndex(place.lat, place.lon),
  ]);

  console.log("CITY:", place.name);
  console.log("PRESSURE:", now.main?.pressure);
  console.log("VISIBILITY:", now.visibility);
  console.log("UV INDEX:", uvIndex);

  const tzOffset = now.timezone ?? 0;

  const current: CurrentWeather = {
    dt: now.dt,
    temp: now.main.temp,
    feelsLike: now.main.feels_like,
    humidity: now.main.humidity,

    // Pressure from OpenWeatherMap
    pressure: now.main.pressure,

    // Visibility from OpenWeatherMap
    visibility: now.visibility ?? 10000,

    windSpeed: now.wind?.speed ?? 0,
    windDeg: now.wind?.deg ?? 0,
    windGust: now.wind?.gust,

    // UV from Open-Meteo
    uvi: uvIndex ?? 0,

    clouds: now.clouds?.all ?? 0,
    sunrise: now.sys?.sunrise ?? 0,
    sunset: now.sys?.sunset ?? 0,

    condition: condition(now.weather),
    description: now.weather?.[0]?.description ?? "",
    icon: now.weather?.[0]?.icon ?? "01d",
  };

  /**
   * OpenWeatherMap forecast is provided in approximately 3-hour intervals.
   */
 const hourly = await getHourlyHistoryAndForecast(
  place.lat,
  place.lon,
);

  /**
   * Group forecast rows by local calendar day.
   */
  const daily = await getOpenMeteoDaily(
  place.lat,
  place.lon,
);

  return {
    location: {
      name: place.name || now.name,
      country:
        place.country ||
        now.sys?.country ||
        "",
      state: place.state,
      lat: place.lat,
      lon: place.lon,
      timezoneOffset: tzOffset,
    },

    current,
    hourly,
    daily,

    air: await airQuality(
      place.lat,
      place.lon,
    ),

    alerts: [],

    source: "classic",

    fetchedAt: Date.now(),
  };
}

/** Resolve a city or coordinates into a location. */
async function resolvePlace(input: {
  city?: string;
  lat?: number;
  lon?: number;
}): Promise<CitySuggestion> {
  if (
    typeof input.lat === "number" &&
    typeof input.lon === "number"
  ) {
    const found = await reverseGeocode(
      input.lat,
      input.lon,
    );

    return (
      found ?? {
        name: "My location",
        country: "",
        lat: input.lat,
        lon: input.lon,
      }
    );
  }

  const [first] = await geocode(
    input.city ?? "",
    1,
  );

  if (!first) {
    throw new Error(
      `Couldn't find "${input.city}". Check the spelling and try again.`,
    );
  }

  return first;
}

/** Fetch weather by city name or coordinates. */
export async function loadWeather(input: {
  city?: string;
  lat?: number;
  lon?: number;
}): Promise<WeatherBundle> {
  const place = await resolvePlace(input);

  try {
    return await viaOneCall(place);
  } catch (error) {
    console.log(
      "One Call 3.0 unavailable. Using Classic API.",
      error,
    );

    return await viaClassic(place);
  }
}

export type {
  WeatherBundle,
  WeatherLocation,
};