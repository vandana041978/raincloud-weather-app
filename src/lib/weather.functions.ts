/**
 * Thin RPC wrappers around the server-only OpenWeatherMap client.
 * Module scope contains only imports and server-function declarations.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const fetchWeather = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        city: z.string().trim().min(1).max(80).optional(),
        lat: z.number().min(-90).max(90).optional(),
        lon: z.number().min(-180).max(180).optional(),
      })
      .refine((v) => v.city || (v.lat !== undefined && v.lon !== undefined), {
        message: "Provide a city name or coordinates.",
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { loadWeather } = await import("./weather.server");
    return loadWeather(data);
  });

export const searchCities = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ query: z.string().trim().max(80) }).parse(input),
  )
  .handler(async ({ data }) => {
    if (data.query.length < 2) return [];
    const { geocode } = await import("./weather.server");
    try {
      return await geocode(data.query, 5);
    } catch {
      return [];
    }
  });