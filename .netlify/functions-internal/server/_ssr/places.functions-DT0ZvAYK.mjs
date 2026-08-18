import { n as createServerFn } from "./server-XwFdOTTz.mjs";
import { t as createServerRpc } from "./createServerRpc-BSIAthD8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/places.functions-DT0ZvAYK.js
function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371;
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
	return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
function getPlaceType(types = []) {
	if (types.includes("hindu_temple")) return "Temple";
	if (types.includes("museum")) return "Museum";
	if (types.includes("art_gallery")) return "Art Gallery";
	if (types.includes("historical_landmark")) return "Historical Landmark";
	if (types.includes("park")) return "Park";
	if (types.includes("castle")) return "Castle";
	if (types.includes("tourist_attraction")) return "Tourist Attraction";
	return "Tourist Attraction";
}
var getNearbyPlaces_createServerFn_handler = createServerRpc({
	id: "6e651eb38ef3e8d82919e1b499b29279adcd73b23082e0b69e58df1ad86662b7",
	name: "getNearbyPlaces",
	filename: "src/lib/places.functions.ts"
}, (opts) => getNearbyPlaces.__executeServer(opts));
var getNearbyPlaces = createServerFn({ method: "GET" }).validator((input) => input).handler(getNearbyPlaces_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env["GOOGLE_PLACES_API_KEY"];
	if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY is missing from the .env file");
	const latitude = data.latitude;
	const longitude = data.longitude;
	const radius = Math.min(data.radius ?? 5e4, 5e4);
	console.log("🌍 Requesting Google nearby tourist places...");
	console.log(`📍 Location: ${latitude}, ${longitude}`);
	console.log(`📏 Radius: ${radius / 1e3} km`);
	const includedTypes = [
		"tourist_attraction",
		"museum",
		"art_gallery",
		"historical_landmark",
		"park",
		"castle",
		"hindu_temple"
	];
	const allPlaces = [];
	console.log("🔎 Google Places request 1...");
	try {
		const response1 = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Api-Key": apiKey,
				"X-Goog-FieldMask": "places.id,places.displayName,places.location,places.types,places.formattedAddress,places.rating,places.websiteUri,places.googleMapsUri"
			},
			body: JSON.stringify({
				includedTypes,
				maxResultCount: 20,
				rankPreference: "POPULARITY",
				locationRestriction: { circle: {
					center: {
						latitude,
						longitude
					},
					radius
				} },
				languageCode: "en",
				regionCode: "IN"
			})
		});
		if (!response1.ok) {
			const errorText = await response1.text();
			console.error(`❌ Google Places request 1 failed: HTTP ${response1.status}`);
			console.error(errorText);
			if (response1.status === 429) throw new Error("Google Places API daily quota exceeded. Please try again after the quota resets.");
		} else {
			const result1 = await response1.json();
			console.log(`✅ Request 1 returned ${result1.places?.length ?? 0} places`);
			if (result1.places) allPlaces.push(...result1.places);
		}
	} catch (error) {
		console.error("❌ Error in Google Places request 1:", error);
		if (error instanceof Error && error.message.includes("quota exceeded")) throw error;
	}
	console.log("🔎 Google Places request 2...");
	try {
		const response2 = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Api-Key": apiKey,
				"X-Goog-FieldMask": "places.id,places.displayName,places.location,places.types,places.formattedAddress,places.rating,places.websiteUri,places.googleMapsUri"
			},
			body: JSON.stringify({
				includedTypes,
				maxResultCount: 20,
				rankPreference: "DISTANCE",
				locationRestriction: { circle: {
					center: {
						latitude,
						longitude
					},
					radius
				} },
				languageCode: "en",
				regionCode: "IN"
			})
		});
		if (!response2.ok) {
			const errorText = await response2.text();
			console.error(`❌ Google Places request 2 failed: HTTP ${response2.status}`);
			console.error(errorText);
		} else {
			const result2 = await response2.json();
			console.log(`✅ Request 2 returned ${result2.places?.length ?? 0} places`);
			if (result2.places) allPlaces.push(...result2.places);
		}
	} catch (error) {
		console.error("❌ Error in Google Places request 2:", error);
	}
	const uniquePlaces = /* @__PURE__ */ new Map();
	for (const place of allPlaces) if (place?.id) uniquePlaces.set(place.id, place);
	console.log(`📚 Total unique Google places: ${uniquePlaces.size}`);
	const places = Array.from(uniquePlaces.values()).filter((place) => place.displayName?.text && place.location?.latitude !== void 0 && place.location?.longitude !== void 0).map((place) => {
		const placeLat = place.location.latitude;
		const placeLon = place.location.longitude;
		const distance = calculateDistance(latitude, longitude, placeLat, placeLon);
		return {
			id: place.id,
			name: place.displayName.text,
			type: getPlaceType(place.types ?? []),
			latitude: placeLat,
			longitude: placeLon,
			distance,
			address: place.formattedAddress,
			rating: typeof place.rating === "number" ? place.rating : void 0,
			website: place.websiteUri,
			googleMapsUrl: place.googleMapsUri
		};
	}).filter((place) => place.distance <= radius / 1e3);
	console.log(`📍 Final places inside radius: ${places.length}`);
	places.sort((a, b) => {
		const ratingA = a.rating ?? 0;
		const ratingB = b.rating ?? 0;
		if (ratingB !== ratingA) return ratingB - ratingA;
		return a.distance - b.distance;
	});
	const finalPlaces = places.slice(0, 40);
	console.log(`🎯 Returning ${finalPlaces.length} tourist places`);
	return finalPlaces;
});
//#endregion
export { getNearbyPlaces_createServerFn_handler };
