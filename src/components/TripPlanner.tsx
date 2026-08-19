import { useEffect, useMemo, useState } from "react";
import {
  getNearbyPlaces,
  type TouristPlace,
} from "@/lib/places.functions";
import type { WeatherBundle } from "@/lib/weather-types";

import {
  generateItinerary,
  type TripInterest,
  type TravelStyle,
} from "@/lib/tripPlanner";

type Interest =
  | "Temple"
  | "Nature"
  | "Museum"
  | "History"
  | "Art"
  | "Photography";

const interests: {
  value: Interest;
  label: string;
  icon: string;
}[] = [
  { value: "Temple", label: "Temples", icon: "🛕" },
  { value: "Nature", label: "Nature", icon: "🌳" },
  { value: "Museum", label: "Museums", icon: "🏛️" },
  { value: "History", label: "Historical", icon: "🏰" },
  { value: "Art", label: "Art", icon: "🎨" },
  { value: "Photography", label: "Photography", icon: "📸" },
];

function matchesInterest(
  place: TouristPlace,
  interest: Interest,
) {
  const type = String(place.type ?? "").toLowerCase();
  const name = String(place.name ?? "").toLowerCase();

  switch (interest) {
    case "Temple":
      return (
        type.includes("temple") ||
        type.includes("shrine") ||
        name.includes("temple") ||
        name.includes("mandir") ||
        name.includes("devasthanam") ||
        name.includes("devalayam")
      );

    case "Nature":
      return (
        type.includes("park") ||
        type.includes("garden") ||
        type.includes("nature")
      );

    case "Museum":
      return type.includes("museum");

    case "History":
      return (
        type.includes("historical") ||
        type.includes("castle") ||
        type.includes("landmark")
      );

    case "Art":
      return (
        type.includes("art") ||
        type.includes("gallery")
      );

    case "Photography":
      return (
        type.includes("park") ||
        type.includes("garden") ||
        type.includes("historical") ||
        type.includes("castle") ||
        type.includes("landmark")
      );

    default:
      return false;
  }
}

function getIcon(type: string) {
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

function getWeatherAdvice(data: WeatherBundle) {
  const description =
    data.current?.description?.toLowerCase() ?? "";

  if (
    description.includes("rain") ||
    description.includes("drizzle") ||
    description.includes("storm")
  ) {
    return {
      title: "🌧️ Rain-aware plan",
      message:
        "Rain may affect outdoor activities. Indoor attractions are prioritized where possible.",
    };
  }

  if (description.includes("cloud")) {
    return {
      title: "☁️ Comfortable outdoor weather",
      message:
        "Cloudy conditions are suitable for sightseeing and photography.",
    };
  }

  if (
    description.includes("clear") ||
    description.includes("sun")
  ) {
    return {
      title: "☀️ Great outdoor conditions",
      message:
        "Clear weather is suitable for parks, temples, landmarks and photography.",
    };
  }

  return {
    title: "🌤️ Balanced itinerary",
    message:
      "The itinerary is organized around your selected interests and nearby places.",
  };
}

export function TripPlanner({
  data,
}: {
  data: WeatherBundle;
}) {
  const [days, setDays] = useState(2);

  const [budget, setBudget] = useState(2000);

  const [travelStyle, setTravelStyle] =
    useState<TravelStyle>("balanced");

  const [selectedInterests, setSelectedInterests] =
    useState<Interest[]>([
      "Nature",
      "Photography",
    ]);

  const [places, setPlaces] =
    useState<TouristPlace[]>([]);

  const [loading, setLoading] = useState(false);

  const [generated, setGenerated] =
    useState(false);

  const weatherAdvice = getWeatherAdvice(data);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaces() {
      try {
        setLoading(true);

        const result = await getNearbyPlaces({
          data: {
            latitude: data.location.lat,
            longitude: data.location.lon,
            radius: 50000,
          },
        });

        if (!cancelled) {
          setPlaces(result);
        }
      } catch (error) {
        console.error(
          "Trip planner places error:",
          error,
        );

        if (!cancelled) {
          setPlaces([]);
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

  const toggleInterest = (
    interest: Interest,
  ) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter(
            (item) => item !== interest,
          )
        : [...current, interest],
    );

    setGenerated(false);
  };

  const recommendedPlaces = useMemo(() => {
    if (selectedInterests.length === 0) {
      return places;
    }

    const matched = places.filter((place) =>
      selectedInterests.some((interest) =>
        matchesInterest(place, interest),
      ),
    );

    return matched.length > 0
      ? matched
      : places;
  }, [
    places,
    selectedInterests,
  ]);

  /*
   * Generate itinerary
   */
  const itinerary = useMemo(() => {
    if (
      !generated ||
      recommendedPlaces.length === 0
    ) {
      return [];
    }

    return generateItinerary(
      recommendedPlaces,
      days,
      selectedInterests as TripInterest[],
      data,
      travelStyle,
    );
  }, [
    generated,
    recommendedPlaces,
    days,
    selectedInterests,
    data,
    travelStyle,
  ]);

  /*
   * Budget calculation
   */
  const budgetEstimate = useMemo(() => {
    const totalPlaces = itinerary.reduce(
      (total, day) =>
        total + day.places.length,
      0,
    );

    const transport = totalPlaces * 100;
    const food = days * 300;
    const entryFees = totalPlaces * 50;

    const total =
      transport +
      food +
      entryFees;

    return {
      transport,
      food,
      entryFees,
      total,
      remaining: budget - total,
    };
  }, [
    itinerary,
    days,
    budget,
  ]);

  return (
    <section className="glass mt-6 p-5">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">
            🧳
          </span>

          <div>
            <h2 className="text-lg font-semibold">
              Smart Trip Planner
            </h2>

            <p className="text-xs text-muted-foreground">
              Create a personalized trip
              around {data.location.name}
            </p>
          </div>
        </div>
      </div>

      {/* Trip Duration */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">
          📅 Trip duration
        </label>

        <select
          value={days}
          onChange={(event) => {
            setDays(
              Number(event.target.value),
            );
            setGenerated(false);
          }}
          className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm outline-none"
        >
          <option value={1}>
            1 Day
          </option>

          <option value={2}>
            2 Days
          </option>

          <option value={3}>
            3 Days
          </option>

          <option value={4}>
            4 Days
          </option>

          <option value={5}>
            5 Days
          </option>
        </select>
      </div>

      {/* Travel Style */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium">
          🧳 Travel Style
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              setTravelStyle("relaxed");
              setGenerated(false);
            }}
            className={`rounded-xl border p-4 text-left transition ${
              travelStyle === "relaxed"
                ? "border-Sky-400/50 bg-Sky-400/20"
                : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
            }`}
          >
            <div className="text-xl">
              🧘
            </div>

            <div className="mt-1 text-sm font-semibold">
              Relaxed
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              1–2 places per day
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setTravelStyle("balanced");
              setGenerated(false);
            }}
            className={`rounded-xl border p-4 text-left transition ${
              travelStyle === "balanced"
                ? "border-Sky-400/50 bg-Sky-400/20"
                : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
            }`}
          >
            <div className="text-xl">
              ⚖️
            </div>

            <div className="mt-1 text-sm font-semibold">
              Balanced
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              3 places per day
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setTravelStyle("adventure");
              setGenerated(false);
            }}
            className={`rounded-xl border p-4 text-left transition ${
              travelStyle === "adventure"
                ? "border-Sky-400/50 bg-Sky-400/20"
                : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
            }`}
          >
            <div className="text-xl">
              🏃
            </div>

            <div className="mt-1 text-sm font-semibold">
              Adventure
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              4+ places per day
            </div>
          </button>
        </div>
      </div>

      {/* Budget */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">
          💰 Trip Budget
        </label>

        <input
          type="number"
          min="0"
          value={budget}
          onChange={(event) => {
            setBudget(
              Number(event.target.value),
            );
            setGenerated(false);
          }}
          className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm outline-none"
          placeholder="Enter your budget"
        />
      </div>

      {/* Interests */}
      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium">
          ❤️ What are you interested in?
        </label>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {interests.map(
            (interest) => {
              const selected =
                selectedInterests.includes(
                  interest.value,
                );

              return (
                <button
                  key={interest.value}
                  type="button"
                  onClick={() =>
                    toggleInterest(
                      interest.value,
                    )
                  }
                  className={`rounded-xl border p-3 text-left text-sm transition ${
                    selected
                      ? "border-Sky-400/50 bg-Sky-400/20"
                      : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                  }`}
                >
                  <span className="mr-2">
                    {interest.icon}
                  </span>

                  {interest.label}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Weather */}
      <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm font-semibold">
          {weatherAdvice.title}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {weatherAdvice.message}
        </p>
      </div>

      {/* Generate */}
      <button
        type="button"
        disabled={
          loading ||
          places.length === 0
        }
        onClick={() =>
          setGenerated(true)
        }
        className="w-full rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "🔎 Finding nearby places..."
          : "✨ Generate My Trip"}
      </button>

      {/* Results */}
      {generated && (
        <div className="mt-8">
          <div className="mb-5">
            <h3 className="text-base font-semibold">
              🗺️ Your {days}-Day Trip
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Personalized itinerary for{" "}
              {data.location.name}
            </p>
          </div>

          {/* Budget Estimate */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <h4 className="text-sm font-semibold">
              💰 Budget Estimate
            </h4>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>
                  🚗 Transport
                </span>

                <span>
                  ₹{budgetEstimate.transport}
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  🍴 Food
                </span>

                <span>
                  ₹{budgetEstimate.food}
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  🎟️ Entry fees
                </span>

                <span>
                  ₹{budgetEstimate.entryFees}
                </span>
              </div>

              <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold">
                <span>
                  💰 Estimated total
                </span>

                <span>
                  ₹{budgetEstimate.total}
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Your budget
                </span>

                <span>
                  ₹{budget}
                </span>
              </div>

              <div
                className={
                  budgetEstimate.remaining >=
                  0
                    ? "font-semibold text-green-400"
                    : "font-semibold text-red-400"
                }
              >
                {budgetEstimate.remaining >=
                0
                  ? `✅ ₹${budgetEstimate.remaining} remaining`
                  : `⚠️ ₹${Math.abs(
                      budgetEstimate.remaining,
                    )} over budget`}
              </div>
            </div>
          </div>

          {/* No results */}
          {itinerary.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Not enough matching places
              were found.
            </p>
          )}

          {/* Days */}
          <div className="space-y-5">
            {itinerary.map(
              (day) => (
                <div
                  key={day.day}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <h4 className="mb-2 font-semibold">
                    📅 Day {day.day}
                  </h4>

                  {/* Weather advice */}
                  <p className="mb-4 text-xs text-muted-foreground">
                    {day.advice}
                  </p>

                  {day.places.length ===
                  0 ? (
                    <p className="text-xs text-muted-foreground">
                      No additional places
                      found for this day.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {day.places.map(
                        (
                          place,
                          index,
                        ) => {
                          const scheduleItem =
                            day.schedule?.[
                              index
                            ];

                          return (
                            <div
                              key={
                                place.id
                              }
                              className="flex gap-3 rounded-xl border border-white/10 bg-black/10 p-3"
                            >
                              <div className="text-2xl">
                                {getIcon(
                                  place.type,
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-sky-300">
                                  {scheduleItem?.time ??
                                    "🕐 Flexible time"}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  {typeof scheduleItem?.weather ===
                                  "string"
                                    ? scheduleItem.weather
                                    : "🌤️ Weather unavailable"}
                                </p>

                                <h5 className="mt-1 text-sm font-semibold">
                                  {place.name}
                                </h5>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  {place.type}

                                  {place.distance !==
                                    undefined &&
                                    ` • ${place.distance.toFixed(
                                      1,
                                    )} km away`}
                                </p>

                                {place.rating !==
                                  undefined && (
                                  <p className="mt-1 text-xs">
                                    ⭐{" "}
                                    {place.rating.toFixed(
                                      1,
                                    )}
                                  </p>
                                )}

                                <a
                                  href={
                                    place.googleMapsUrl ??
                                    `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-block text-xs text-sky-300 hover:underline"
                                >
                                  🧭 Get Directions →
                                </a>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}