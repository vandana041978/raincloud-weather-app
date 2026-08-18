import { r as __toESM } from "../_runtime.mjs";
import { i as require_react, r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { P as isRedirect, v as useRouter, y as ClientOnly } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./server-XwFdOTTz.mjs";
import { n as objectType, r as stringType, t as numberType } from "../_libs/zod.mjs";
import { _ as Lightbulb, a as Sunset, b as Droplets, c as Star, d as RefreshCw, f as Plane, g as LoaderCircle, h as LocateFixed, i as TriangleAlert, l as Shirt, m as MapPin, n as Wind, o as Sunrise, p as Moon, r as Waves, s as Sun, t as X, u as Search, v as Gauge, x as CloudSun, y as Eye } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D0dlvI00.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getNearbyPlaces = createServerFn({ method: "GET" }).validator((input) => input).handler(createSsrRpc("6e651eb38ef3e8d82919e1b499b29279adcd73b23082e0b69e58df1ad86662b7"));
function getPlaceIcon(type) {
	switch (type) {
		case "College": return "🎓";
		case "Temple": return "🛕";
		case "Museum": return "🏛️";
		case "Art Gallery": return "🎨";
		case "Historical Landmark": return "🏛️";
		case "Castle": return "🏰";
		case "Park": return "🌳";
		case "Tourist Attraction": return "📍";
		default: return "📍";
	}
}
function getDistanceText(distance) {
	if (distance < 1) return `${Math.round(distance * 1e3)} m`;
	return `${distance.toFixed(1)} km`;
}
function NearbyPlaces({ data }) {
	const [places, setPlaces] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function loadPlaces() {
			try {
				setLoading(true);
				setError("");
				console.log("🌍 Loading nearby tourist places...");
				console.log("📍 Location:", data.location.lat, data.location.lon);
				const result = await getNearbyPlaces({ data: {
					latitude: data.location.lat,
					longitude: data.location.lon,
					radius: 5e4
				} });
				console.log("📦 PLACES RECEIVED IN FRONTEND:", result.length);
				console.log("📍 RECEIVED PLACES:", result);
				if (!cancelled) setPlaces(result);
			} catch (err) {
				console.error("❌ Nearby places error:", err);
				if (!cancelled) setError("Unable to find nearby tourist places.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		loadPlaces();
		return () => {
			cancelled = true;
		};
	}, [data.location.lat, data.location.lon]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold",
						children: "📍 Nearby Tourist Places"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: ["Famous places near ", data.location.name]
					}),
					!loading && !error && places.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-sky-300",
						children: [
							"⭐ ",
							places.length,
							" tourist places found within 50 km"
						]
					})
				]
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "🔎 Finding nearby tourist places..."
			}),
			!loading && error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "py-10 text-center text-sm text-red-400",
				children: ["⚠️ ", error]
			}),
			!loading && !error && places.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-10 text-center text-sm text-muted-foreground",
				children: "No tourist places found nearby."
			}),
			!loading && !error && places.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: places.map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-3 text-3xl",
							children: getPlaceIcon(place.type)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "line-clamp-2 text-sm font-semibold",
							children: place.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: place.type
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs",
							children: ["📏 ", getDistanceText(place.distance)]
						}),
						place.rating !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs",
							children: ["⭐ ", place.rating.toFixed(1)]
						}),
						place.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 line-clamp-2 text-xs text-muted-foreground",
							children: place.address
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: place.googleMapsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:bg-white/10",
								children: "🧭 Directions"
							}), place.website && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: place.website,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:bg-white/10",
								children: "🌐 Website"
							})]
						})
					]
				}, place.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-[10px] text-muted-foreground",
				children: "Places provided by Google Maps Platform."
			})
		]
	});
}
function matchesInterest$1(place, interest) {
	const type = place.type.toLowerCase();
	const name = place.name.toLowerCase();
	switch (interest) {
		case "Temple": return type.includes("temple") || type.includes("shrine") || name.includes("temple") || name.includes("mandir") || name.includes("devasthanam") || name.includes("devalayam");
		case "Nature": return type.includes("park") || type.includes("garden") || type.includes("nature");
		case "Museum": return type.includes("museum");
		case "History": return type.includes("historical") || type.includes("castle") || type.includes("landmark");
		case "Art": return type.includes("art") || type.includes("gallery");
		case "Photography": return type.includes("park") || type.includes("garden") || type.includes("historical") || type.includes("castle") || type.includes("landmark");
		default: return false;
	}
}
function isIndoorPlace(place) {
	const type = place.type.toLowerCase();
	return type.includes("museum") || type.includes("art gallery") || type.includes("gallery");
}
function isOutdoorPlace(place) {
	const type = place.type.toLowerCase();
	return type.includes("park") || type.includes("garden") || type.includes("temple") || type.includes("castle") || type.includes("historical") || type.includes("tourist") || type.includes("landmark");
}
function getWeatherCategory(weather, dayIndex) {
	const day = weather.daily?.[dayIndex] ?? weather.daily?.[0];
	if (!day) return "good";
	const description = String(day.description ?? "").toLowerCase();
	const rainProbability = Number(day.pop ?? 0);
	const windSpeed = Number(day.windSpeed ?? 0);
	const temperature = Number(day.max ?? 0);
	if (rainProbability >= .5 || description.includes("rain") || description.includes("drizzle") || description.includes("storm")) return "rain";
	if (windSpeed >= 12) return "wind";
	if (temperature >= 35) return "hot";
	return "good";
}
function getWeatherAdvice$1(category) {
	switch (category) {
		case "rain": return "🌧️ Rain is likely. Indoor attractions are prioritized.";
		case "wind": return "🌬️ Strong winds are possible. Safer sheltered locations are prioritized.";
		case "hot": return "🌡️ It may be hot. Outdoor activities are better during morning or evening.";
		default: return "☀️ Good conditions for sightseeing and outdoor activities.";
	}
}
function sortForWeather(places, category) {
	if (category === "rain") return [...places.filter(isIndoorPlace), ...places.filter((place) => !isIndoorPlace(place))];
	if (category === "wind") return [
		...places.filter(isIndoorPlace),
		...places.filter((place) => !isOutdoorPlace(place) && !isIndoorPlace(place)),
		...places.filter(isOutdoorPlace)
	];
	if (category === "hot") return [...places.filter((place) => !isIndoorPlace(place)), ...places.filter(isIndoorPlace)];
	return [...places.filter(isOutdoorPlace), ...places.filter((place) => !isOutdoorPlace(place))];
}
function rankPlacesByPopularity(places) {
	return [...places].sort((a, b) => {
		const ratingA = a.rating ?? 0;
		const ratingB = b.rating ?? 0;
		const ratingScoreA = ratingA * 20;
		const ratingScoreB = ratingB * 20;
		const distanceA = Math.max(0, 10 - a.distance);
		const distanceB = Math.max(0, 10 - b.distance);
		const scoreA = ratingScoreA + distanceA;
		return ratingScoreB + distanceB - scoreA;
	});
}
function createSchedule(places, weatherCategory) {
	const times = [
		"🌅 09:00 AM",
		"☀️ 01:00 PM",
		"🌇 05:30 PM",
		"🌙 07:30 PM"
	];
	return places.map((place, index) => {
		let weatherMessage = "☀️ Good weather";
		if (weatherCategory === "rain") weatherMessage = "🌧️ Rain expected";
		if (weatherCategory === "wind") weatherMessage = "🌬️ Windy conditions";
		if (weatherCategory === "hot") weatherMessage = "🌡️ Hot weather";
		return {
			placeId: place.id,
			time: times[index] ?? "🕐 Flexible time",
			weather: weatherMessage
		};
	});
}
function generateItinerary(places, days, selectedInterests, weather, travelStyle) {
	let matchingPlaces = selectedInterests.length === 0 ? places : places.filter((place) => selectedInterests.some((interest) => matchesInterest$1(place, interest)));
	if (matchingPlaces.length === 0) matchingPlaces = places;
	const rankedPlaces = rankPlacesByPopularity(matchingPlaces);
	const placesPerDay = travelStyle === "relaxed" ? 2 : travelStyle === "balanced" ? 3 : 4;
	const result = [];
	for (let day = 0; day < days; day++) {
		const weatherCategory = getWeatherCategory(weather, day);
		let sortedPlaces = sortForWeather(rankedPlaces, weatherCategory);
		sortedPlaces = Array.from(new Map(sortedPlaces.map((place) => [place.id, place])).values());
		const start = day * placesPerDay;
		const selectedPlaces = sortedPlaces.slice(start, start + placesPerDay);
		const schedule = createSchedule(selectedPlaces, weatherCategory);
		result.push({
			day: day + 1,
			places: selectedPlaces,
			schedule,
			weatherCategory,
			advice: getWeatherAdvice$1(weatherCategory)
		});
	}
	return result;
}
var interests = [
	{
		value: "Temple",
		label: "Temples",
		icon: "🛕"
	},
	{
		value: "Nature",
		label: "Nature",
		icon: "🌳"
	},
	{
		value: "Museum",
		label: "Museums",
		icon: "🏛️"
	},
	{
		value: "History",
		label: "Historical",
		icon: "🏰"
	},
	{
		value: "Art",
		label: "Art",
		icon: "🎨"
	},
	{
		value: "Photography",
		label: "Photography",
		icon: "📸"
	}
];
function matchesInterest(place, interest) {
	const type = String(place.type ?? "").toLowerCase();
	const name = String(place.name ?? "").toLowerCase();
	switch (interest) {
		case "Temple": return type.includes("temple") || type.includes("shrine") || name.includes("temple") || name.includes("mandir") || name.includes("devasthanam") || name.includes("devalayam");
		case "Nature": return type.includes("park") || type.includes("garden") || type.includes("nature");
		case "Museum": return type.includes("museum");
		case "History": return type.includes("historical") || type.includes("castle") || type.includes("landmark");
		case "Art": return type.includes("art") || type.includes("gallery");
		case "Photography": return type.includes("park") || type.includes("garden") || type.includes("historical") || type.includes("castle") || type.includes("landmark");
		default: return false;
	}
}
function getIcon(type) {
	const value = type.toLowerCase();
	if (value.includes("temple")) return "🛕";
	if (value.includes("shrine")) return "🛕";
	if (value.includes("park")) return "🌳";
	if (value.includes("garden")) return "🌳";
	if (value.includes("museum")) return "🏛️";
	if (value.includes("art")) return "🎨";
	if (value.includes("gallery")) return "🎨";
	if (value.includes("castle")) return "🏰";
	if (value.includes("historical")) return "🏛️";
	return "📍";
}
function getWeatherAdvice(data) {
	const description = data.current?.description?.toLowerCase() ?? "";
	if (description.includes("rain") || description.includes("drizzle") || description.includes("storm")) return {
		title: "🌧️ Rain-aware plan",
		message: "Rain may affect outdoor activities. Indoor attractions are prioritized where possible."
	};
	if (description.includes("cloud")) return {
		title: "☁️ Comfortable outdoor weather",
		message: "Cloudy conditions are suitable for sightseeing and photography."
	};
	if (description.includes("clear") || description.includes("sun")) return {
		title: "☀️ Great outdoor conditions",
		message: "Clear weather is suitable for parks, temples, landmarks and photography."
	};
	return {
		title: "🌤️ Balanced itinerary",
		message: "The itinerary is organized around your selected interests and nearby places."
	};
}
function TripPlanner({ data }) {
	const [days, setDays] = (0, import_react.useState)(2);
	const [budget, setBudget] = (0, import_react.useState)(2e3);
	const [travelStyle, setTravelStyle] = (0, import_react.useState)("balanced");
	const [selectedInterests, setSelectedInterests] = (0, import_react.useState)(["Nature", "Photography"]);
	const [places, setPlaces] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [generated, setGenerated] = (0, import_react.useState)(false);
	const weatherAdvice = getWeatherAdvice(data);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function loadPlaces() {
			try {
				setLoading(true);
				const result = await getNearbyPlaces({ data: {
					latitude: data.location.lat,
					longitude: data.location.lon,
					radius: 5e4
				} });
				if (!cancelled) setPlaces(result);
			} catch (error) {
				console.error("Trip planner places error:", error);
				if (!cancelled) setPlaces([]);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		loadPlaces();
		return () => {
			cancelled = true;
		};
	}, [data.location.lat, data.location.lon]);
	const toggleInterest = (interest) => {
		setSelectedInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]);
		setGenerated(false);
	};
	const recommendedPlaces = (0, import_react.useMemo)(() => {
		if (selectedInterests.length === 0) return places;
		const matched = places.filter((place) => selectedInterests.some((interest) => matchesInterest(place, interest)));
		return matched.length > 0 ? matched : places;
	}, [places, selectedInterests]);
	const itinerary = (0, import_react.useMemo)(() => {
		if (!generated || recommendedPlaces.length === 0) return [];
		return generateItinerary(recommendedPlaces, days, selectedInterests, data, travelStyle);
	}, [
		generated,
		recommendedPlaces,
		days,
		selectedInterests,
		data,
		travelStyle
	]);
	const budgetEstimate = (0, import_react.useMemo)(() => {
		const totalPlaces = itinerary.reduce((total, day) => total + day.places.length, 0);
		const transport = totalPlaces * 100;
		const food = days * 300;
		const entryFees = totalPlaces * 50;
		const total = transport + food + entryFees;
		return {
			transport,
			food,
			entryFees,
			total,
			remaining: budget - total
		};
	}, [
		itinerary,
		days,
		budget
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass mt-6 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-3xl",
						children: "🧳"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "Smart Trip Planner"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["Create a personalized trip around ", data.location.name]
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-2 block text-sm font-medium",
					children: "📅 Trip duration"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: days,
					onChange: (event) => {
						setDays(Number(event.target.value));
						setGenerated(false);
					},
					className: "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm outline-none",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: 1,
							children: "1 Day"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: 2,
							children: "2 Days"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: 3,
							children: "3 Days"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: 4,
							children: "4 Days"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: 5,
							children: "5 Days"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-3 block text-sm font-medium",
					children: "🧳 Travel Style"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setTravelStyle("relaxed");
								setGenerated(false);
							},
							className: `rounded-xl border p-4 text-left transition ${travelStyle === "relaxed" ? "border-sky-400/50 bg-sky-400/20" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl",
									children: "🧘"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-sm font-semibold",
									children: "Relaxed"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "1–2 places per day"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setTravelStyle("balanced");
								setGenerated(false);
							},
							className: `rounded-xl border p-4 text-left transition ${travelStyle === "balanced" ? "border-sky-400/50 bg-sky-400/20" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl",
									children: "⚖️"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-sm font-semibold",
									children: "Balanced"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "3 places per day"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setTravelStyle("adventure");
								setGenerated(false);
							},
							className: `rounded-xl border p-4 text-left transition ${travelStyle === "adventure" ? "border-sky-400/50 bg-sky-400/20" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl",
									children: "🏃"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-sm font-semibold",
									children: "Adventure"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "4+ places per day"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-2 block text-sm font-medium",
					children: "💰 Trip Budget"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "number",
					min: "0",
					value: budget,
					onChange: (event) => {
						setBudget(Number(event.target.value));
						setGenerated(false);
					},
					className: "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm outline-none",
					placeholder: "Enter your budget"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mb-3 block text-sm font-medium",
					children: "❤️ What are you interested in?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
					children: interests.map((interest) => {
						const selected = selectedInterests.includes(interest.value);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => toggleInterest(interest.value),
							className: `rounded-xl border p-3 text-left text-sm transition ${selected ? "border-sky-400/50 bg-sky-400/20" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mr-2",
								children: interest.icon
							}), interest.label]
						}, interest.value);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: weatherAdvice.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: weatherAdvice.message
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: loading || places.length === 0,
				onClick: () => setGenerated(true),
				className: "w-full rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50",
				children: loading ? "🔎 Finding nearby places..." : "✨ Generate My Trip"
			}),
			generated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "text-base font-semibold",
							children: [
								"🗺️ Your ",
								days,
								"-Day Trip"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: [
								"Personalized itinerary for",
								" ",
								data.location.name
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-sm font-semibold",
							children: "💰 Budget Estimate"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 space-y-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🚗 Transport" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹", budgetEstimate.transport] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🍴 Food" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹", budgetEstimate.food] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🎟️ Entry fees" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹", budgetEstimate.entryFees] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "💰 Estimated total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹", budgetEstimate.total] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Your budget" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["₹", budget] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: budgetEstimate.remaining >= 0 ? "font-semibold text-green-400" : "font-semibold text-red-400",
									children: budgetEstimate.remaining >= 0 ? `✅ ₹${budgetEstimate.remaining} remaining` : `⚠️ ₹${Math.abs(budgetEstimate.remaining)} over budget`
								})
							]
						})]
					}),
					itinerary.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Not enough matching places were found."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-5",
						children: itinerary.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-white/10 bg-white/[0.04] p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "mb-2 font-semibold",
									children: ["📅 Day ", day.day]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-4 text-xs text-muted-foreground",
									children: day.advice
								}),
								day.places.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "No additional places found for this day."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3",
									children: day.places.map((place, index) => {
										const scheduleItem = day.schedule?.[index];
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-3 rounded-xl border border-white/10 bg-black/10 p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-2xl",
												children: getIcon(place.type)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs font-medium text-sky-300",
														children: scheduleItem?.time ?? "🕐 Flexible time"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-1 text-xs text-muted-foreground",
														children: typeof scheduleItem?.weather === "string" ? scheduleItem.weather : "🌤️ Weather unavailable"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
														className: "mt-1 text-sm font-semibold",
														children: place.name
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "mt-1 text-xs text-muted-foreground",
														children: [place.type, place.distance !== void 0 && ` • ${place.distance.toFixed(1)} km away`]
													}),
													place.rating !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "mt-1 text-xs",
														children: [
															"⭐",
															" ",
															place.rating.toFixed(1)
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
														href: place.googleMapsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
														target: "_blank",
														rel: "noopener noreferrer",
														className: "mt-2 inline-block text-xs text-sky-300 hover:underline",
														children: "🧭 Get Directions →"
													})
												]
											})]
										}, place.id);
									})
								})
							]
						}, day.day))
					})
				]
			})
		]
	});
}
/**
* Thin RPC wrappers around the server-only OpenWeatherMap client.
* Module scope contains only imports and server-function declarations.
*/
var fetchWeather = createServerFn({ method: "POST" }).validator((input) => objectType({
	city: stringType().trim().min(1).max(80).optional(),
	lat: numberType().min(-90).max(90).optional(),
	lon: numberType().min(-180).max(180).optional()
}).refine((v) => v.city || v.lat !== void 0 && v.lon !== void 0, { message: "Provide a city name or coordinates." }).parse(input)).handler(createSsrRpc("8c27b52882c645ff85a720428c1b94a08838c748839bcadc3cbfcce72200765c"));
var searchCities = createServerFn({ method: "POST" }).validator((input) => objectType({ query: stringType().trim().max(80) }).parse(input)).handler(createSsrRpc("3d674af5ec5684fa2806e6a348f3f1f40dfb27326a29b1080c70b3b502b33f5f"));
/**
* Local Storage helpers for favourites, recent searches and user preferences.
* All functions are safe to call during SSR (they no-op without `window`).
*/
var FAVORITES = "wx:favorites";
var RECENTS = "wx:recents";
var PREFS = "wx:prefs";
var hasWindow = () => typeof window !== "undefined";
function read(key, fallback) {
	if (!hasWindow()) return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}
function write(key, value) {
	if (!hasWindow()) return;
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
var sameCity = (a, b) => a.name === b.name && a.country === b.country;
var getFavorites = () => read(FAVORITES, []);
function toggleFavorite(city) {
	const list = getFavorites();
	const next = list.some((c) => sameCity(c, city)) ? list.filter((c) => !sameCity(c, city)) : [city, ...list].slice(0, 12);
	write(FAVORITES, next);
	return next;
}
var isFavorite = (city, list = getFavorites()) => list.some((c) => sameCity(c, city));
var getRecents = () => read(RECENTS, []);
function pushRecent(city) {
	const next = [city, ...getRecents().filter((c) => !sameCity(c, city))].slice(0, 8);
	write(RECENTS, next);
	return next;
}
function clearRecents() {
	write(RECENTS, []);
	return [];
}
var getPrefs = () => read(PREFS, {
	unit: "C",
	theme: "dark"
});
function savePrefs(patch) {
	write(PREFS, {
		...getPrefs(),
		...patch
	});
}
/**
* Search header: debounced city autocomplete, geolocation, unit and theme
* toggles, plus recent-search and favourite chips.
*/
function SearchBar({ onSelectCity, onSelectCoords, onUseLocation, locating, unit, onToggleUnit, theme, onToggleTheme, recents, favorites, onClearRecents }) {
	const lookup = useServerFn(searchCities);
	const [query, setQuery] = (0, import_react.useState)("");
	const [options, setOptions] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [active, setActive] = (0, import_react.useState)(-1);
	const boxRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const q = query.trim();
		if (q.length < 2) {
			setOptions([]);
			return;
		}
		let cancelled = false;
		const id = window.setTimeout(async () => {
			const rows = await lookup({ data: { query: q } });
			if (!cancelled) {
				setOptions(rows);
				setOpen(true);
				setActive(-1);
			}
		}, 300);
		return () => {
			cancelled = true;
			window.clearTimeout(id);
		};
	}, [query, lookup]);
	(0, import_react.useEffect)(() => {
		const onDocClick = (e) => {
			if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", onDocClick);
		return () => document.removeEventListener("mousedown", onDocClick);
	}, []);
	const choose = (c) => {
		setQuery("");
		setOpen(false);
		onSelectCoords(c.lat, c.lon);
	};
	const submit = (e) => {
		e.preventDefault();
		const picked = active >= 0 ? options[active] : void 0;
		if (picked) return choose(picked);
		if (query.trim()) {
			onSelectCity(query.trim());
			setQuery("");
			setOpen(false);
		}
	};
	const onKeyDown = (e) => {
		if (!open || options.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive((i) => (i + 1) % options.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive((i) => (i - 1 + options.length) % options.length);
		} else if (e.key === "Escape") setOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				role: "search",
				onSubmit: submit,
				className: "relative min-w-0 flex-1",
				ref: boxRef,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass flex items-center gap-2 px-4 py-2.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							className: "h-5 w-5 shrink-0 scene-muted",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: query,
							onChange: (e) => setQuery(e.target.value),
							onKeyDown,
							onFocus: () => options.length && setOpen(true),
							placeholder: "Search any city…",
							"aria-label": "Search weather by city",
							role: "combobox",
							"aria-expanded": open,
							"aria-controls": "city-options",
							"aria-autocomplete": "list",
							autoComplete: "off",
							className: "min-w-0 flex-1 bg-transparent text-base scene-text outline-none placeholder:opacity-60"
						}),
						query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setQuery(""),
							"aria-label": "Clear search",
							className: "shrink-0 rounded-full p-1 scene-muted transition hover:bg-white/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})
					]
				}), open && options.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					id: "city-options",
					role: "listbox",
					className: "glass absolute z-30 mt-2 w-full overflow-hidden p-1",
					children: options.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						role: "option",
						"aria-selected": i === active,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onMouseEnter: () => setActive(i),
							onClick: () => choose(c),
							className: `flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm scene-text transition ${i === active ? "bg-white/40 dark:bg-white/10" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
								className: "h-4 w-4 shrink-0 opacity-70",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "truncate",
								children: [
									c.name,
									c.state ? `, ${c.state}` : "",
									" · ",
									c.country
								]
							})]
						})
					}, `${c.lat}-${c.lon}-${i}`))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onUseLocation,
						"aria-label": "Use my location",
						className: "glass glass-hover flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium scene-text",
						children: [locating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "h-5 w-5 animate-spin",
							"aria-hidden": "true"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, {
							className: "h-5 w-5",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "My location"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onToggleUnit,
						"aria-label": `Switch to ${unit === "C" ? "Fahrenheit" : "Celsius"}`,
						className: "glass glass-hover px-3.5 py-2.5 text-sm font-semibold scene-text",
						children: ["°", unit]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onToggleTheme,
						"aria-label": `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
						className: "glass glass-hover p-2.5 scene-text",
						children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
							className: "h-5 w-5",
							"aria-hidden": "true"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {
							className: "h-5 w-5",
							"aria-hidden": "true"
						})
					})
				]
			})]
		}), (favorites.length > 0 || recents.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				favorites.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onSelectCoords(c.lat, c.lon),
					className: "glass glass-hover flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium scene-text",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
						className: "h-3.5 w-3.5 fill-current text-amber-400",
						"aria-hidden": "true"
					}), c.name]
				}, `f-${c.lat}-${c.lon}`)),
				recents.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onSelectCoords(c.lat, c.lon),
					className: "glass glass-hover px-3 py-1.5 text-xs scene-muted",
					children: c.name
				}, `r-${c.lat}-${c.lon}`)),
				recents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClearRecents,
					className: "px-2 py-1.5 text-xs underline-offset-4 scene-muted hover:underline",
					children: "Clear history"
				})
			]
		})]
	});
}
/** Convert a Celsius API value to the active display unit. */
var toUnit = (celsius, unit) => unit === "C" ? celsius : celsius * 1.8 + 32;
var formatTemp = (celsius, unit) => `${Math.round(toUnit(celsius, unit))}°`;
/** Format a UTC unix timestamp in the searched location's local time. */
function formatLocal(dt, tzOffset, options) {
	return new Intl.DateTimeFormat("en-GB", {
		...options,
		timeZone: "UTC"
	}).format(/* @__PURE__ */ new Date((dt + tzOffset) * 1e3));
}
var localTime = (dt, tz) => formatLocal(dt, tz, {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false
});
var localHour = (dt, tz) => formatLocal(dt, tz, {
	hour: "2-digit",
	hour12: false
}) + ":00";
var localDay = (dt, tz) => formatLocal(dt, tz, { weekday: "short" });
var localDate = (dt, tz) => formatLocal(dt, tz, {
	weekday: "long",
	day: "numeric",
	month: "long"
});
var iconUrl = (icon, size = 4) => `https://openweathermap.org/img/wn/${icon}@${size}x.png`;
var windSpeedLabel = (mps, unit) => unit === "C" ? `${(mps * 3.6).toFixed(1)} km/h` : `${(mps * 2.237).toFixed(1)} mph`;
var AQI_LABELS = [
	"",
	"Good",
	"Fair",
	"Moderate",
	"Poor",
	"Very poor"
];
function uvLabel(uvi) {
	if (uvi < 3) return "Low";
	if (uvi < 6) return "Moderate";
	if (uvi < 8) return "High";
	if (uvi < 11) return "Very high";
	return "Extreme";
}
function windLabel(mps) {
	if (mps < 1.5) return "Calm";
	if (mps < 5.5) return "Light breeze";
	if (mps < 10.8) return "Fresh breeze";
	if (mps < 17.2) return "Strong wind";
	return "Gale";
}
var compass = (deg) => [
	"N",
	"NE",
	"E",
	"SE",
	"S",
	"SW",
	"W",
	"NW"
][Math.round(deg / 45) % 8] ?? "N";
/** Clothing suggestion driven by the "feels like" temperature. */
function clothingAdvice(feelsLikeC, condition) {
	const wet = /rain|drizzle|thunder/i.test(condition);
	if (feelsLikeC <= 0) return "Heavy coat, thermals, gloves and a hat — exposed skin cools fast.";
	if (feelsLikeC <= 10) return `Warm jacket and a layer underneath${wet ? ", plus something waterproof" : ""}.`;
	if (feelsLikeC <= 18) return `Light jacket or a jumper${wet ? " and an umbrella" : ""} should be plenty.`;
	if (feelsLikeC <= 27) return `T-shirt weather${wet ? " — keep a rain shell handy" : ", maybe a light layer for the evening"}.`;
	return "Loose, light clothing, a hat and plenty of water — it's hot out there.";
}
/** Travel advice from conditions, wind and visibility. */
function travelAdvice(bundle) {
	const { current } = bundle;
	const c = current.condition.toLowerCase();
	if (c.includes("thunder")) return "Storms around — avoid open ground and expect flight or transit delays.";
	if (c.includes("snow")) return "Snow on the roads: allow extra travel time and check services before you leave.";
	if (current.visibility < 2e3) return "Low visibility — drive slowly with dipped headlights.";
	if (current.windSpeed > 13.8) return "Strong winds: high-sided vehicles and cyclists should take care.";
	if (c.includes("rain")) return "Wet roads mean longer stopping distances — leave a bigger gap.";
	if (current.uvi >= 8) return "Intense sun — plan outdoor travel for early morning or late afternoon.";
	return "Good conditions for getting around. Enjoy the trip.";
}
var FACTS = [
	"A single bolt of lightning can heat the air around it to roughly 30,000 °C — five times hotter than the sun's surface.",
	"No two snowflakes are identical, but almost all of them have exactly six sides.",
	"Raindrops aren't tear-shaped: falling drops flatten into tiny hamburger buns.",
	"The fastest recorded wind gust was 408 km/h, on Barrow Island, Australia, in 1996.",
	"A cumulus cloud can weigh over 500 tonnes — it floats because the air beneath is denser still.",
	"Sunlight takes about eight minutes to reach Earth, but a photon may spend 100,000 years escaping the sun's core.",
	"The wettest place on Earth, Mawsynram in India, receives about 11.8 metres of rain a year.",
	"Air pressure falls roughly 1 hPa for every 8 metres you climb.",
	"Thunder is the sound of air exploding outward from a lightning channel at supersonic speed.",
	"Antarctica is technically a desert: parts of it see less than 50 mm of precipitation a year."
];
/** Deterministic per-day pick so server and client render the same fact. */
function weatherFact(seed) {
	return FACTS[Math.abs(Math.floor(seed)) % FACTS.length];
}
/**
* Hero card: place, local date/time, big temperature gauge, condition,
* sunrise/sunset and the favourite toggle.
*/
/** Animated radial gauge: -10 °C → 45 °C mapped onto a 270° arc. */
function TempGauge({ celsius, label }) {
	const pct = Math.min(1, Math.max(0, (celsius + 10) / 55));
	const radius = 66;
	const circumference = 2 * Math.PI * radius;
	const arc = circumference * .75;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-44 w-44 shrink-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 160 160",
			className: "h-full w-full -rotate-[225deg]",
			"aria-hidden": "true",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "80",
					cy: "80",
					r: radius,
					fill: "none",
					strokeWidth: "12",
					strokeLinecap: "round",
					className: "stroke-current opacity-20",
					strokeDasharray: `${arc} ${circumference}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "80",
					cy: "80",
					r: radius,
					fill: "none",
					strokeWidth: "12",
					strokeLinecap: "round",
					stroke: "url(#tempGrad)",
					strokeDasharray: `${arc * pct} ${circumference}`,
					style: { transition: "stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "tempGrad",
					x1: "0",
					y1: "0",
					x2: "1",
					y2: "1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "oklch(0.7 0.15 230)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "55%",
							stopColor: "oklch(0.8 0.15 150)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "oklch(0.72 0.19 40)"
						})
					]
				}) })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute inset-0 flex flex-col items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-5xl font-semibold tracking-tight scene-text",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs uppercase tracking-widest scene-muted",
				children: "now"
			})]
		})]
	});
}
function CurrentPanel({ data, unit, favorite, onToggleFavorite }) {
	const { current, location } = data;
	const tz = location.timezoneOffset;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass animate-rise p-6 sm:p-8",
		"aria-labelledby": "current-heading",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					id: "current-heading",
					className: "truncate text-3xl font-semibold scene-text sm:text-4xl",
					children: [location.name, location.country ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-base font-normal scene-muted",
						children: location.country
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm scene-muted",
					children: [
						localDate(current.dt, tz),
						" · ",
						localTime(current.dt, tz),
						" local time"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onToggleFavorite,
				"aria-pressed": favorite,
				"aria-label": favorite ? "Remove from favourites" : "Save to favourites",
				className: "glass glass-hover shrink-0 p-2.5 scene-text",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
					className: `h-5 w-5 ${favorite ? "fill-amber-400 text-amber-400" : ""}`,
					"aria-hidden": "true"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 flex flex-wrap items-center gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TempGauge, {
				celsius: current.temp,
				label: formatTemp(current.temp, unit)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: iconUrl(current.icon),
					alt: "",
					loading: "lazy",
					width: 112,
					height: 112,
					className: "h-24 w-24 drop-shadow-lg sm:h-28 sm:w-28"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xl font-medium capitalize scene-text",
							children: current.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm scene-muted",
							children: [
								"Feels like ",
								formatTemp(current.feelsLike, unit),
								" ·",
								" ",
								Math.round(toUnit(current.temp, unit)),
								"°",
								unit
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-4 text-sm scene-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sunrise, {
									className: "h-4 w-4 text-amber-400",
									"aria-hidden": "true"
								}), current.sunrise ? localTime(current.sunrise, tz) : "—"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sunset, {
									className: "h-4 w-4 text-orange-400",
									"aria-hidden": "true"
								}), current.sunset ? localTime(current.sunset, tz) : "—"]
							})]
						})
					]
				})]
			})]
		})]
	});
}
/**
* Detail metrics with animated progress bars for humidity, wind, UV and AQI,
* plus plain readouts for pressure and visibility.
*/
function Meter({ icon, title, value, caption, percent, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass glass-hover p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm scene-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0",
					"aria-hidden": "true",
					children: icon
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: title
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-2xl font-semibold scene-text",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10",
				role: "progressbar",
				"aria-label": title,
				"aria-valuenow": Math.round(percent),
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `h-full rounded-full bg-gradient-to-r ${tone}`,
					style: {
						width: `${Math.min(100, Math.max(2, percent))}%`,
						transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)"
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs scene-muted",
				children: caption
			})
		]
	});
}
function Stat({ icon, title, value, caption }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass glass-hover p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm scene-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0",
					"aria-hidden": "true",
					children: icon
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: title
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-2xl font-semibold scene-text",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs scene-muted",
				children: caption
			})
		]
	});
}
function MetricsGrid({ data, unit }) {
	const { current, air } = data;
	const uvKnown = data.source === "onecall";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Weather details",
		className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, { className: "h-4 w-4" }),
				title: "Humidity",
				value: `${current.humidity}%`,
				caption: current.humidity > 70 ? "Muggy air" : current.humidity < 30 ? "Very dry" : "Comfortable",
				percent: current.humidity,
				tone: "from-sky-400 to-cyan-300"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wind, { className: "h-4 w-4" }),
				title: "Wind",
				value: windSpeedLabel(current.windSpeed, unit),
				caption: `${windLabel(current.windSpeed)} · from ${compass(current.windDeg)}`,
				percent: current.windSpeed / 25 * 100,
				tone: "from-teal-400 to-emerald-300"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4" }),
				title: "UV index",
				value: uvKnown ? current.uvi.toFixed(1) : "n/a",
				caption: uvKnown ? uvLabel(current.uvi) : "Needs One Call API access",
				percent: uvKnown ? current.uvi / 12 * 100 : 0,
				tone: "from-amber-400 to-orange-400"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waves, { className: "h-4 w-4" }),
				title: "Air quality",
				value: air ? AQI_LABELS[air.index] ?? "—" : "—",
				caption: air ? `AQI ${air.index}/5 · PM2.5 ${Math.round(air.components["pm2_5"] ?? 0)} µg/m³` : "Unavailable",
				percent: air ? air.index / 5 * 100 : 0,
				tone: "from-lime-400 to-yellow-400"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "h-4 w-4" }),
				title: "Pressure",
				value: `${current.pressure} hPa`,
				caption: current.pressure > 1015 ? "High pressure — settled" : "Low pressure — changeable"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" }),
				title: "Visibility",
				value: `${(current.visibility / 1e3).toFixed(1)} km`,
				caption: current.visibility >= 1e4 ? "Clear and far-reaching" : "Reduced visibility"
			})
		]
	});
}
function HourlyForecast({ data, unit }) {
	const tz = data.location.timezoneOffset;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass p-5",
		"aria-labelledby": "hourly-heading",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			id: "hourly-heading",
			className: "text-sm font-semibold uppercase tracking-widest scene-muted",
			children: "Next hours"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 flex gap-3 overflow-x-auto pb-2",
			children: data.hourly.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex w-20 shrink-0 flex-col items-center gap-1 rounded-2xl bg-white/20 px-2 py-3 transition hover:bg-white/40 dark:bg-white/5 dark:hover:bg-white/10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs scene-muted",
						children: localHour(h.dt, tz)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: iconUrl(h.icon, 2),
						alt: h.description,
						loading: "lazy",
						width: 48,
						height: 48,
						className: "h-12 w-12"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold scene-text",
						children: formatTemp(h.temp, unit)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] text-sky-600 dark:text-sky-300",
						children: [Math.round(h.pop * 100), "%"]
					})
				]
			}, h.dt))
		})]
	});
}
function DailyForecast({ data, unit }) {
	const tz = data.location.timezoneOffset;
	const lo = Math.min(...data.daily.map((d) => d.min));
	const hi = Math.max(...data.daily.map((d) => d.max));
	const span = Math.max(1, hi - lo);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glass p-5",
		"aria-labelledby": "daily-heading",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			id: "daily-heading",
			className: "text-sm font-semibold uppercase tracking-widest scene-muted",
			children: [data.daily.length, "-day outlook"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 divide-y divide-white/20 dark:divide-white/10",
			children: data.daily.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "grid grid-cols-[3.2rem_2.5rem_minmax(0,1fr)] items-center gap-3 py-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium scene-text",
						children: i === 0 ? "Today" : localDay(d.dt, tz)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: iconUrl(d.icon, 2),
						alt: d.description,
						loading: "lazy",
						width: 40,
						height: 40,
						className: "h-10 w-10"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-10 shrink-0 text-right text-sm scene-muted",
								children: formatTemp(d.min, unit)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 min-w-0 flex-1 rounded-full bg-black/10 dark:bg-white/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-300 to-amber-400",
									style: {
										marginLeft: `${(d.min - lo) / span * 100}%`,
										width: `${Math.max(6, (d.max - d.min) / span * 100)}%`,
										transition: "width 0.8s ease, margin-left 0.8s ease"
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-10 shrink-0 text-sm font-semibold scene-text",
								children: formatTemp(d.max, unit)
							})
						]
					})
				]
			}, d.dt))
		})]
	});
}
/**
* Soft-content column: alerts, clothing suggestion, travel advice and a
* rotating weather fact.
*/
function Tip({ icon, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "glass glass-hover p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
			className: "flex items-center gap-2 text-sm font-semibold uppercase tracking-widest scene-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				children: icon
			}), title]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm leading-relaxed scene-text",
			children: body
		})]
	});
}
function AdvicePanel({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Advice and alerts",
		className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
		children: [
			data.alerts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass border-amber-400/60 bg-amber-200/40 p-5 sm:col-span-2 lg:col-span-3 dark:bg-amber-500/15",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
						className: "h-4 w-4",
						"aria-hidden": "true"
					}), "Weather alert"]
				}), data.alerts.slice(0, 2).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium scene-text",
						children: a.event
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 line-clamp-4 text-sm scene-muted",
						children: a.description
					})]
				}, `${a.event}-${a.start}`))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shirt, { className: "h-4 w-4" }),
				title: "What to wear",
				body: clothingAdvice(data.current.feelsLike, data.current.condition)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plane, { className: "h-4 w-4" }),
				title: "Travel advice",
				body: travelAdvice(data)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tip, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "h-4 w-4" }),
				title: "Did you know",
				body: weatherFact(data.current.dt / 3600)
			})
		]
	});
}
/**
* Skyglass — glassmorphic weather dashboard.
*
* Data flows one way: a query keyed by city/coords calls the `fetchWeather`
* server function (which hides the OpenWeatherMap key), and every panel reads
* from that single normalized bundle.
*/
function WeatherPage() {
	const load = useServerFn(fetchWeather);
	const [target, setTarget] = (0, import_react.useState)({ city: "London" });
	const [unit, setUnit] = (0, import_react.useState)("C");
	const [theme, setTheme] = (0, import_react.useState)("dark");
	const [locating, setLocating] = (0, import_react.useState)(false);
	const [geoError, setGeoError] = (0, import_react.useState)(null);
	const [favorites, setFavorites] = (0, import_react.useState)([]);
	const [recents, setRecents] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const prefs = getPrefs();
		setUnit(prefs.unit);
		setTheme(prefs.theme);
		setFavorites(getFavorites());
		setRecents(getRecents());
		if (prefs.lastCity) setTarget({
			lat: prefs.lastCity.lat,
			lon: prefs.lastCity.lon
		});
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);
	const key = "city" in target ? `city:${target.city}` : `geo:${target.lat},${target.lon}`;
	const query = useQuery({
		queryKey: ["weather", key],
		queryFn: () => load({ data: target }),
		staleTime: 3e5,
		refetchInterval: 3e5,
		retry: 1
	});
	const data = query.data;
	(0, import_react.useEffect)(() => {
		if (!data) return;
		const city = {
			name: data.location.name,
			country: data.location.country,
			lat: data.location.lat,
			lon: data.location.lon
		};
		savePrefs({ lastCity: city });
		setRecents(pushRecent(city));
	}, [data]);
	const setUnitPref = (0, import_react.useCallback)(() => {
		setUnit((u) => {
			const next = u === "C" ? "F" : "C";
			savePrefs({ unit: next });
			return next;
		});
	}, []);
	const setThemePref = (0, import_react.useCallback)(() => {
		setTheme((t) => {
			const next = t === "dark" ? "light" : "dark";
			savePrefs({ theme: next });
			return next;
		});
	}, []);
	const useLocation = (0, import_react.useCallback)(() => {
		setGeoError(null);
		if (!("geolocation" in navigator)) {
			setGeoError("Geolocation isn't supported in this browser.");
			return;
		}
		setLocating(true);
		navigator.geolocation.getCurrentPosition((pos) => {
			setLocating(false);
			setTarget({
				lat: pos.coords.latitude,
				lon: pos.coords.longitude
			});
		}, () => {
			setLocating(false);
			setGeoError("Location permission denied — search for a city instead.");
		}, { timeout: 1e4 });
	}, []);
	const currentCity = data ? {
		name: data.location.name,
		country: data.location.country,
		lat: data.location.lat,
		lon: data.location.lon
	} : null;
	const errorMessage = query.error instanceof Error ? query.error.message : query.error ? "Something went wrong." : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, { fallback: null }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudSun, {
						className: "h-7 w-7 shrink-0 text-sky-500 dark:text-sky-300",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-lg font-semibold tracking-tight scene-text",
						children: "Skyglass"
					}),
					query.isFetching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "ml-auto h-4 w-4 animate-spin scene-muted",
						"aria-label": "Loading weather"
					}),
					!query.isFetching && data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => query.refetch(),
						"aria-label": "Refresh weather",
						className: "ml-auto rounded-full p-2 scene-muted transition hover:bg-white/30",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
							className: "h-4 w-4",
							"aria-hidden": "true"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBar, {
				onSelectCity: (city) => setTarget({ city }),
				onSelectCoords: (lat, lon) => setTarget({
					lat,
					lon
				}),
				onUseLocation: useLocation,
				locating,
				unit,
				onToggleUnit: setUnitPref,
				theme,
				onToggleTheme: setThemePref,
				recents,
				favorites,
				onClearRecents: () => setRecents(clearRecents())
			}),
			(geoError || errorMessage) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "glass mt-4 flex items-start gap-3 border-destructive/40 p-4 text-sm scene-text",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "mt-0.5 h-5 w-5 shrink-0 text-destructive",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: geoError ?? errorMessage })]
			}),
			query.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass mt-6 flex h-64 flex-col items-center justify-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "h-8 w-8 animate-spin text-sky-500",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm scene-muted",
					children: "Fetching the latest conditions…"
				})]
			}),
			data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrentPanel, {
						data,
						unit,
						favorite: !!currentCity && isFavorite(currentCity, favorites),
						onToggleFavorite: () => currentCity && setFavorites(toggleFavorite(currentCity))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricsGrid, {
						data,
						unit
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HourlyForecast, {
						data,
						unit
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DailyForecast, {
							data,
							unit
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "glass p-5",
							"aria-labelledby": "map-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "map-heading",
								className: "text-sm font-semibold uppercase tracking-widest scene-muted",
								children: "On the map"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 overflow-hidden rounded-2xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, { fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-72 w-full animate-pulse rounded-2xl bg-white/20" }) })
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, { fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "glass h-64 animate-pulse" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvicePanel, { data }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TripPlanner, { data }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NearbyPlaces, { data }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "py-6 text-center text-xs scene-muted",
						children: ["Data from OpenWeatherMap · refreshed automatically every 5 minutes", data.source === "classic" && " · UV index and alerts need One Call 3.0 access"]
					})
				]
			})
		]
	})] });
}
//#endregion
export { WeatherPage as component };
