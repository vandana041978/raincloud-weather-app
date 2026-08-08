/**
 * Pure presentation helpers: units, time formatting in the target city's
 * timezone, AQI/UV scales, and the advice/fact generators.
 */
import type { WeatherBundle } from "./weather-types";

export type Unit = "C" | "F";

/** Convert a Celsius API value to the active display unit. */
export const toUnit = (celsius: number, unit: Unit) =>
  unit === "C" ? celsius : celsius * 1.8 + 32;

export const formatTemp = (celsius: number, unit: Unit) =>
  `${Math.round(toUnit(celsius, unit))}°`;

/** Format a UTC unix timestamp in the searched location's local time. */
export function formatLocal(
  dt: number,
  tzOffset: number,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(
    new Date((dt + tzOffset) * 1000),
  );
}

export const localTime = (dt: number, tz: number) =>
  formatLocal(dt, tz, { hour: "2-digit", minute: "2-digit", hour12: false });

export const localHour = (dt: number, tz: number) =>
  formatLocal(dt, tz, { hour: "2-digit", hour12: false }) + ":00";

export const localDay = (dt: number, tz: number) =>
  formatLocal(dt, tz, { weekday: "short" });

export const localDate = (dt: number, tz: number) =>
  formatLocal(dt, tz, { weekday: "long", day: "numeric", month: "long" });

export const iconUrl = (icon: string, size: 2 | 4 = 4) =>
  `https://openweathermap.org/img/wn/${icon}@${size}x.png`;

export const windSpeedLabel = (mps: number, unit: Unit) =>
  unit === "C" ? `${(mps * 3.6).toFixed(1)} km/h` : `${(mps * 2.237).toFixed(1)} mph`;

export const AQI_LABELS = ["", "Good", "Fair", "Moderate", "Poor", "Very poor"];

export function uvLabel(uvi: number) {
  if (uvi < 3) return "Low";
  if (uvi < 6) return "Moderate";
  if (uvi < 8) return "High";
  if (uvi < 11) return "Very high";
  return "Extreme";
}

export function windLabel(mps: number) {
  if (mps < 1.5) return "Calm";
  if (mps < 5.5) return "Light breeze";
  if (mps < 10.8) return "Fresh breeze";
  if (mps < 17.2) return "Strong wind";
  return "Gale";
}

export const compass = (deg: number) =>
  ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(deg / 45) % 8] ?? "N";

/** Visual scene key that drives the animated background. */
export type Scene =
  | "sunny"
  | "rain"
  | "snow"
  | "cloudy"
  | "night"
  | "thunder"
  | "mist";

export function sceneFor(bundle: WeatherBundle): Scene {
  const { current } = bundle;
  const isNight = current.dt < current.sunrise || current.dt > current.sunset;
  const c = current.condition.toLowerCase();
  if (c.includes("thunder")) return "thunder";
  if (c.includes("snow")) return "snow";
  if (c.includes("rain") || c.includes("drizzle")) return "rain";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "mist";
  if (isNight) return "night";
  if (c.includes("cloud")) return "cloudy";
  return "sunny";
}

/** Clothing suggestion driven by the "feels like" temperature. */
export function clothingAdvice(feelsLikeC: number, condition: string) {
  const wet = /rain|drizzle|thunder/i.test(condition);
  if (feelsLikeC <= 0)
    return "Heavy coat, thermals, gloves and a hat — exposed skin cools fast.";
  if (feelsLikeC <= 10)
    return `Warm jacket and a layer underneath${wet ? ", plus something waterproof" : ""}.`;
  if (feelsLikeC <= 18)
    return `Light jacket or a jumper${wet ? " and an umbrella" : ""} should be plenty.`;
  if (feelsLikeC <= 27)
    return `T-shirt weather${wet ? " — keep a rain shell handy" : ", maybe a light layer for the evening"}.`;
  return "Loose, light clothing, a hat and plenty of water — it's hot out there.";
}

/** Travel advice from conditions, wind and visibility. */
export function travelAdvice(bundle: WeatherBundle) {
  const { current } = bundle;
  const c = current.condition.toLowerCase();
  if (c.includes("thunder"))
    return "Storms around — avoid open ground and expect flight or transit delays.";
  if (c.includes("snow"))
    return "Snow on the roads: allow extra travel time and check services before you leave.";
  if (current.visibility < 2000)
    return "Low visibility — drive slowly with dipped headlights.";
  if (current.windSpeed > 13.8)
    return "Strong winds: high-sided vehicles and cyclists should take care.";
  if (c.includes("rain"))
    return "Wet roads mean longer stopping distances — leave a bigger gap.";
  if (current.uvi >= 8)
    return "Intense sun — plan outdoor travel for early morning or late afternoon.";
  return "Good conditions for getting around. Enjoy the trip.";
}

const FACTS = [
  "A single bolt of lightning can heat the air around it to roughly 30,000 °C — five times hotter than the sun's surface.",
  "No two snowflakes are identical, but almost all of them have exactly six sides.",
  "Raindrops aren't tear-shaped: falling drops flatten into tiny hamburger buns.",
  "The fastest recorded wind gust was 408 km/h, on Barrow Island, Australia, in 1996.",
  "A cumulus cloud can weigh over 500 tonnes — it floats because the air beneath is denser still.",
  "Sunlight takes about eight minutes to reach Earth, but a photon may spend 100,000 years escaping the sun's core.",
  "The wettest place on Earth, Mawsynram in India, receives about 11.8 metres of rain a year.",
  "Air pressure falls roughly 1 hPa for every 8 metres you climb.",
  "Thunder is the sound of air exploding outward from a lightning channel at supersonic speed.",
  "Antarctica is technically a desert: parts of it see less than 50 mm of precipitation a year.",
];

/** Deterministic per-day pick so server and client render the same fact. */
export function weatherFact(seed: number) {
  return FACTS[Math.abs(Math.floor(seed)) % FACTS.length]!;
}