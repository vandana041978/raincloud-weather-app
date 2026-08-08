/**
 * Shared, browser-safe weather types.
 * Both the server functions and the UI import from this module.
 */

export interface WeatherLocation {
  name: string;
  country: string;
  state?: string | undefined;
  lat: number;
  lon: number;
  /** Shift in seconds from UTC for the searched location. */
  timezoneOffset: number;
}

export interface CurrentWeather {
  dt: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  /** metres */
  visibility: number;
  windSpeed: number;
  windDeg: number;
  windGust?: number | undefined;
  uvi: number;
  clouds: number;
  sunrise: number;
  sunset: number;
  condition: string;
  description: string;
  icon: string;
}

export interface HourlyPoint {
  dt: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pop: number;
  icon: string;
  description: string;
}

export interface DailyPoint {
  dt: number;
  min: number;
  max: number;
  humidity: number;
  windSpeed: number;
  pop: number;
  icon: string;
  description: string;
  condition: string;
}

export interface AirQuality {
  /** 1 (Good) – 5 (Very Poor) */
  index: number;
  components: Record<string, number>;
}

export interface WeatherAlert {
  event: string;
  description: string;
  start: number;
  end: number;
  sender?: string | undefined;
}

export interface WeatherBundle {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  air: AirQuality | null;
  alerts: WeatherAlert[];
  /** which upstream data set produced this bundle */
  source: "onecall" | "classic";
  fetchedAt: number;
}

export interface CitySuggestion {
  name: string;
  country: string;
  state?: string | undefined;
  lat: number;
  lon: number;
}