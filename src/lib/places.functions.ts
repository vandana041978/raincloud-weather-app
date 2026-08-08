import { createServerFn } from "@tanstack/react-start";

export type TouristPlace = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  distance: number;
  address?: string;
  rating?: number;
  website?: string;
  googleMapsUrl?: string;
};

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getPlaceType(types: string[] = []) {
  if (types.includes("hindu_temple")) {
    return "Temple";
  }

  if (types.includes("museum")) {
    return "Museum";
  }

  if (types.includes("art_gallery")) {
    return "Art Gallery";
  }

  if (types.includes("historical_landmark")) {
    return "Historical Landmark";
  }

  if (types.includes("park")) {
    return "Park";
  }

  if (types.includes("tourist_attraction")) {
    return "Tourist Attraction";
  }

  if (types.includes("castle")) {
    return "Castle";
  }

  return "Tourist Attraction";
}

export const getNearbyPlaces = createServerFn({ method: "GET" })
  .validator(
    (input: {
      latitude: number;
      longitude: number;
      radius?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      throw new Error(
        "GOOGLE_PLACES_API_KEY is missing from the .env file",
      );
    }

    const latitude = data.latitude;
    const longitude = data.longitude;
    const radius = Math.min(data.radius ?? 5000, 50000);

    console.log("🌍 Requesting Google nearby tourist places...");
    console.log(`📍 Location: ${latitude}, ${longitude}`);

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.location,places.types,places.formattedAddress,places.rating,places.websiteUri,places.googleMapsUri",
        },
        body: JSON.stringify({
          includedTypes: [
            "tourist_attraction",
            "museum",
            "art_gallery",
            "historical_landmark",
            "park",
            "castle",
          ],

          maxResultCount: 20,

          rankPreference: "DISTANCE",

          locationRestriction: {
            circle: {
              center: {
                latitude,
                longitude,
              },
              radius,
            },
          },

          languageCode: "en",
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        `❌ Google Places API error: HTTP ${response.status}`,
      );

      console.error(errorText);

      throw new Error(
        `Google Places API returned HTTP ${response.status}`,
      );
    }

    const result = await response.json();

    console.log(
      `✅ Google places received: ${result.places?.length ?? 0}`,
    );

    const places: TouristPlace[] = (result.places ?? [])
      .filter(
        (place: any) =>
          place.displayName?.text &&
          place.location?.latitude !== undefined &&
          place.location?.longitude !== undefined,
      )
      .map((place: any) => {
        const placeLat = place.location.latitude;
        const placeLon = place.location.longitude;

        const distance = calculateDistance(
          latitude,
          longitude,
          placeLat,
          placeLon,
        );

        return {
          id: place.id,
          name: place.displayName.text,
          type: getPlaceType(place.types),
          latitude: placeLat,
          longitude: placeLon,
          distance,
          address: place.formattedAddress,
          rating: place.rating,
          website: place.websiteUri,
          googleMapsUrl: place.googleMapsUri,
        };
      });

    places.sort((a, b) => a.distance - b.distance);

    return places.slice(0, 12);
  });