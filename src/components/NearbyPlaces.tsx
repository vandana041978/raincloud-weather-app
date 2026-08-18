import { useEffect, useState } from "react";
import {
  getNearbyPlaces,
  type TouristPlace,
} from "@/lib/places.functions";
import type { WeatherBundle } from "@/lib/weather-types";

function getPlaceIcon(type: string) {
  switch (type) {
    case "College":
      return "🎓";

    case "Temple":
      return "🛕";

    case "Museum":
      return "🏛️";

    case "Art Gallery":
      return "🎨";

    case "Historical Landmark":
      return "🏛️";

    case "Castle":
      return "🏰";

    case "Park":
      return "🌳";

    case "Tourist Attraction":
      return "📍";

    default:
      return "📍";
  }
}

function getDistanceText(distance: number) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1)} km`;
}

export function NearbyPlaces({
  data,
}: {
  data: WeatherBundle;
}) {
  const [places, setPlaces] = useState<TouristPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlaces() {
      try {
        setLoading(true);
        setError("");

        console.log("🌍 Loading nearby tourist places...");
        console.log(
          "📍 Location:",
          data.location.lat,
          data.location.lon,
        );

        const result = await getNearbyPlaces({
          data: {
            latitude: data.location.lat,
            longitude: data.location.lon,

            // 50 km radius
            radius: 50000,
          },
        });

        console.log(
          "📦 PLACES RECEIVED IN FRONTEND:",
          result.length,
        );

        console.log(
          "📍 RECEIVED PLACES:",
          result,
        );

        if (!cancelled) {
          setPlaces(result);
        }
      } catch (err) {
        console.error(
          "❌ Nearby places error:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to find nearby tourist places.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPlaces();

    return () => {
      cancelled = true;
    };
  }, [
    data.location.lat,
    data.location.lon,
  ]);

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-5">

      {/* HEADER */}
      <div className="mb-5">
        <h2 className="text-base font-semibold">
          📍 Nearby Tourist Places
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Famous places near {data.location.name}
        </p>

        {!loading && !error && places.length > 0 && (
          <p className="mt-2 text-xs text-sky-300">
            ⭐ {places.length} tourist places found within 50 km
          </p>
        )}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          🔎 Finding nearby tourist places...
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="py-10 text-center text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* NO PLACES */}
      {!loading &&
        !error &&
        places.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No tourist places found nearby.
          </div>
        )}

      {/* PLACES */}
      {!loading &&
        !error &&
        places.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {places.map((place) => (
              <div
                key={place.id}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]"
              >

                {/* ICON */}
                <div className="mb-3 text-3xl">
                  {getPlaceIcon(place.type)}
                </div>

                {/* NAME */}
                <h3 className="line-clamp-2 text-sm font-semibold">
                  {place.name}
                </h3>

                {/* TYPE */}
                <p className="mt-1 text-xs text-muted-foreground">
                  {place.type}
                </p>

                {/* DISTANCE */}
                <p className="mt-2 text-xs">
                  📏 {getDistanceText(place.distance)}
                </p>

                {/* RATING */}
                {place.rating !== undefined && (
                  <p className="mt-1 text-xs">
                    ⭐ {place.rating.toFixed(1)}
                  </p>
                )}

                {/* ADDRESS */}
                {place.address && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {place.address}
                  </p>
                )}

                {/* BUTTONS */}
                <div className="mt-4 flex gap-2">

                  {/* DIRECTIONS */}
                  <a
                    href={
                      place.googleMapsUrl ??
                      `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:bg-white/10"
                  >
                    🧭 Directions
                  </a>

                  {/* WEBSITE */}
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:bg-white/10"
                    >
                      🌐 Website
                    </a>
                  )}

                </div>
              </div>
            ))}

          </div>
        )}

      {/* FOOTER */}
      <p className="mt-5 text-[10px] text-muted-foreground">
        Places provided by Google Maps Platform.
      </p>

    </section>
  );
}