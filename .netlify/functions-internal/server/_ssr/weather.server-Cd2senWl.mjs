//#region node_modules/.nitro/vite/services/ssr/assets/weather.server-Cd2senWl.js
var GEO = "https://api.openweathermap.org/geo/1.0";
var DATA = "https://api.openweathermap.org/data";
function apiKey() {
	const key = process.env.OPENWEATHER_API_KEY;
	if (!key) throw new Error("Weather service is not configured.");
	return key;
}
async function getJson(url) {
	const res = await fetch(url);
	if (!res.ok) {
		if (res.status === 401) throw new Error("Weather API key was rejected.");
		if (res.status === 404) throw new Error("Location not found.");
		if (res.status === 429) throw new Error("Too many requests — try again in a moment.");
		throw new Error(`Weather service error (${res.status}).`);
	}
	return await res.json();
}
/** City autocomplete via the geocoding API. */
async function geocode(query, limit = 5) {
	const q = query.trim();
	if (!q) return [];
	return (await getJson(`${GEO}/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${apiKey()}`)).map((r) => ({
		name: r.name,
		country: r.country,
		state: r.state,
		lat: r.lat,
		lon: r.lon
	}));
}
async function reverseGeocode(lat, lon) {
	const r = (await getJson(`${GEO}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey()}`))[0];
	return r ? {
		name: r.name,
		country: r.country,
		state: r.state,
		lat,
		lon
	} : null;
}
async function airQuality(lat, lon) {
	try {
		const row = (await getJson(`${DATA}/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey()}`))?.list?.[0];
		if (!row) return null;
		return {
			index: row.main.aqi,
			components: row.components ?? {}
		};
	} catch {
		return null;
	}
}
function condition(w) {
	return w?.[0]?.main ?? "Clear";
}
/** One Call 3.0 shape -> normalized bundle. */
async function viaOneCall(place) {
	const d = await getJson(`${DATA}/3.0/onecall?lat=${place.lat}&lon=${place.lon}&units=metric&exclude=minutely&appid=${apiKey()}`);
	const current = {
		dt: d.current.dt,
		temp: d.current.temp,
		feelsLike: d.current.feels_like,
		humidity: d.current.humidity,
		pressure: d.current.pressure,
		visibility: d.current.visibility ?? 1e4,
		windSpeed: d.current.wind_speed,
		windDeg: d.current.wind_deg,
		windGust: d.current.wind_gust,
		uvi: d.current.uvi ?? 0,
		clouds: d.current.clouds,
		sunrise: d.current.sunrise,
		sunset: d.current.sunset,
		condition: condition(d.current.weather),
		description: d.current.weather?.[0]?.description ?? "",
		icon: d.current.weather?.[0]?.icon ?? "01d"
	};
	const hourly = (d.hourly ?? []).slice(0, 24).map((h) => ({
		dt: h.dt,
		temp: h.temp,
		feelsLike: h.feels_like,
		humidity: h.humidity,
		windSpeed: h.wind_speed,
		pop: h.pop ?? 0,
		icon: h.weather?.[0]?.icon ?? "01d",
		description: h.weather?.[0]?.description ?? ""
	}));
	const daily = (d.daily ?? []).slice(0, 7).map((x) => ({
		dt: x.dt,
		min: x.temp.min,
		max: x.temp.max,
		humidity: x.humidity,
		windSpeed: x.wind_speed,
		pop: x.pop ?? 0,
		icon: x.weather?.[0]?.icon ?? "01d",
		description: x.weather?.[0]?.description ?? "",
		condition: condition(x.weather)
	}));
	const alerts = (d.alerts ?? []).map((a) => ({
		event: a.event,
		description: a.description,
		start: a.start,
		end: a.end,
		sender: a.sender_name
	}));
	return {
		location: {
			name: place.name,
			country: place.country,
			state: place.state,
			lat: place.lat,
			lon: place.lon,
			timezoneOffset: d.timezone_offset ?? 0
		},
		current,
		hourly,
		daily,
		air: await airQuality(place.lat, place.lon),
		alerts,
		source: "onecall",
		fetchedAt: Date.now()
	};
}
/** Classic 2.5 endpoints -> normalized bundle (daily aggregated from 3-hourly). */
async function viaClassic(place) {
	const base = `lat=${place.lat}&lon=${place.lon}&units=metric&appid=${apiKey()}`;
	const [now, fc] = await Promise.all([getJson(`${DATA}/2.5/weather?${base}`), getJson(`${DATA}/2.5/forecast?${base}`)]);
	const tzOffset = now.timezone ?? 0;
	const current = {
		dt: now.dt,
		temp: now.main.temp,
		feelsLike: now.main.feels_like,
		humidity: now.main.humidity,
		pressure: now.main.pressure,
		visibility: now.visibility ?? 1e4,
		windSpeed: now.wind?.speed ?? 0,
		windDeg: now.wind?.deg ?? 0,
		windGust: now.wind?.gust,
		uvi: 0,
		clouds: now.clouds?.all ?? 0,
		sunrise: now.sys?.sunrise ?? 0,
		sunset: now.sys?.sunset ?? 0,
		condition: condition(now.weather),
		description: now.weather?.[0]?.description ?? "",
		icon: now.weather?.[0]?.icon ?? "01d"
	};
	const hourly = (fc.list ?? []).slice(0, 8).map((h) => ({
		dt: h.dt,
		temp: h.main.temp,
		feelsLike: h.main.feels_like,
		humidity: h.main.humidity,
		windSpeed: h.wind?.speed ?? 0,
		pop: h.pop ?? 0,
		icon: h.weather?.[0]?.icon ?? "01d",
		description: h.weather?.[0]?.description ?? ""
	}));
	const buckets = /* @__PURE__ */ new Map();
	for (const row of fc.list ?? []) {
		const key = (/* @__PURE__ */ new Date((row.dt + tzOffset) * 1e3)).toISOString().slice(0, 10);
		const list = buckets.get(key) ?? [];
		list.push(row);
		buckets.set(key, list);
	}
	const daily = [...buckets.values()].slice(0, 7).map((rows) => {
		const mid = rows[Math.floor(rows.length / 2)];
		return {
			dt: rows[0].dt,
			min: Math.min(...rows.map((r) => r.main.temp_min)),
			max: Math.max(...rows.map((r) => r.main.temp_max)),
			humidity: Math.round(rows.reduce((s, r) => s + r.main.humidity, 0) / rows.length),
			windSpeed: Math.max(...rows.map((r) => r.wind?.speed ?? 0)),
			pop: Math.max(...rows.map((r) => r.pop ?? 0)),
			icon: mid.weather?.[0]?.icon ?? "01d",
			description: mid.weather?.[0]?.description ?? "",
			condition: condition(mid.weather)
		};
	});
	return {
		location: {
			name: place.name || now.name,
			country: place.country || now.sys?.country || "",
			state: place.state,
			lat: place.lat,
			lon: place.lon,
			timezoneOffset: tzOffset
		},
		current,
		hourly,
		daily,
		air: await airQuality(place.lat, place.lon),
		alerts: [],
		source: "classic",
		fetchedAt: Date.now()
	};
}
async function resolvePlace(input) {
	if (typeof input.lat === "number" && typeof input.lon === "number") return await reverseGeocode(input.lat, input.lon) ?? {
		name: "My location",
		country: "",
		lat: input.lat,
		lon: input.lon
	};
	const [first] = await geocode(input.city ?? "", 1);
	if (!first) throw new Error(`Couldn't find "${input.city}". Check the spelling and try again.`);
	return first;
}
/** Fetch a full weather bundle by city name or coordinates. */
async function loadWeather(input) {
	const place = await resolvePlace(input);
	try {
		return await viaOneCall(place);
	} catch {
		return await viaClassic(place);
	}
}
//#endregion
export { geocode, loadWeather };
