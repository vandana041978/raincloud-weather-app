import type { TouristPlace } from "@/lib/places.functions";
import type { WeatherBundle } from "@/lib/weather-types";

export type TripInterest =
  | "Temple"
  | "Nature"
  | "Museum"
  | "History"
  | "Art"
  | "Photography";

export type WeatherCategory =
  | "rain"
  | "wind"
  | "hot"
  | "good";

export type TravelStyle =
  | "relaxed"
  | "balanced"
  | "adventure";

export type TripScheduleItem = {
  placeId: string;
  time: string;
  weather: string;
};

export type TripDay = {
  day: number;
  places: TouristPlace[];
  schedule: TripScheduleItem[];
  weatherCategory: WeatherCategory;
  advice: string;
};


/* =========================================================
   INTEREST MATCHING
========================================================= */

export function matchesInterest(
  place: TouristPlace,
  interest: TripInterest,
): boolean {
  const type = place.type.toLowerCase();
  const name = place.name.toLowerCase();

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


/* =========================================================
   PLACE TYPE HELPERS
========================================================= */

function isIndoorPlace(place: TouristPlace): boolean {
  const type = place.type.toLowerCase();

  return (
    type.includes("museum") ||
    type.includes("art gallery") ||
    type.includes("gallery")
  );
}

function isOutdoorPlace(place: TouristPlace): boolean {
  const type = place.type.toLowerCase();

  return (
    type.includes("park") ||
    type.includes("garden") ||
    type.includes("temple") ||
    type.includes("castle") ||
    type.includes("historical") ||
    type.includes("tourist") ||
    type.includes("landmark")
  );
}


/* =========================================================
   WEATHER CATEGORY
========================================================= */

function getWeatherCategory(
  weather: WeatherBundle,
  dayIndex: number,
): WeatherCategory {
  const day = weather.daily?.[dayIndex] ?? weather.daily?.[0];

  if (!day) {
    return "good";
  }

  const description = String(
    day.description ?? "",
  ).toLowerCase();

  const rainProbability = Number(day.pop ?? 0);
  const windSpeed = Number(day.windSpeed ?? 0);
  const temperature = Number(day.max ?? 0);

  if (
    rainProbability >= 0.5 ||
    description.includes("rain") ||
    description.includes("drizzle") ||
    description.includes("storm")
  ) {
    return "rain";
  }

  if (windSpeed >= 12) {
    return "wind";
  }

  if (temperature >= 35) {
    return "hot";
  }

  return "good";
}


/* =========================================================
   WEATHER ADVICE
========================================================= */

function getWeatherAdvice(
  category: WeatherCategory,
): string {
  switch (category) {
    case "rain":
      return "🌧️ Rain is likely. Indoor attractions are prioritized.";

    case "wind":
      return "🌬️ Strong winds are possible. Safer sheltered locations are prioritized.";

    case "hot":
      return "🌡️ It may be hot. Outdoor activities are better during morning or evening.";

    default:
      return "☀️ Good conditions for sightseeing and outdoor activities.";
  }
}


/* =========================================================
   WEATHER-BASED SORTING
========================================================= */

function sortForWeather(
  places: TouristPlace[],
  category: WeatherCategory,
): TouristPlace[] {
  if (category === "rain") {
    return [
      ...places.filter(isIndoorPlace),
      ...places.filter(
        (place) => !isIndoorPlace(place),
      ),
    ];
  }

  if (category === "wind") {
    return [
      ...places.filter(isIndoorPlace),
      ...places.filter(
        (place) =>
          !isOutdoorPlace(place) &&
          !isIndoorPlace(place),
      ),
      ...places.filter(isOutdoorPlace),
    ];
  }

  if (category === "hot") {
    return [
      ...places.filter(
        (place) => !isIndoorPlace(place),
      ),
      ...places.filter(isIndoorPlace),
    ];
  }

  return [
    ...places.filter(isOutdoorPlace),
    ...places.filter(
      (place) => !isOutdoorPlace(place),
    ),
  ];
}


/* =========================================================
   FAMOUS / POPULAR PLACE RANKING
========================================================= */

function rankPlacesByPopularity(
  places: TouristPlace[],
): TouristPlace[] {
  return [...places].sort((a, b) => {
    /*
     * Google rating is the main factor.
     *
     * Example:
     * 4.8 rating → higher priority
     * 4.2 rating → lower priority
     */

    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;

    const ratingScoreA = ratingA * 20;
    const ratingScoreB = ratingB * 20;

    /*
     * Give nearby places a small bonus.
     * Rating remains much more important.
     */

    const distanceA = Math.max(
      0,
      10 - a.distance,
    );

    const distanceB = Math.max(
      0,
      10 - b.distance,
    );

    const scoreA =
      ratingScoreA + distanceA;

    const scoreB =
      ratingScoreB + distanceB;

    return scoreB - scoreA;
  });
}


/* =========================================================
   CREATE TIME SCHEDULE
========================================================= */

function createSchedule(
  places: TouristPlace[],
  weatherCategory: WeatherCategory,
): TripScheduleItem[] {
  const times = [
    "🌅 09:00 AM",
    "☀️ 01:00 PM",
    "🌇 05:30 PM",
    "🌙 07:30 PM",
  ];

  return places.map((place, index) => {
    let weatherMessage = "☀️ Good weather";

    if (weatherCategory === "rain") {
      weatherMessage =
        "🌧️ Rain expected";
    }

    if (weatherCategory === "wind") {
      weatherMessage =
        "🌬️ Windy conditions";
    }

    if (weatherCategory === "hot") {
      weatherMessage =
        "🌡️ Hot weather";
    }

    return {
      placeId: place.id,
      time:
        times[index] ??
        "🕐 Flexible time",
      weather: weatherMessage,
    };
  });
}


/* =========================================================
   GENERATE ITINERARY
========================================================= */

export function generateItinerary(
  places: TouristPlace[],
  days: number,
  selectedInterests: TripInterest[],
  weather: WeatherBundle,
  travelStyle: TravelStyle,
): TripDay[] {

  /*
   * STEP 1
   * Filter places according to selected interests.
   */

  let matchingPlaces =
    selectedInterests.length === 0
      ? places
      : places.filter((place) =>
          selectedInterests.some(
            (interest) =>
              matchesInterest(
                place,
                interest,
              ),
          ),
        );

  /*
   * If no place matches the selected
   * interests, use all available places.
   */

  if (matchingPlaces.length === 0) {
    matchingPlaces = places;
  }


  /*
   * STEP 2
   * Rank the places by popularity/rating.
   */

  const rankedPlaces =
    rankPlacesByPopularity(
      matchingPlaces,
    );


  /*
   * STEP 3
   * Decide how many places per day.
   */

  const placesPerDay =
    travelStyle === "relaxed"
      ? 2
      : travelStyle === "balanced"
        ? 3
        : 4;


  /*
   * STEP 4
   * Create each day.
   */

  const result: TripDay[] = [];

  for (
    let day = 0;
    day < days;
    day++
  ) {

    /*
     * Get weather for this day.
     */

    const weatherCategory =
      getWeatherCategory(
        weather,
        day,
      );


    /*
     * Arrange famous places according
     * to the weather.
     */

    let sortedPlaces =
      sortForWeather(
        rankedPlaces,
        weatherCategory,
      );


    /*
     * Remove duplicate places.
     */

    sortedPlaces = Array.from(
      new Map(
        sortedPlaces.map(
          (place) => [
            place.id,
            place,
          ],
        ),
      ).values(),
    );


    /*
     * Select places for this day.
     */

    const start =
      day * placesPerDay;

    const selectedPlaces =
      sortedPlaces.slice(
        start,
        start + placesPerDay,
      );


    /*
     * Create schedule.
     */

    const schedule =
      createSchedule(
        selectedPlaces,
        weatherCategory,
      );


    /*
     * Add the day to itinerary.
     */

    result.push({
      day: day + 1,
      places: selectedPlaces,
      schedule,
      weatherCategory,
      advice:
        getWeatherAdvice(
          weatherCategory,
        ),
    });
  }


  /*
   * Return complete itinerary.
   */

  return result;
}