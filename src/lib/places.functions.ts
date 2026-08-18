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
): number {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return R * c;
}

function getPlaceType(
  types: string[] = [],
): string {
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

  if (types.includes("castle")) {
    return "Castle";
  }

  if (types.includes("tourist_attraction")) {
    return "Tourist Attraction";
  }

  return "Tourist Attraction";
}

export const getNearbyPlaces = createServerFn({
  method: "GET",
})
  .validator(
    (input: {
      latitude: number;
      longitude: number;
      radius?: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    const apiKey =
      process.env["GOOGLE_PLACES_API_KEY"];

    if (!apiKey) {
      throw new Error(
        "GOOGLE_PLACES_API_KEY is missing from the .env file",
      );
    }

    const latitude = data.latitude;
    const longitude = data.longitude;

    /*
     * Maximum radius = 50 km
     */
    const radius = Math.min(
      data.radius ?? 50000,
      50000,
    );

    console.log(
      "🌍 Requesting Google nearby tourist places...",
    );

    console.log(
      `📍 Location: ${latitude}, ${longitude}`,
    );

    console.log(
      `📏 Radius: ${radius / 1000} km`,
    );

    /*
     * Tourist-related Google place types.
     */
    const includedTypes = [
      "tourist_attraction",
      "museum",
      "art_gallery",
      "historical_landmark",
      "park",
      "castle",
      "hindu_temple",
    ];

    /*
     * Store all places from both requests.
     */
    const allPlaces: any[] = [];

    /*
     * ------------------------------------------------
     * REQUEST 1
     * ------------------------------------------------
     */
    console.log("🔎 Google Places request 1...");

    try {
      const response1 = await fetch(
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
            includedTypes,

            maxResultCount: 20,

            rankPreference: "POPULARITY",

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

            regionCode: "IN",
          }),
        },
      );

      if (!response1.ok) {
        const errorText =
          await response1.text();

        console.error(
          `❌ Google Places request 1 failed: HTTP ${response1.status}`,
        );

        console.error(errorText);

        /*
         * If quota is exceeded, don't make
         * the second request.
         */
        if (response1.status === 429) {
          throw new Error(
            "Google Places API daily quota exceeded. Please try again after the quota resets.",
          );
        }
      } else {
        const result1 =
          await response1.json();

        console.log(
          `✅ Request 1 returned ${
            result1.places?.length ?? 0
          } places`,
        );

        if (result1.places) {
          allPlaces.push(
            ...result1.places,
          );
        }
      }
    } catch (error) {
      console.error(
        "❌ Error in Google Places request 1:",
        error,
      );

      /*
       * Re-throw quota errors.
       */
      if (
        error instanceof Error &&
        error.message.includes(
          "quota exceeded",
        )
      ) {
        throw error;
      }
    }

    /*
     * ------------------------------------------------
     * REQUEST 2
     * ------------------------------------------------
     *
     * We use the same area but DISTANCE ranking.
     * This often gives a different set of places
     * from the popularity-ranked request.
     */
    console.log("🔎 Google Places request 2...");

    try {
      const response2 = await fetch(
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
            includedTypes,

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

            regionCode: "IN",
          }),
        },
      );

      if (!response2.ok) {
        const errorText =
          await response2.text();

        console.error(
          `❌ Google Places request 2 failed: HTTP ${response2.status}`,
        );

        console.error(errorText);

        /*
         * Do not destroy successful results
         * from request 1.
         */
      } else {
        const result2 =
          await response2.json();

        console.log(
          `✅ Request 2 returned ${
            result2.places?.length ?? 0
          } places`,
        );

        if (result2.places) {
          allPlaces.push(
            ...result2.places,
          );
        }
      }
    } catch (error) {
      console.error(
        "❌ Error in Google Places request 2:",
        error,
      );
    }

    /*
     * ------------------------------------------------
     * REMOVE DUPLICATES
     * ------------------------------------------------
     */
    const uniquePlaces =
      new Map<string, any>();

    for (const place of allPlaces) {
      if (place?.id) {
        uniquePlaces.set(
          place.id,
          place,
        );
      }
    }

    console.log(
      `📚 Total unique Google places: ${uniquePlaces.size}`,
    );

    /*
     * ------------------------------------------------
     * CONVERT TO TouristPlace
     * ------------------------------------------------
     */
    const places: TouristPlace[] =
      Array.from(
        uniquePlaces.values(),
      )
        .filter(
          (place: any) =>
            place.displayName?.text &&
            place.location?.latitude !==
              undefined &&
            place.location?.longitude !==
              undefined,
        )
        .map((place: any) => {
          const placeLat =
            place.location.latitude;

          const placeLon =
            place.location.longitude;

          const distance =
            calculateDistance(
              latitude,
              longitude,
              placeLat,
              placeLon,
            );

          return {
            id: place.id,

            name: place.displayName.text,

            type: getPlaceType(
              place.types ?? [],
            ),

            latitude: placeLat,

            longitude: placeLon,

            distance,

            address:
              place.formattedAddress,

            rating:
              typeof place.rating ===
              "number"
                ? place.rating
                : undefined,

            website:
              place.websiteUri,

            googleMapsUrl:
              place.googleMapsUri,
          };
        })
        /*
         * Make sure places are actually
         * inside the requested radius.
         */
        .filter(
          (place) =>
            place.distance <=
            radius / 1000,
        );

    console.log(
      `📍 Final places inside radius: ${places.length}`,
    );

    /*
     * ------------------------------------------------
     * SORT
     * ------------------------------------------------
     *
     * Famous/high-rated places first.
     *
     * Rating is primary.
     * Distance is secondary.
     */
    places.sort((a, b) => {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;

      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }

      return (
        a.distance - b.distance
      );
    });

    /*
     * ------------------------------------------------
     * RETURN MAXIMUM 40
     * ------------------------------------------------
     */
    const finalPlaces =
      places.slice(0, 40);

    console.log(
      `🎯 Returning ${finalPlaces.length} tourist places`,
    );

    return finalPlaces;
  });