import { n as createServerFn } from "./server-XwFdOTTz.mjs";
import { t as createServerRpc } from "./createServerRpc-BSIAthD8.mjs";
import { n as objectType, r as stringType, t as numberType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/weather.functions-Dz6ylQvU.js
/**
* Thin RPC wrappers around the server-only OpenWeatherMap client.
* Module scope contains only imports and server-function declarations.
*/
var fetchWeather_createServerFn_handler = createServerRpc({
	id: "8c27b52882c645ff85a720428c1b94a08838c748839bcadc3cbfcce72200765c",
	name: "fetchWeather",
	filename: "src/lib/weather.functions.ts"
}, (opts) => fetchWeather.__executeServer(opts));
var fetchWeather = createServerFn({ method: "POST" }).validator((input) => objectType({
	city: stringType().trim().min(1).max(80).optional(),
	lat: numberType().min(-90).max(90).optional(),
	lon: numberType().min(-180).max(180).optional()
}).refine((v) => v.city || v.lat !== void 0 && v.lon !== void 0, { message: "Provide a city name or coordinates." }).parse(input)).handler(fetchWeather_createServerFn_handler, async ({ data }) => {
	const { loadWeather } = await import("./weather.server-Cd2senWl.mjs");
	return loadWeather(data);
});
var searchCities_createServerFn_handler = createServerRpc({
	id: "3d674af5ec5684fa2806e6a348f3f1f40dfb27326a29b1080c70b3b502b33f5f",
	name: "searchCities",
	filename: "src/lib/weather.functions.ts"
}, (opts) => searchCities.__executeServer(opts));
var searchCities = createServerFn({ method: "POST" }).validator((input) => objectType({ query: stringType().trim().max(80) }).parse(input)).handler(searchCities_createServerFn_handler, async ({ data }) => {
	if (data.query.length < 2) return [];
	const { geocode } = await import("./weather.server-Cd2senWl.mjs");
	try {
		return await geocode(data.query, 5);
	} catch {
		return [];
	}
});
//#endregion
export { fetchWeather_createServerFn_handler, searchCities_createServerFn_handler };
