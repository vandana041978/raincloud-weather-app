/**
 * Search header: debounced city autocomplete, geolocation, unit and theme
 * toggles, plus recent-search and favourite chips.
 */
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  LocateFixed,
  MapPin,
  Moon,
  Search,
  Star,
  Sun,
  X,
} from "lucide-react";

import { searchCities } from "@/lib/weather.functions";
import type { CitySuggestion } from "@/lib/weather-types";
import type { SavedCity } from "@/lib/weather-storage";
import type { Unit } from "@/lib/weather-utils";

interface Props {
  onSelectCity: (city: string) => void;
  onSelectCoords: (lat: number, lon: number) => void;
  onUseLocation: () => void;
  locating: boolean;
  unit: Unit;
  onToggleUnit: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  recents: SavedCity[];
  favorites: SavedCity[];
  onClearRecents: () => void;
}

export function SearchBar({
  onSelectCity,
  onSelectCoords,
  onUseLocation,
  locating,
  unit,
  onToggleUnit,
  theme,
  onToggleTheme,
  recents,
  favorites,
  onClearRecents,
}: Props) {
  const lookup = useServerFn(searchCities);

  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const boxRef = useRef<HTMLFormElement>(null);

  // Debounced city autocomplete
  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setOptions([]);
      setOpen(false);
      return;
    }

    let cancelled = false;

    const id = window.setTimeout(async () => {
      try {
        const rows = await lookup({ data: { query: q } });

        if (!cancelled) {
          setOptions(rows);
          setOpen(rows.length > 0);
          setActive(-1);
        }
      } catch (error) {
        console.error("City search failed:", error);

        if (!cancelled) {
          setOptions([]);
          setOpen(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [query, lookup]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        boxRef.current &&
        !boxRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  const choose = (city: CitySuggestion) => {
    setQuery("");
    setOpen(false);
    setActive(-1);

    onSelectCoords(city.lat, city.lon);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const picked =
      active >= 0 ? options[active] : undefined;

    if (picked) {
      choose(picked);
      return;
    }

    const city = query.trim();

    if (city) {
      onSelectCity(city);
      setQuery("");
      setOpen(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      if (options.length === 0) return;

      e.preventDefault();

      setOpen(true);

      setActive((index) =>
        index < options.length - 1 ? index + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      if (options.length === 0) return;

      e.preventDefault();

      setOpen(true);

      setActive((index) =>
        index > 0 ? index - 1 : options.length - 1
      );
    }

    if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div className="w-full space-y-3">

      {/* =====================================================
          SEARCH BAR
          ===================================================== */}
      <form
        ref={boxRef}
        role="search"
        onSubmit={submit}
        className="relative w-full"
      >
        <div className="glass flex w-full items-center gap-2 px-4 py-2.5">

          {/* Search icon */}
          <Search
            className="h-5 w-5 shrink-0 scene-muted"
            aria-hidden="true"
          />

          {/* Search input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => {
              if (options.length > 0) {
                setOpen(true);
              }
            }}
            placeholder="Search any city…"
            aria-label="Search weather by city"
            role="combobox"
            aria-expanded={open}
            aria-controls="city-options"
            aria-autocomplete="list"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-base scene-text outline-none placeholder:opacity-60"
          />

          {/* Clear search */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setOptions([]);
                setOpen(false);
              }}
              aria-label="Clear search"
              className="shrink-0 rounded-full p-1 scene-muted transition hover:bg-white/30"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* My Location - at the END of search bar */}
          <button
            type="button"
            onClick={onUseLocation}
            aria-label="Use my location"
            title="Use my location"
            className="shrink-0 rounded-full p-1.5 scene-muted transition hover:bg-white/30"
          >
            {locating ? (
              <Loader2
                className="h-5 w-5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <LocateFixed
                className="h-5 w-5"
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        {/* =====================================================
            CITY AUTOCOMPLETE
            ===================================================== */}
        {open && options.length > 0 && (
          <ul
            id="city-options"
            role="listbox"
            className="glass absolute z-30 mt-2 w-full overflow-hidden p-1"
          >
            {options.map((city, index) => (
              <li
                key={`${city.lat}-${city.lon}-${index}`}
                role="option"
                aria-selected={index === active}
              >
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(city)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm scene-text transition ${
                    index === active
                      ? "bg-white/40 dark:bg-white/10"
                      : ""
                  }`}
                >
                  <MapPin
                    className="h-4 w-4 shrink-0 opacity-70"
                    aria-hidden="true"
                  />

                  <span className="truncate">
                    {city.name}
                    {city.state
                      ? `, ${city.state}`
                      : ""}{" "}
                    · {city.country}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      {/* =====================================================
          TEMPERATURE + THEME
          Below search bar, aligned to the right
          ===================================================== */}
      <div className="flex items-center justify-end gap-2">

        {/* Temperature */}
        <button
          type="button"
          onClick={onToggleUnit}
          aria-label={`Switch to ${
            unit === "C" ? "Fahrenheit" : "Celsius"
          }`}
          title={`Switch to ${
            unit === "C" ? "Fahrenheit" : "Celsius"
          }`}
          className="glass glass-hover px-3.5 py-2.5 text-sm font-semibold scene-text"
        >
          °{unit}
        </button>

        {/* Theme */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${
            theme === "dark" ? "light" : "dark"
          } mode`}
          title={`Switch to ${
            theme === "dark" ? "light" : "dark"
          } mode`}
          className="glass glass-hover p-2.5 scene-text"
        >
          {theme === "dark" ? (
            <Sun
              className="h-5 w-5"
              aria-hidden="true"
            />
          ) : (
            <Moon
              className="h-5 w-5"
              aria-hidden="true"
            />
          )}
        </button>
      </div>

     
      
    </div>
  );
}

export default SearchBar;